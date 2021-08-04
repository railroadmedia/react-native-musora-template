export default interface CardProps {
  iconType?: 'next-lesson' | 'progress';
  route: string;
  item: {
    id: number;
    type: string;
    published_on: string;
    sizeInBytes?: number;
    length_in_seconds: number;
    status: string;
    thumbnail_url: string;
    title: string;
    artist: string;
    style: string;
    level_number?: number | undefined;
    instructors: string[];
    completed: boolean;
    progress_percent: number;
    isLocked?: boolean;
    is_added_to_primary_playlist: boolean;
    live_event_start_time?: string;
    live_event_end_time?: string;
  };
  onRemoveItemFromList?: (id: number) => void;
}
