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
  },
  addToMyList: function (id: number) {
    return call({
      url: `/api/railcontent/add-to-my-list?content_id=${id}`,
      method: 'PUT'
    });
  },
  removeFromMyList: function (id: number) {
    return call({
      url: `/api/railcontent/remove-from-my-list?content_id=${id}`,
      method: 'PUT'
    });
  },
  resetProgress: function (id: number) {
    return call({
      url: `/musora-api/reset?content_id=${id}`,
      method: 'PUT'
    });
  }
};
