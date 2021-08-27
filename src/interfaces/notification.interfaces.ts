export interface Notification {
  id: number;
  type: string;
  created_at_diff: string;
  recipient: {
    display_name: string;
    email: string;
    id: number;
    profile_image_url: string;
  };
  onNotification: Function;
  onNotificationThreeDotsMenu: Function;
}
