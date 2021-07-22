import { homeService } from './home.service';
import { coursesService } from './courses.service';

import type { Args } from './interfaces';

interface ProviderMethod {
  ({}: Args): Promise<{ data?: [] }>;
}

interface ProviderMethodCombined {
  ({}: Args): Promise<{ data?: [] }[]>;
}

interface ProviderMethodCache {
  (): Promise<{
    all?: [];
    inProgress?: [];
    newContent?: [];
    method?: {};
  }>;
}

interface Scene {
  getMethod?: ProviderMethod;
  getAll?: ProviderMethod;
  getInProgress?: ProviderMethod;
  getNew?: ProviderMethod;
  getCombined?: ProviderMethodCombined;
  getCache?: ProviderMethodCache;
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
