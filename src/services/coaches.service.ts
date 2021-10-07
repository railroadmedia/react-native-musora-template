import { utils } from '../utils';
import type { CoachesService } from '../interfaces/service.interfaces';
import { call } from './auth.service';

export const coachesService: CoachesService = {
  getAll: function ({ page, filters, sort, signal }) {
    return call({
      url: `/musora-api/all?included_types[]=coach-stream&sort=${sort}&brand=drumeo&limit=${
        utils.isTablet ? 40 : 10
      }&page=${page}${filters}`,
      signal
    });
  },
  getContent: function (id: number, signal: AbortSignal) {
    return call({
      url: `/musora-api/content/${id}?&statuses[]=published&statuses[]=scheduled&future`,
      signal
    });
  }
};
