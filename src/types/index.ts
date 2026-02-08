export type CardType = 'text' | 'image' | 'map' | 'social' | 'link' | 'section-header';

export type CardSize = 'small' | 'medium' | 'large' | 'wide' | 'tall';

export type SocialPlatform =
  | 'twitter'
  | 'youtube'
  | 'instagram'
  | 'github'
  | 'linkedin'
  | 'threads'
  | 'behance'
  | 'dribbble'
  | 'pinterest'
  | 'paypal'
  | 'telegram'
  | 'contra'
  | 'layers';

export interface BentoCard {
  id: string;
  type: CardType;
  size: CardSize;
  content?: string;
  title?: string;
  imageUrl?: string;
  socialPlatform?: SocialPlatform;
  socialUsername?: string;
  socialUrl?: string;
  mapLocation?: string;
  linkUrl?: string;
  bgColor?: string;
  linkTitle?: string;
  linkDescription?: string;
  linkImage?: string;
  linkFavicon?: string;
  caption?: string;
  richContent?: object;
}

export interface UserProfile {
  name: string;
  bio: string;
  avatar: string;
  location?: string;
}

export interface Theme {
  backgroundColor: string;
  accentColor: string;
  isDarkMode: boolean;
}

export interface BentoImportData {
  profile: UserProfile;
  cards: BentoCard[];
  theme: Theme;
}
