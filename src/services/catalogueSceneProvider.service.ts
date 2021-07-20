import { homeService } from './home.service';
import { coursesService } from './courses.service';

import type { Args } from './interfaces';

interface ProviderMethod {
  ({}: Args): Promise<{}>;
}

interface Scene {
  getMethod?: ProviderMethod;
  getAll?: ProviderMethod;
  getInProgress?: ProviderMethod;
  getNew?: ProviderMethod;
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
