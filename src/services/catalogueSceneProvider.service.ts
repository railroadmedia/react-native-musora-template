import { homeService } from './home.service';
import { coursesService } from './courses.service';
import type { ServiceProvider } from '../interfaces/service.interfaces';

export const provider: ServiceProvider = {
  home: homeService,
  courses: coursesService
};
