import type { MethodService } from '../interfaces/service.interfaces';
import { utils } from '../utils';
import { call } from './auth.service';

export const methodService: MethodService = {
  getMethod: function (signal: AbortSignal) {
    return call({
      url: `/musora-api/learning-paths/${utils.brand}-method`,
      signal
    });
  },
  getLevel: function (url, signal) {
    return call({ url, signal });
  },
  getCourse: function (
    signal: AbortSignal,
    forDownload: boolean,
    url?: string,
    id?: number
  ) {
    return call({
      url: id
        ? `/musora-api/content/${id}${forDownload ? '?download=true' : ''}`
        : `${url}${forDownload ? '?download=true' : ''}`,
      signal
    });
  },
  getContent: function (
    url: string,
    signal: AbortSignal,
    forDownload: boolean
  ) {
    return call({
      url: forDownload ? url + '?download=true' : url,
      signal
    });
  }
};
