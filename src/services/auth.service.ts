import RNIap, { ProductPurchase, SubscriptionPurchase } from 'react-native-iap';
import {
  setGenericPassword,
  getGenericPassword,
  resetGenericPassword
} from 'react-native-keychain';
import RNFetchBlob from 'rn-fetch-blob';

import type { Authenticate, Call } from '../interfaces/service.interfaces';

import { utils } from '../utils';

let token = '';
let purchases: (ProductPurchase | SubscriptionPurchase)[];

const authenticate: Authenticate = async function (email, password) {
  try {
    if (!email || !password) {
      let cred = await getGenericPassword();
      if (cred) {
        email = cred.username;
        password = cred.password;
      } else throw new Error('login needed');
    }
    let res = await (
      await fetch(`${utils.rootUrl}/musora-api/login`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          ...(await getPurchases())
        })
      })
    ).json();

    if (res.token) {
      await saveCreds(email, password, res.token);
      handleLastAccessDate(res.edgeExpirationDate, res.isPackOlyOwner);
    } else await resetGenericPassword().catch(() => {});
    return res;
  } catch (error: any) {
    await resetGenericPassword().catch(() => {});
    throw new Error(error.message);
  }
};

const saveCreds = async (email: string, password: string, tkn: string) => {
  token = `Bearer ${tkn}`;
  await setGenericPassword(email, password);
};

const call: Call = async function ({ url, method, signal, body }) {
  let newUrl = url;
  if (!url.includes('https')) {
    newUrl = url.replace('http', 'https');
  }
  try {
    let response = await fetch(
      newUrl.includes(utils.rootUrl) ? newUrl : utils.rootUrl + newUrl,
      {
        method: method || 'GET',
        headers: body
          ? { Authorization: token, 'Content-Type': 'application/json' }
          : { Authorization: token },
        ...(signal ? { signal } : null),
        ...(body
          ? body instanceof FormData
            ? { body }
            : { body: JSON.stringify(body) }
          : null)
      }
    );
    if (response.status === 204) return {};
    let json = await response.json();

    if (json.error?.match(/^(TOKEN_EXPIRED|Token not provided)$/)) {
      await authenticate();
      return call({ url, method, signal, body });
    } else return json;
  } catch (error: any) {
    if (error.toString() === 'AbortError: Aborted') return;
    return utils.serverDownError;
  }
};

const validatePreSignup: (
  purchases: {
    purchase_token?: string;
    package_name?: string;
    product_id?: string;
    transactionReceipt?: string;
    productId?: string;
    purchaseToken?: string;
  }[]
) => Promise<{ message: string; shouldSignup: boolean; shouldRenew: boolean }> =
  purchases => {
    return call({
      url: `/api/${utils.isiOS ? 'apple' : 'google'}/signup`,
      method: 'POST',
      body: utils.isiOS
        ? { receipt: purchases[0].transactionReceipt }
        : { purchases }
    });
  };

const validateEmail: (
  email: string
) => Promise<{ exists?: boolean; message?: string; title?: string }> =
  email => {
    return call({ url: `/usora/api/is-email-unique?email=${email}` });
  };

const validatePurchase: (formData: FormData) => Promise<{ token?: string }> =
  formData => {
    return call({
      url: `/mobile-app/${
        utils.isiOS ? 'apple' : 'google'
      }/verify-receipt-and-process-payment`,
      method: 'POST',
      body: formData
    });
  };

const restorePurchase: () => Promise<{
  shouldLogin?: boolean;
  email?: string;
  shouldCreateAccount?: boolean;
}> = async () => {
  return call({
    url: `/api/${utils.isiOS ? 'apple' : 'google'}/restore`,
    method: 'POST',
    body: await getPurchases()
  });
};

const handleLastAccessDate = async (
  edgeExpirationDate: string,
  isPackOnly: boolean
) => {
  let lastAccessDate;
  try {
    lastAccessDate = JSON.parse(
      await RNFetchBlob.fs.readFile(`${utils.offPath}/lastAccessDate`, 'utf8')
    );
  } catch (e) {}
  try {
    if (
      (lastAccessDate && new Date(lastAccessDate) < new Date()) ||
      !lastAccessDate
    ) {
      RNFetchBlob.fs.writeFile(
        `${utils.offPath}/lastAccessDate`,
        JSON.stringify(new Date().toString()),
        'utf8'
      );
    }
    if (!isPackOnly && edgeExpirationDate) {
      try {
        RNFetchBlob.fs.writeFile(
          `${utils.offPath}/edgeExpirationDate`,
          JSON.stringify(edgeExpirationDate),
          'utf8'
        );
      } catch (e) {}
    }
  } catch (e) {}
};

const getPurchases = async () => {
  if (!purchases)
    purchases = (await RNIap.getPurchaseHistory()).filter(h =>
      utils.subscriptionsSkus.includes(h.productId)
    );
  return utils.isiOS
    ? { receipt: purchases[0]?.transactionReceipt }
    : {
        purchases: purchases.map(m => ({
          purchase_token: m.purchaseToken,
          package_name: 'com.drumeo',
          product_id: m.productId
        }))
      };
};

export {
  call,
  authenticate,
  validatePreSignup,
  validateEmail,
  validatePurchase,
  saveCreds,
  getPurchases,
  restorePurchase
};
