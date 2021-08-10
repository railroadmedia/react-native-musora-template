import { utils } from '../utils';
import { call } from './auth.service';

import type { Args } from './interfaces';

export const searchService = {
  search: function (term: string, { page, filters, signal }: Args) {
    return call({
      url: `/musora-api/search?limit=10&page=${
        page || 1
      }&term=${encodeURIComponent(term)}&brand=${
        utils.brand
      }&included_types[]=learning-path-level&included_types[]=learning-path-lesson&included_types[]=student-focus&included_types[]=course&included_types[]=play-along&included_types[]=song&included_types[]=shows&included_types[]=pack-bundle-lesson&included_types[]=semester-pack-lesson${
        filters || ''
      }`,
      signal
    });
  }
};
