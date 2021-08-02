import type { CardProps } from './RowCard';

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

const secondsToHms = (d: number | string) => {
  d = Number(d);
  var m = Math.floor(d / 60);
  var s = d - m * 60;
  if (s >= 30) m++;
  var mDisplay = m !== 0 && m === 1 ? m + ' MIN' : m + ' MINS';

  return mDisplay;
};

export const decideSubtitle = (props: CardProps): string => {
  const {
    route,
    item: {
      type,
      length_in_seconds,
      published_on,
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

  if (new Date(published_on) > new Date())
    return 'Releasing ' + new Date(published_on).toDateString();
  if (route === 'lessonPart') return secondsToHms(length_in_seconds);
  if (route === 'myList') return transformText(type);
  if (type === 'course' || type === 'learning-path-lesson')
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
  return subtitle + transformText(type);
};

const transformText = (text: string, showBar?: boolean) => {
  if (text === 'learning-path-level') text = 'Drumeo Method';
  if (text === 'learning-path-lesson') text = 'Drumeo Method Lesson';
  try {
    text = text.replace(/-/g, ' ');
    text = text.replace(/\b\w/g, l => l.toUpperCase());
  } catch (e) {}
  if (showBar) text = text + '  /  ';
  return text;
};
