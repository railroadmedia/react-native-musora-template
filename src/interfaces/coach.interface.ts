import type { Card } from './card.interfaces';
import type { Comment } from './lesson.interfaces';

export interface Coach {
  biography: string;
  comments: Comment[];
  duration_in_seconds: number;
  head_shot_picture_url: string;
  id: number;
  lessons: Card[];
  lessons_filter_options: { content_type: [] };
  name: string;
  total_comments: number;
  total_xp: number;
}
