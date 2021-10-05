import {
  setGenericPassword,
  getGenericPassword,
  resetGenericPassword
} from 'react-native-keychain';

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
export { call, authenticate };
