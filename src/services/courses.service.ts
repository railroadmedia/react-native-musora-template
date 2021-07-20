import { call } from './auth.service';

import type { Args } from './Args';

export const coursesService = {
  getAll: function ({ page, filters, sort, signal }: Args) {
    return call({
      url: `/musora-api/all?included_types[]=course&statuses[]=published&statuses[]=scheduled&future&sort=${
        sort || '-published_on'
      }&brand=drumeo&limit=40&page=${page || 1}${filters || ''}`,
      signal
    });
  },
  getInProgress: function ({ page, filters, sort, signal }: Args) {
    return call({
      url: `/musora-api/in-progress?included_types[]=course&brand=drumeo&limit=40&sort=${
        sort || '-published_on'
      }&page=${page || 1}${filters || ''}`,
      signal
    });
  }
};
