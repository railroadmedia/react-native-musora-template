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
  }
};
