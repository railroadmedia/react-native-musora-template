import AsyncStorage from '@react-native-async-storage/async-storage';

import { call } from './auth.service';

import type { Args } from './interfaces';

export const coursesService = {
  getAll: function ({ page, filters, sort, signal }: Args) {
    return call({
      url: `/musora-api/all?included_types[]=course&statuses[]=published&statuses[]=scheduled&future&sort=${
        sort || '-published_on'
      }&limit=40&page=${page || 1}${filters || ''}`,
      signal
    });
  },
  getInProgress: function ({ page, filters, sort, signal }: Args) {
    return call({
      url: `/musora-api/in-progress?included_types[]=course&limit=40&sort=${
        sort || '-published_on'
      }&page=${page || 1}${filters || ''}`,
      signal
    });
  },
  getNew: function ({ page, filters, sort, signal }: Args) {
    return call({
      url: `/musora-api/all?included_types[]=course&limit=40&sort=${
        sort || '-published_on'
      }&page=${page || 1}&statuses[]=published${filters || ''}`,
      signal
    });
  },
  getCombined: function (params: Args) {
    return Promise.all([
      this.getAll(params),
      this.getNew(params),
      this.getInProgress(params)
    ]);
  },
  getCache: async function () {
    return JSON.parse((await AsyncStorage.getItem('@courses')) || '{}');
  }
};
