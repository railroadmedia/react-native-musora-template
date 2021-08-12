import type { Card } from '../cards/CardsInterfaces';

export interface IMethod {
  id: number;
  started: boolean;
  level_rank: string;
  title: string;
  levels: ILevel[];
  completed: boolean;
  vimeo_video_id: number;
  lesson_rank: number;
  progress_percent: number;
  video_playback_endpoints: IVideo[];
  description: string;
  banner_button_url: string;
  thumbnail_url: string;
  banner_background_image: string;
  length_in_seconds: string;
  next_lesson: Card;
}

export interface ILevel {
  id: number;
  total_xp: number;
  started: boolean;
  courses: [];
  title: string;
  mobile_app_url: string;
  level_number: number;
  published_on: string;
  completed: boolean;
  vimeo_video_id: number;
  instructor: IInstructor[];
  banner_background_image: string;
  progress_percent: number;
  video_playback_endpoints: IVideo[];
  description: string;
  thumbnail_url: string;
  length_in_seconds: number;
  banner_button_url: string;
  is_added_to_primary_playlist: boolean;
  next_lesson: Card;
}

export interface IInstructor {
  biography: string;
  head_shot_picture_url: string;
  id: number;
  name: string;
}

interface IVideo {
  file: string;
  height: number;
  width: number;
}

export interface MethodState {
  method?: IMethod;
  refreshing: boolean;
}

interface MethodAction {
  type: string;
  method?: IMethod;
  refreshing?: boolean;
}
export interface MethodReducer {
  (state: MethodState, action: MethodAction): MethodState;
}
