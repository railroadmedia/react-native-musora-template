import {
  setGenericPassword,
  getGenericPassword,
  resetGenericPassword
} from 'react-native-keychain';
import type { IUserContext } from '../state/user/UserInterfaces';

import { utils } from '../utils';

let token = '';

interface Auth {
  (email?: string, password?: string, purchases?: []): Promise<{
    token?: string;
    userId?: number;
    isEdge?: boolean;
    title?: string;
    message?: string;
  }>;
}

export interface Response {
  title?: string;
  message?: string;
  data?: [];
  meta?: any;
}

interface Call {
  ({}: {
    url: string;
    method?: string;
    signal?: AbortSignal;
    body?: {};
  }): Promise<Response & IUserContext['user']>;
}

const authenticate: Auth = async function (email, password, purchases) {
  try {
    if (!email || !password) {
      let cred = await getGenericPassword();
      if (cred) {
        email = cred.username;
        password = cred.password;
      } else throw new Error();
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
  } catch (error) {
    await resetGenericPassword().catch(() => {});
    throw new Error();
  }
};

const call: Call = async function ({ url, method, signal, body }) {
  try {
    let response = await fetch(
      url.includes(utils.rootUrl) ? url : utils.rootUrl + url,
      {
        method: method || 'GET',
        headers: {
          Authorization: token,
          'Content-Type': 'application/json'
        },
        ...(signal ? { signal } : null),
        ...(body ? { body: JSON.stringify(body) } : null)
      }
    );
    if (response.status === 204) return {};
    let json = await response.json();

    if (json.error?.match(/^(TOKEN_EXPIRED|Token not provided)$/)) {
      await authenticate();
      return call({ url, method, signal, body });
    } else return json;
  } catch (error) {
    if (error.toString() === 'AbortError: Aborted') return;
    return utils.serverDownError;
  }
};
export { call, authenticate };
