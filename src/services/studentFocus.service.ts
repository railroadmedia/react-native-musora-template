import AsyncStorage from '@react-native-async-storage/async-storage';
import type {
  StudentReviewBody,
  SubmitCollabVideoBody,
  AskQuestionBody
} from '../interfaces/studentFocus.interfaces';
import type { StudentFocuService } from '../interfaces/service.interfaces';
import { call } from './auth.service';

export const studentFocuService: StudentFocuService = {
  submitStudentReview: function (body: StudentReviewBody) {
    return call({
      url: `/musora-api/submit-student-focus-form`,
      method: 'POST',
      body
    });
  },
  askQuestion: function (body: AskQuestionBody) {
    return call({
      url: `/musora-api/submit-question`,
      method: 'POST',
      body
    });
  },
  submitCollabVideo: function (body: SubmitCollabVideoBody) {
    return call({
      url: `/musora-api/submit-video`,
      method: 'POST',
      body
    });
  },
  getAll: function ({ page, filters, sort, signal }) {
    return call({
      url: `/musora-api/all?included_types[]=student-focus&statuses[]=published&statuses[]=scheduled&future&sort=${
        sort || '-published_on'
      }&limit=40&page=${page || 1}${filters || ''}`,
      signal
    });
  },
  getInProgress: function ({ page, filters, sort, signal }) {
    return call({
      url: `/musora-api/in-progress?included_types[]=student-focus&limit=40&sort=${
        sort || '-published_on'
      }&page=${page || 1}${filters || ''}`,
      signal
    });
  },
  getCatalogue: function (params) {
    return Promise.all([
      this.getAll(params),
      undefined,
      this.getInProgress?.(params)
    ]);
  },
  getCache: async function () {
    return JSON.parse((await AsyncStorage.getItem('@studentFocus')) || '{}');
  }
};
