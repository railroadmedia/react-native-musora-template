import { call } from './auth.service';
import AsyncStorage from '@react-native-async-storage/async-storage';

import type { Args } from './interfaces';

export const homeService = {
  getMethod: function ({ signal }: Args) {
    return call({ url: `/musora-api/learning-paths/drumeo-method`, signal });
  },
  getAll: function ({ page, filters, sort, signal }: Args) {
    return call({
      url: `/musora-api/all?limit=40&statuses[]=published&included_types[]=coach-stream&included_types[]=course&included_types[]=play-along&included_types[]=song&included_types[]=student-focus&included_types[]=semester-pack&included_types[]=pack&included_types[]=learning-path&included_types[]=shows&sort=${
        sort || '-published_on'
      }&page=${page || 1}${filters || ''}`,
      signal
    });
  },
  getInProgress: function ({ page, filters, sort, signal }: Args) {
    return call({
      url: `/musora-api/in-progress?included_types[]=coach-stream&included_types[]=learning-path-lesson&included_types[]=student-focus&included_types[]=course&included_types[]=song&included_types[]=play-along&included_types[]=shows&included_types[]=pack-bundle-lesson&included_types[]=semester-pack-lesson&limit=40&sort=${
        sort || '-published_on'
      }&page=${page || 1}${filters || ''}`,
      signal
    });
  },
  getNew: function ({ page, filters, sort, signal }: Args) {
    return call({
      url: `/musora-api/all?statuses[]=published&limit=40&included_types[]=student-focus&included_types[]=course&included_types[]=play-along&included_types[]=song&included_types[]=shows&show_in_new_feed=1&sort=${
        sort || '-published_on'
      }&page=${page || 1}${filters || ''}`,
      signal
    });
  },
  getCombined: function (params: Args) {
    return Promise.all([
      this.getAll(params),
      this.getNew(params),
      this.getInProgress(params),
      this.getMethod(params)
    ]);
  },
  getCache: async function () {
    return JSON.parse((await AsyncStorage.getItem('@home')) || '{}');
  }
};
