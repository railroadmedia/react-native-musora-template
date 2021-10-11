import type { Card } from './card.interfaces';
import type { Level, Course } from './method.interfaces';
import type { PackBundle } from './packs.interfaces';
import type { ErrorResponse } from './service.interfaces';

export interface Lesson {
  assignments: Assignment[];
  comments: Comment[];
  total_comments: number;
  id: number;
  xp: number;
  isLive: boolean;
  type: string;
  style: string;
  title: string;
  xp_bonus: number;
  chapters: Chapter[];
  mobile_app_url: string;
  artist: string;
  vimeo_video_id: number;
  youtube_video_id: number;
  like_count: number;
  live_event_end_time: string;
  live_event_start_time: string;
  captions: string;
  user_progress: [{ progress_percent: number }];
  started: boolean;
  completed: boolean;
  progress_percent: number;
  resources: Resource[];
  thumbnail_url: string;
  instructor: Instructor[];
  difficulty: number;
  published_on: string;
  length_in_seconds: number;
  description: string;
  mp3_no_drums_no_click_url: string;
  mp3_no_drums_yes_click_url: string;
  mp3_yes_drums_no_click_url: string;
  mp3_yes_drums_yes_click_url: string;
  is_liked_by_current_user: boolean;
  course_position: number;
  level_position: number;
  current_level: Level;
  next_level: Level;
  current_course: Course;
  next_course: Course;
  is_last_incomplete_course_from_level: boolean;
  is_last_incomplete_lesson_from_course: boolean;
  next_lesson: Card;
  previous_lesson: Card;
  related_lessons: Card[];
  is_added_to_primary_playlist: boolean;
  parent: Parent;
  parent_id: number;
  video_playback_endpoints: Video[];
  last_watch_position_in_seconds: number;
  apiKey?: string;
}

export interface LessonResponse extends Lesson, ErrorResponse {}

export interface Assignment {
  id: number;
  xp: number;
  user_progress: [{ progress_percent: number }];
  title: string;
  description: string;
  soundslice_slug: string;
  sheet_music_image_url?: MusicSheet[];
  timecode: number;
}

export interface SelectedAssignment extends Assignment {
  index: number;
  progress: number;
}

export interface Comment {
  comment: string;
  created_on: string;
  id: number;
  user_id: number;
  is_liked: boolean;
  like_count: number;
  replies: Comment[];
  user: {
    display_name: string;
    'fields.profile_picture_image_url': string;
    xp: string;
    xp_level: string;
  };
}

export interface Chapter {
  chapter_timecode: string;
  chapter_description: string;
}

export interface Parent {
  id: number;
  title: string;
  xp: number;
  current_lesson?: Card;
  next_lesson?: Card;
  next_bundle?: PackBundle;
}

export interface Video {
  file: string;
  height: number;
  width: number;
}

export interface Instructor {
  biography: string;
  head_shot_picture_url: string;
  id: number;
  name: string;
}

export interface Resource {
  extension: string;
  resource_id: number;
  resource_name: string;
  resource_url: string;
}

export interface ResourceWithExtension extends Resource {
  wasWithoutExtension?: boolean;
}

export interface MusicSheet {
  content_id: number;
  id: number;
  key: string;
  value: string;
  whRatio: number;
}

export interface Likes {
  id: number;
  avatar_url: string;
  display_name: string;
  xp: number;
}
