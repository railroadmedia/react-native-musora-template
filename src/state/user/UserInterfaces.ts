export interface IUserContext {
  user: {
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
  };
  updateUser: (user: IUserContext['user']) => void;
  updateUserAndCache: (user: IUserContext['user']) => void;
}

export interface UserReducer {
  (
    state: {},
    action: { type: string; user?: IUserContext['user'] }
  ): IUserContext['user'];
}

export interface UpdateUser {
  (
    state: {},
    user: IUserContext['user'],
    cache?: boolean
  ): IUserContext['user'];
}
