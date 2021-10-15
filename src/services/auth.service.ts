import {
  setGenericPassword,
  getGenericPassword,
  resetGenericPassword
} from 'react-native-keychain';
import RNFetchBlob from 'rn-fetch-blob';

import type { Authenticate, Call } from '../interfaces/service.interfaces';

import { utils } from '../utils';

let token = '';

const authenticate: Authenticate = async function (email, password, purchases) {
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
          ...(purchases ? purchases : {})
        })
      })
    ).json();

    if (res.token) {
      token = `Bearer ${res.token}`;
      await setGenericPassword(email, password);
      handleLastAccessDate(res.edgeExpirationDate, res.isPackOlyOwner);
    } else await resetGenericPassword().catch(() => {});
    return res;
  } catch (error: any) {
    await resetGenericPassword().catch(() => {});
    throw new Error(error.message);
  }
};

const call: Call = async function ({ url, method, signal, body }) {
  try {
    let response = await fetch(
      url.includes(utils.rootUrl) ? url : utils.rootUrl + url,
      {
        method: method || 'GET',
        headers: body
          ? { Authorization: token }
          : {
              Authorization: token,
              'Content-Type': 'application/json'
            },
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

export { call, authenticate };
