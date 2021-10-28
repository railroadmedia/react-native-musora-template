export interface User {
  id?: number;
  avatarUrl?: string;
  display_name?: string;
  totalXp?: string;
  xpRank?: string;
  daysAsMember?: string;
  lessonsCompleted?: string;
  isAppleAppSubscriber?: boolean;
  isGoogleAppSubscriber?: boolean;
  notify_weekly_update?: boolean;
  notify_on_lesson_comment_reply?: boolean;
  notify_on_lesson_comment_like?: boolean;
  notify_on_forum_followed_thread_reply?: boolean;
  notify_on_forum_post_like?: boolean;
  notify_on_forum_post_reply?: boolean;
  notifications_summary_frequency_minutes?: 1440 | null;
}

export interface UserAvatar {
  fileName?: string;
  type: string;
  uri: string;
}

export interface UpdateAvatarResponse {
  success: boolean;
  errors: [{ detail: string }];
  data: [{ url: string }];
}

export interface CompletedResponse {
  displayIosReviewModal?: boolean;
  displayGoogleReviewModal?: boolean;
  parent?: {
    type: string;
    user_progress: [{ progress_percent: number }];
  };
}

export interface MediaSessionResponse {
  session_id: {
    id: number;
  };
}

export interface ResetProgressResponse {
  type?: string;
  progress_percent?: number;
}

export interface UserContext {
  user: User;
  updateUser: (user: User) => void;
  updateUserAndCache: (user: User) => void;
}

export interface UserReducer {
  (state: {}, action: { type: string; user?: User }): User;
}

export interface UpdateUser {
  (state: {}, user: User, cache?: boolean): User;
}
