import type { SearchService } from '../interfaces/service.interfaces';
import { utils } from '../utils';
import { call } from './auth.service';

export const searchService: SearchService = {
  search: function (term, { page, filters, signal }) {
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
