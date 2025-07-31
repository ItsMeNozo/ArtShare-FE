export enum PlatformStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

export type SharePlatformName = 'FACEBOOK' | 'INSTAGRAM';

export interface FacebookAccount {
  name: string;
  pictureUrl: string | null;
  platforms: FacebookPlatform[];
}

export interface FacebookPlatform {
  id: number;
  name: SharePlatformName;
  externalPageId: string;
  tokenExpiresAt: Date | null;
  status: PlatformStatus;
}

export interface FacebookLoginUrlResponse {
  facebookLoginUrl: string;
}
