import type { Card } from './card.interfaces';
import type { Level, Method, MethodCourse } from './method.interfaces';
import type { Notification } from './notification.interfaces';
import type { BannerPack, Pack } from './packs.interfaces';
import type { User, UserAvatar } from './user.interfaces';

export interface CatalogueSection {
  title?: string;
  message?: string;
  data?: Card[];
  meta?: any;
}

export interface PacksSection {
  topHeaderPack: BannerPack;
  morePacks: Pack[];
  myPacks: Pack[];
}

export interface Authenticate {
  (email?: string, password?: string, purchases?: []): Promise<{
    token?: string;
    userId?: number;
    isEdge?: boolean;
    title?: string;
    message?: string;
  }>;
}

export interface Call {
  <Response>({}: {
    url: string;
    method?: string;
    signal?: AbortSignal;
    body?: {};
  }): Promise<Response>;
}

interface ProviderFunctionArgs {
  page?: number;
  filters?: string;
  sort?: string;
  signal?: AbortSignal;
}

interface ServiceFunction<Response> {
  ({}: ProviderFunctionArgs): Promise<Response>;
}

interface ServiceFunctionCatalogue {
  ({}: ProviderFunctionArgs): Promise<
    [
      CatalogueSection | undefined,
      CatalogueSection | undefined,
      CatalogueSection | undefined,
      CatalogueSection | undefined,
      Method | undefined
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

export interface UserService {
  getUserDetails: ServiceFunction<User>;
  getNotifications: ServiceFunction<{ data: Notification[]; meta: any }>;
  updateUserDetails: (picture?: any, name?: string) => Promise<{}>;
  isNameUnique: (name: string) => Promise<{}>;
  addToMyList: (id: number) => Promise<{}>;
  removeFromMyList: (id: number) => Promise<{}>;
  resetProgress: (id: number) => Promise<{}>;
  likeContent: (id: number) => Promise<{}>;
  dislikeContent: (id: number) => Promise<{}>;
  updateAvatar: (file: UserAvatar) => Promise<{}>;
  changeNotificationSettings: (body: {
    data: {
      type: string;
      attributes: [];
    };
  }) => Promise<{}>;
}

export interface MethodService {
  getMethod: (signal: AbortSignal) => Promise<Method>;
  getLevel: (url: string, signal: AbortSignal) => Promise<Level>;
  getMethodCourse: (
    url: string,
    signal: AbortSignal,
    forDownload: boolean
  ) => Promise<MethodCourse>;
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
  getPack: (url: string, signal: AbortSignal) => Promise<{}>;
  getContent: (
    url: string,
    getLessonsVideos: boolean,
    signal: AbortSignal
  ) => Promise<{}>;
}
