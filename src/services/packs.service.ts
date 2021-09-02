import type { PacksService } from '../interfaces/service.interfaces';
import { utils } from '../utils';
import { call } from './auth.service';

export const packsService: PacksService = {
  allPacks: function (signal: AbortSignal) {
    return call({
      url: `/musora-api/packs`,
      signal
    });
  },
  getPack: function (url: string, signal: AbortSignal) {
    return call({ url, signal });
  },
  getContent: function (
    url: string,
    getLessonsVideos: boolean,
    signal: AbortSignal
  ) {
    return call({
      url: `${url}${getLessonsVideos ? '?download=true' : ''}`,
      signal
    });
  }
};
