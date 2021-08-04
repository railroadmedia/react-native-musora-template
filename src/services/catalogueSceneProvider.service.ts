import { homeService } from './home.service';
import { coursesService } from './courses.service';

import type { Args } from './interfaces';

interface ProviderFunction {
  ({}: Args): Promise<{ data?: [] }>;
}

interface ProviderFunctionCatalogue {
  ({}: Args): Promise<({ data?: [] } | undefined)[]>;
}

interface ProviderFunctionCache {
  (): Promise<{
    all?: number[];
    inProgress?: number[];
    newContent?: number[];
    recentlyViewed?: number[];
    method?: {};
  }>;
}

interface Scene {
  getMethod?: ProviderFunction;
  getAll: ProviderFunction;
  getRecentlyViewed?: ProviderFunction;
  getInProgress?: ProviderFunction;
  getNew?: ProviderFunction;
  getCatalogue?: ProviderFunctionCatalogue;
  getCache?: ProviderFunctionCache;
}

interface Provider {
  home: Scene;
  courses: Scene;
  [scene: string]: Scene;
}

export const provider: Provider = {
  home: homeService,
  courses: coursesService
};
