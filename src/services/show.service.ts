import AsyncStorage from '@react-native-async-storage/async-storage';
import type { ShowService } from '../interfaces/service.interfaces';
import { call } from './auth.service';

export const showService: ShowService = {
  getAll: function ({ signal }) {
    return call({
      url: `/api/railcontent/shows`,
      signal
    });
  },
  getInProgress: function ({ page, filters, sort, signal }) {
    return call({
      url: `/musora-api/in-progress?included_types[]=show&limit=40&sort=${
        sort || '-published_on'
      }&page=${page || 1}${filters || ''}`,
      signal
    });
  },
  getLessons: function (
    type,
    page,
    signal,
    filters = '',
    sort = '-published_on'
  ) {
    return call({
      url: `/musora-api/all?included_types[]=${type}&statuses[]=published&statuses[]=scheduled&sort=${sort}&brand=drumeo&limit=10&page=${page}&future&${filters}`,
      signal
    });
  },
  getCatalogue: function (params) {
    return Promise.all([
      this.getAll(params),
      undefined,
      this.getInProgress?.(params)
    ]);
  },
  getCache: async function () {
    return JSON.parse((await AsyncStorage.getItem('@shows')) || '{}');
  }
};
