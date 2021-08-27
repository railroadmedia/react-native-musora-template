import type { MethodService } from '../interfaces/service.interfaces';
import { utils } from '../utils';
import { call } from './auth.service';

export const methodService: MethodService = {
  getMethod: function (signal) {
    return call({
      url: `/musora-api/learning-paths/${utils.brand}-method`,
      signal
    });
  },
  getLevel: function (url, signal) {
    return call({ url, signal });
  },
  getMethodCourse: function (url, signal, forDownload) {
    return call({
      url: forDownload ? url + '?download=true' : url,
      signal
    });
  },
  getContent: function (url, signal, forDownload) {
    return call({
      url: forDownload ? url + '?download=true' : url,
      signal
    });
  }
};
