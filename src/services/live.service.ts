import AsyncStorage from '@react-native-async-storage/async-storage';
import type { LiveService } from '../interfaces/service.interfaces';
import { call } from './auth.service';

export const liveService: LiveService = {
  getLive: function (signal) {
    return call({
      url: `/musora-api/live-event?timezone=${
        Intl.DateTimeFormat().resolvedOptions().timeZone
      }&forced-content-id=313275`, //&forced-content-id=306509
      signal
    });
  },
  getAll: function ({ signal }) {
    return call({
      url: `/musora-api/live-schedule`,
      signal
    });
  },
  getCatalogue: function (params) {
    return Promise.all([this.getAll(params), undefined]);
  },
  getCache: async function () {
    return JSON.parse((await AsyncStorage.getItem('@live')) || '{}');
  }
};
