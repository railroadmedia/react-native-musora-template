export interface BannerPack {
  id: number;
  type: string;
  price: string;
  pack_logo: string;
  started: boolean;
  is_owned: boolean;
  mobile_app_url: string;
  completed: boolean;
  thumbnail: string;
  full_price: string;
  bundle_count: number;
  next_lesson_url: string;
  description: string;
}

export interface Pack {
  id: number;
  type: string;
  price: string;
  is_new: boolean;
  pack_logo: string;
  thumbnail: string;
  is_locked: boolean;
  mobile_app_url: string;
  bundle_count: number;
}
