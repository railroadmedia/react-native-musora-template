import { Dimensions } from 'react-native';
import { utils } from '../../utils';
import type { Card } from '../../interfaces/card.interfaces';

const contentTypes = [
  'course',
  'song',
  'play-along',
  'course-part',
  'student-focus',
  'learning-path-lesson',
  'learning-path-course',
  'learning-path-level',
  'learning-path',
  'pack',
  'pack-bundle',
  'semester-pack',
  'pack-bundle-lesson',
  'semester-pack-lesson',
  'coach-stream'
];

const secondsToHms = (d: number | string | undefined): string => {
  if (d) {
    d = Number(d);
    var m = Math.floor(d / 60);
    var s = d - m * 60;
    if (s >= 30) m++;
    var mDisplay = m !== 0 && m === 1 ? m + ' MIN' : m + ' MINS';

    return mDisplay;
  }
  return '';
};

const dateToLocaleString = function (date: Date, options: any): string {
  return date.toLocaleString([], options);
};

export const getImageUri = function (
  thumbUri = utils.fallbackThumb,
  published_on: string,
  type: string
) {
  if (!thumbUri?.includes('https')) return thumbUri;
  // if (this.props.dldActions) return thumbUri;
  const width = Dimensions.get('screen').width;
  const baseUri = 'https://cdn.musora.com/image/fetch';
  if (new Date(published_on) > new Date()) {
    return `${baseUri}/w_${width >> 0},ar_${
      type === 'song' ? '1' : '16:9'
    },fl_lossy,q_auto:eco,e_grayscale/${thumbUri}`;
  }
  return `${baseUri}/w_${width >> 0},ar_${
    type === 'song' ? '1' : '16:9'
  },fl_lossy,q_auto:good,c_fill,g_face/${thumbUri}`;
};

export const decideSubtitle = (props: {
  item: Card;
  route: string;
}): string => {
  const {
    route,
    item: {
      type,
      length_in_seconds,
      published_on,
      live_event_start_time,
      instructors,
      level_number,
      artist,
      style,
      sizeInBytes
    }
  } = props;
  let subtitle: string = '';
  if (route === 'home') {
    if (contentTypes.includes(type))
      subtitle = transformText(type, !sizeInBytes);
    else subtitle = 'Show  / ';
  }

  if (sizeInBytes) {
    const size: number = sizeInBytes / 1024 / 1024;
    return size + 'MB';
  }

  let st = new Date(`${live_event_start_time || published_on} UTC`);
  if (st > new Date())
    return `Releasing ${dateToLocaleString(st, {
      month: 'short'
    })} ${dateToLocaleString(st, { day: '2-digit' })}, ${st.getFullYear()}`;
  if (route === 'lessonPart') return secondsToHms(length_in_seconds);
  if (route === 'myList') return transformText(type);
  if ((type === 'course' || type === 'learning-path-lesson') && instructors)
    return subtitle + instructors?.join(', ');
  if (type === 'learning-path-level')
    return subtitle + 'Level ' + (level_number || '');
  if (type === 'song') return subtitle + transformText(artist);
  if (type === 'play-along') return subtitle + transformText(style);
  if (type === 'student-focus')
    return subtitle + new Date(published_on).toDateString();
  // if (
  //   (this.props.dldActions && !sizeInBytes) ||
  //   type?.includes('pack') ||
  //   type?.includes('learning-path')
  // )
  //   return null;
  if (route?.match(/^(live|schedule)$/)) return type;
  if (route?.match(/^(coachOverview)$/))
    return length_in_seconds ? `${(length_in_seconds / 60) >> 0} mins` : '';
  if (route?.match(/^(coaches)$/))
    return `${type} / ${instructors?.join(', ')}`;
  return transformText(type);
};

const transformText = (text?: string, showBar?: boolean): string => {
  if (text) {
    if (text === 'learning-path-level') text = 'Drumeo Method';
    if (text === 'learning-path-lesson') text = 'Drumeo Method Lesson';
    try {
      text = text.replace(/-/g, ' ');
      text = text.replace(/\b\w/g, l => l.toUpperCase());
    } catch (e) {}
    if (showBar) text = text + '  /  ';
    return text;
  }
  return '';
};

export const getContentType = function (
  type: string,
  bundle_count?: number,
  lessons?: Card[]
) {
  let route, contentType;
  switch (type) {
    case 'course-part':
      contentType = 'course';
      break;
    case 'song':
    case 'song-part':
      contentType = 'song';
      break;
    case 'play-along':
      contentType = 'Play Along';
      break;
    case 'student-focus':
      contentType = 'Student Focus';
      break;
    case 'pack-bundle-lesson':
    case 'semester-pack-lesson':
      contentType = 'pack';
      break;
    default:
      contentType = 'show';
  }
  switch (type) {
    case 'learning-path':
      contentType = 'method';
      route = 'method';
      break;
    case 'learning-path-level':
      contentType = 'method';
      route = 'level';
      break;
    case 'learning-path-course':
      contentType = 'method';
      route = 'courseOverview';
      break;
    case 'learning-path-lesson':
      contentType = 'method';
      route = 'courseMethodLesson';
      break;
    case 'course':
      contentType = 'course';
      route = 'courseOverview';
      break;
    case 'pack':
      contentType = 'pack';
      route = bundle_count === 1 ? 'packLessonOverview' : 'packBundleOverview';
      break;
    case 'pack-bundle':
      contentType = 'pack';
      route = 'packLessonOverview';
      break;
    case 'semester-pack':
      contentType = 'pack';
      route = 'packLessonOverview';
      break;
    case 'song':
      contentType = 'song';
      route = lessons ? 'songOverview' : 'lessonPart';
      break;

    default:
      route = 'lessonPart';
  }
  return { route, contentType };
};
