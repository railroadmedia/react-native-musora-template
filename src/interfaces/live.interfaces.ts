export interface Live {
  apiKey?: string;
  chatChannelName?: string;
  id?: number;
  instructor_head_shot_picture_url?: string;
  instructors?: string[];
  isLive?: boolean;
  is_added_to_primary_playlist?: boolean;
  live_event_end_time?: string;
  live_event_start_time?: string;
  questionsChannelName?: string;
  thumbnail_url?: string;
  title?: string;
  token?: string;
  type?: string;
  userId?: number;
  youtube_video_id?: string;
  viewersNo?: number;
}

export interface LiveReducer {
  (state: Live, action: { type: string; method?: Live }): Live;
}
