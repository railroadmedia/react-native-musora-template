import { utils } from '../utils';
import { call } from './auth.service';

import type { Args } from './interfaces';

export const methodService = {
  getMethod: function (signal: AbortSignal) {
    return call({
      url: `/musora-api/learning-paths/${utils.brand}-method`,
      signal
    });
  },
  getLevel: function (url: string, signal: AbortSignal) {
    return call({ url, signal });
  },
  getLevelCourse: function (
    url: string,
    signal: AbortSignal,
    forDownload: boolean
  ) {
    return call({
      url: forDownload ? url + '?download=true' : url,
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
