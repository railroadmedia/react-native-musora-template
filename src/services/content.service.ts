import type { ContentService } from 'src/interfaces/service.interfaces';
import { call } from './auth.service';

export const contentService: ContentService = {
  getContentById: function (
    id: number,
    forDownload: boolean,
    signal: AbortSignal
  ) {
    return call({
      url: `/musora-api/content/${id}${forDownload ? '?download=true' : ''}`,
      signal
    });
  },
  getContentByUrl: function (
    mobile_app_url: string,
    forDownload: boolean,
    signal: AbortSignal
  ) {
    return call({
      url: `${mobile_app_url}${forDownload ? '?download=true' : ''}`,
      signal
    });
  }
};
