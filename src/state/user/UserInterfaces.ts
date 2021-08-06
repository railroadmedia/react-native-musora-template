export interface IUserContext {
  user: {
    avatarUrl?: string;
    display_name?: string;
    totalXp?: string;
    xpRank?: string;
    daysAsMember?: string;
    lessonsCompleted?: string;
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
