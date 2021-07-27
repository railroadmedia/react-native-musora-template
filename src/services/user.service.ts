import { call } from './auth.service';

import type { Args } from './interfaces';

export const userService = {
  getUserDetails: function (args?: Args) {
    return call({ url: `/musora-api/profile`, signal: args?.signal });
  },
  getNotifications: function ({ page, signal }: Args) {
    return call({
      url: `/api/railnotifications/notifications?limit=10&page=${page}`,
      signal
    });
  }
};
