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
  }
};
