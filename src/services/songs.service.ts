import { call } from './auth.service';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { SceneService } from '../interfaces/service.interfaces';

export const songsService: SceneService = {
  getAll: function ({ page, filters, sort, signal }) {
    return call({
      url: `/musora-api/all?included_types[]=song&statuses[]=published&statuses[]=scheduled&future&sort=${
        sort || '-published_on'
      }&limit=40&page=${page || 1}${filters || ''}`,
      signal
    });
  },
  getInProgress: function ({ page, filters, sort, signal }) {
    return call({
      url: `/musora-api/in-progress?included_types[]=song&limit=40&sort=${
        sort || '-published_on'
      }&page=${page || 1}${filters || ''}`,
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
    return JSON.parse((await AsyncStorage.getItem('@songs')) || '{}');
  }
};
