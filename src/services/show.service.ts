import type { ShowService } from '../interfaces/service.interfaces';
import { call } from './auth.service';

export const showService: ShowService = {
  getAll: function () {
    return call({
      url: `/api/railcontent/shows`
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
  }
};
