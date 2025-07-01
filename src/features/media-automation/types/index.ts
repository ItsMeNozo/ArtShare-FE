export enum PlatformStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

export type SharePlatformName = 'FACEBOOK' | 'INSTAGRAM';

export interface FacebookAccount {
  name: string;
  picture_url: string | null;
}

export interface FacebookLoginUrlResponse {
  facebookLoginUrl: string;
}
