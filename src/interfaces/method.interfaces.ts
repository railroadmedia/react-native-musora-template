import type { Card } from './card.interfaces';

export interface Level {
  id: number;
  total_xp: number;
  started: boolean;
  courses: MethodCourse[];
  title: string;
  mobile_app_url: string;
  level_number: number;
  published_on: string;
  completed: boolean;
  vimeo_video_id: number;
  instructor: {
    biography: string;
    head_shot_picture_url: string;
    id: number;
    name: string;
  }[];
  banner_background_image: string;
  progress_percent: number;
  video_playback_endpoints: {
    file: string;
    height: number;
    width: number;
  }[];
  description: string;
  thumbnail_url: string;
  length_in_seconds: number;
  banner_button_url: string;
  is_added_to_primary_playlist: boolean;
  next_lesson: Card;
}

export interface Method {
  id: number;
  started?: boolean;
  level_rank?: string;
  title?: string;
  levels?: Level[];
  completed?: boolean;
  vimeo_video_id?: number;
  lesson_rank?: number;
  progress_percent?: number;
  video_playback_endpoints?: Level['video_playback_endpoints'];
  description?: string;
  banner_button_url?: string;
  thumbnail_url?: string;
  banner_background_image?: string;
  length_in_seconds?: string;
  next_lesson: Card;
}

export interface MethodReducer {
  (state: Method, action: { type: string; method?: Method }): Method;
}

export interface MethodContext {
  method: Method;
  updateUser: (method: Method) => void;
}

export interface MethodCourse {
  id: number;
  type: string;
  is_added_to_primary_playlist: boolean;
  lessons: [];
  started: boolean;
  completed: boolean;
  thumbnail_url: string;
  description: string;
  title: string;
  progress_percent: number;
  published_on: string;
  xp: number;
  total_xp: number;
  instructors: { name: string }[];
  next_lesson: Card;
  next_lesson_url: string;
  mobile_app_url: string;
  total_length_in_seconds: number;
  level_position: number;
  course_position: number;
  level_rank: string;
  banner_button_url: string;
  is_liked_by_current_user: boolean;
  like_count: number;
}
