import type { StudentFocuService } from '../interfaces/service.interfaces';
import { call } from './auth.service';

export const studentFocuService: StudentFocuService = {
  submitStudentReview: function (body: any) {
    return call({
      url: `/musora-api/submit-student-focus-form`,
      method: 'POST',
      body
    });
  }
};
