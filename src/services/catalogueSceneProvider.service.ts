import { homeService } from './home.service';
import { coursesService } from './courses.service';
import type { ServiceProvider } from '../interfaces/service.interfaces';
import { songsService } from './songs.service';
import { playAlongsService } from './playAlongs.service';
import { studentFocuService } from './studentFocus.service';
import { showService } from './show.service';
import { liveService } from './live.service';
import { scheduledService } from './scheduled.service';

export const provider: ServiceProvider = {
  home: homeService,
  courses: coursesService,
  songs: songsService,
  shows: showService,
  playAlongs: playAlongsService,
  studentFocus: studentFocuService,
  live: liveService,
  scheduled: scheduledService
};
