import AsyncStorage from '@react-native-async-storage/async-storage';
import type { SceneService } from '../interfaces/service.interfaces';
import { call } from './auth.service';

export const scheduledService: SceneService = {
  getAll: function ({ signal }) {
    return call({
      url: `/musora-api/schedule`,
      signal
    });
  },
  getCatalogue: function (params) {
    return Promise.all([this.getAll(params), undefined]);
  },
  getCache: async function () {
    return JSON.parse((await AsyncStorage.getItem('@scheduled')) || '{}');
  }
};
