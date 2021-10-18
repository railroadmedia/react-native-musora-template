import type { Card } from './card.interfaces';
import type { Coach } from './coach.interface';
import type {
  Comment,
  Lesson,
  LessonResponse,
  Likes
} from './lesson.interfaces';
import type { Live } from './live.interfaces';
import type { Level, Method, Course, Foundation } from './method.interfaces';
import type { Notification } from './notification.interfaces';
import type {
  BannerPack,
  Pack,
  PackBundle,
  PackLessonBundle
} from './packs.interfaces';
import type { Show, ShowLessons } from './show.interfaces';
import type {
  AskQuestionBody,
  FormResp,
  StudentReviewBody,
  SubmitCollabVideoBody
} from './studentFocus.interfaces';
import type {
  CompletedResponse,
  MediaSessionResponse,
  ResetProgressResponse,
  UpdateAvatarResponse,
  User,
  UserAvatar
} from './user.interfaces';

export interface Filters {
  refreshing?: boolean;
  reset?: boolean;
  content_type?: string[];
  difficulty?: string[];
  instructor?: {
    head_shot_picture_url: string;
    id: number;
    name: string;
    type: string;
  }[];
  showSkillLevel?: boolean;
  style?: string[];
  topic?: string[];
}
export interface CatalogueSection {
  title?: string;
  message?: string;
  data?: Card[];
  meta?: { filterOptions: Filters; totalResults: number };
}

export interface PacksSection {
  topHeaderPack: BannerPack;
  morePacks: Pack[];
  myPacks: Pack[];
}

export interface CommentSection {
  data: Comment[];
  meta: { totalCommentsAndReplies: number };
}

export interface AuthenticateResponse {
  token?: string;
  userId?: number;
  isEdge?: boolean;
  title?: string;
  message?: string;
  isEdgeExpired?: boolean;
  isPackOlyOwner?: boolean;
}

export interface Authenticate {
  (
    email?: string,
    password?: string,
    purchases?: []
  ): Promise<AuthenticateResponse>;
}

export interface Call {
  <Response>({}: {
    url: string;
    method?: string;
    signal?: AbortSignal;
    body?: {} | FormData;
  }): Promise<Response>;
}

export interface ErrorResponse {
  title: string;
  message: string;
}

interface ProviderFunctionArgs {
  page?: number;
  filters?: string;
  sort?: string;
  signal?: AbortSignal;
}

export interface ServiceFunction<Response> {
  ({}: ProviderFunctionArgs): Promise<Response>;
}

interface ServiceFunctionCatalogue {
  ({}: ProviderFunctionArgs): Promise<
    [
      CatalogueSection?,
      CatalogueSection?,
      CatalogueSection?,
      CatalogueSection?,
      Method?
    ]
  >;
}

interface ServiceFunctionCache {
  (): Promise<{
    all?: number[];
    inProgress?: number[];
    newContent?: number[];
    recentlyViewed?: number[];
    method?: Method;
  }>;
}

export interface SceneService {
  getMethod?: ServiceFunction<Method>;
  getAll: ServiceFunction<CatalogueSection>;
  getRecentlyViewed?: ServiceFunction<CatalogueSection>;
  getInProgress?: ServiceFunction<CatalogueSection>;
  getNew?: ServiceFunction<CatalogueSection>;
  getCatalogue?: ServiceFunctionCatalogue;
  getCache?: ServiceFunctionCache;
}

export interface ServiceProvider {
  home: SceneService;
  courses: SceneService;
  [scene: string]: SceneService;
}

export interface ContentService {
  getContentById: (
    id: number,
    forDownload: boolean,
    signal: AbortSignal
  ) => Promise<LessonResponse>;
}

export interface UserService {
  getUserDetails: ServiceFunction<User>;
  getNotifications: ServiceFunction<{ data: Notification[] }>;
  updateUserDetails: (picture?: any, name?: string) => Promise<{}>;
  isNameUnique: (name: string) => Promise<{ unique: boolean }>;
  addToMyList: (id: number) => Promise<{}>;
  removeFromMyList: (id: number) => Promise<{}>;
  resetProgress: (id: number) => Promise<ResetProgressResponse>;
  markAsComplete: (id: number) => Promise<CompletedResponse>;
  likeContent: (id: number) => Promise<{}>;
  dislikeContent: (id: number) => Promise<{}>;
  updateAvatar: (file: UserAvatar) => Promise<UpdateAvatarResponse>;
  changeNotificationSettings: (body: {
    data: {
      type: string;
      attributes: [];
    };
  }) => Promise<{}>;
  updateUsersSoundsliceProgress: (
    mediaId: number,
    currentSecond: number,
    mediaLengthSeconds: number
  ) => Promise<{}>;
  updateUsersVideoProgress: (
    id: number,
    seconds: number,
    lengthInSeconds: number,
    media_id: number,
    media_category: string,
    media_type: string
  ) => Promise<{}>;
  getMediaSessionId: (
    id: number,
    content_id: number,
    length_in_seconds: number,
    media_category: string
  ) => Promise<MediaSessionResponse>;
}

export interface MethodService {
  getMethod: (signal: AbortSignal) => Promise<Method>;
  getFoundation: (signal: AbortSignal) => Promise<Foundation>;
  getLevel: (url: string, signal: AbortSignal) => Promise<Level>;
  getCourse: (
    signal: AbortSignal,
    forDownload: boolean,
    url?: string,
    id?: number
  ) => Promise<Course>;
  getContent: (
    url: string,
    signal: AbortSignal,
    forDownload: boolean
  ) => Promise<{}>;
}

export interface MyListService {
  inProgress: ServiceFunction<CatalogueSection>;
  myList: ServiceFunction<CatalogueSection>;
  completed: ServiceFunction<CatalogueSection>;
  getCache: () => Promise<{}>;
}

export interface SearchService {
  search: (term: string, {}: ProviderFunctionArgs) => Promise<CatalogueSection>;
}

export interface PacksService {
  allPacks: (signal: AbortSignal) => Promise<PacksSection>;
  getPack: (
    url: string,
    signal: AbortSignal
  ) => Promise<PackBundle | PackLessonBundle>;
  getContent: (
    url: string,
    getLessonsVideos: boolean,
    signal: AbortSignal
  ) => Promise<{}>;
}

export interface ShowService {
  getAll: () => Promise<Show>;
  getLessons: (
    type: string,
    page: number,
    signal: AbortSignal,
    filters?: string,
    sort?: string
  ) => Promise<ShowLessons>;
}

export interface StudentFocuService {
  submitStudentReview: (body: StudentReviewBody) => Promise<FormResp>;
  askQuestion: (body: AskQuestionBody) => Promise<FormResp>;
  submitCollabVideo: (body: SubmitCollabVideoBody) => Promise<FormResp>;
}

export interface CommentService {
  getComments: (
    id: number,
    sortBy: string,
    limit: number
  ) => Promise<CommentSection>;
  addComment: (commentText: string, contentId: number) => Promise<{}>;
  likeComment: (id: number) => Promise<{}>;
  dislikeComment: (id: number) => Promise<{}>;
  getCommentLikes: (id: number) => Promise<{ data: Likes[] }>;
  deleteComment: (id: number) => Promise<{}>;
  addReplyToComment: (
    replyText: string,
    commentId: number
  ) => Promise<{ data: Comment[] }>;
}
export interface LiveService {
  getLive: (signal: AbortSignal) => Promise<Live>;
}

export interface CoachesService {
  getAll: ServiceFunction<CatalogueSection>;
  getContent: (id: number, signal: AbortSignal) => Promise<Coach>;
}
