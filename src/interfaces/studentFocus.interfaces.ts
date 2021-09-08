export interface StudentReviewBody {
  goal: string;
  weakness: string;
  experience: string;
  youtube_url: string;
  improvement: string;
  instructor_focus: string;
}

export interface AskQuestionBody {
  question: string;
}

export interface SubmitCollabVideoBody {
  video: string;
}

export interface FormResp {
  success: boolean;
  title: string;
  message: string;
}
