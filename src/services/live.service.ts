import type { LiveService } from '../interfaces/service.interfaces';
import { call } from './auth.service';

export const liveService: LiveService = {
  getLive: function (signal) {
    return call({
      url: `/musora-api/live-event?timezone=${
        Intl.DateTimeFormat().resolvedOptions().timeZone
      }`,
      signal
    });
  }
};
