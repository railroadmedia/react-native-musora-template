import { call } from './auth.service';
import { utils } from '../utils';
import type { Args } from './interfaces';
import type { ICroppedImage } from 'src/profile/ProfileSettings';

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
  changeNotificationSettings: function (body: any) {
    return call({
      url: `/usora/api/profile/update`,
      method: 'POST',
      body
    });
  },
  updateAvatar: function (file: ICroppedImage) {
    return call({
      url: `/musora-api/avatar/upload`,
      method: 'POST',
      body: createFormData(file)
    });
  },
  updateUserDetails: function (picture?: any, name?: string) {
    let url = `/musora-api/profile/update?`;
    if (picture) url += `file=${picture}`;
    if (name) url += `display_name=${name}`;
    return call({ url, method: 'POST' });
  },
  isNameUnique: function (name: string) {
    return call({
      url: `/usora/api/is-display-name-unique?display_name=${name}`
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
  },
  likeContent: function (id: number) {
    return call({
      url: `/api/railcontent/content-like?content_id=${id}`,
      method: 'PUT'
    });
  },
  dislikeContent: function (id: number) {
    return call({
      url: `/api/railcontent/content-like?content_id=${id}`,
      method: 'DELETE'
    });
  }
};

const createFormData = (photo: ICroppedImage) => {
  const data = new FormData();

  if (photo) {
    data.append('file', {
      name: photo.fileName || 'avatar',
      type: photo.type,
      uri: utils.isiOS ? photo.uri?.replace('file://', '') : photo.uri
    });
    data.append('target', photo.fileName || 'avatar');
  }
  return data;
};
