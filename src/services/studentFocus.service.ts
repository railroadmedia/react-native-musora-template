import type { StudentFocuService } from '../interfaces/service.interfaces';
import { call } from './auth.service';

export const studentFocuService: StudentFocuService = {
  submitStudentReview: function (body: any) {
    return call({
      url: `/musora-api/submit-student-focus-form`,
      method: 'POST',
      body
    });
  },
  askQuestion: function (body: any) {
    return call({
      url: `/musora-api/submit-question`,
      method: 'POST',
      body
    });
  },
  submitCollabVideo: function (body: any) {
    return call({
      url: `/musora-api/submit-video`,
      method: 'POST',
      body
    });
  }
};
