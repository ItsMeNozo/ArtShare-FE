export enum PlatformStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

export type SharePlatformName = 'FACEBOOK' | 'INSTAGRAM';

export interface FacebookAccount {
  name: string;
  pictureUrl: string | null;
}

export interface FacebookLoginUrlResponse {
  facebookLoginUrl: string;
}
