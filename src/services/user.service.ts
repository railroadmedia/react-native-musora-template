import { call } from './auth.service';

import type { Args } from './Args';

export const userService = {
  getUserDetails: function ({ signal }: Args) {
    return call({
      url: `/musora-api/all?included_types[]=course&statuses[]=published&statuses[]=scheduled&future`,
      signal
    });
  }
};
