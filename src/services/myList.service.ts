import AsyncStorage from '@react-native-async-storage/async-storage';
import type { MyListService } from '../interfaces/service.interfaces';
import { utils } from '../utils';

import { call } from './auth.service';

export const myListService: MyListService = {
  inProgress: function ({ page, filters, sort, signal }) {
    return call({
      url: `/musora-api/in-progress?included_types[]=coach-stream&included_types[]=learning-path-lesson&included_types[]=student-focus&included_types[]=course&included_types[]=song&included_types[]=play-along&included_types[]=shows&included_types[]=pack-bundle-lesson&included_types[]=semester-pack-lesson&limit=10&sort=${
        sort || '-published_on'
      }&page=${page || 1}${filters || ''}`,
      signal
    });
  },
  myList: function ({ page, filters, sort, signal }) {
    return call({
      url: `/musora-api/my-list?limit=10&brand=${utils.brand}&sort=${
        sort || '-published_on'
      }&page=${page || 1}${filters || ''}`,
      signal
    });
  },
  completed: function ({ page, filters, sort, signal }) {
    return call({
      url: `/musora-api/my-list?limit=10&brand=${
        utils.brand
      }&state=completed&sort=${sort || '-published_on'}&page=${page || 1}${
        filters || ''
      }`,
      signal
    });
  },
  getCache: async function () {
    return JSON.parse((await AsyncStorage.getItem('@myList')) || '{}');
  }
};
