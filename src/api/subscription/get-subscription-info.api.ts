import api from '../baseApi';

export enum SubscriptionPlan {
  FREE = 'free',
  ARTIST_PRO = 'artist_pro',
  STUDIO = 'studio',
  ENTERPRISE = 'enterprise',
}

export interface SubscriptionInfoDto {
  plan: SubscriptionPlan;
  aiCreditRemaining: number;
  dailyAiCreditLimit: number;
  createdAt: Date;
  expiresAt: Date;
}

export const getSubscriptionInfo = async () => {
  try {
    const response = await api.get<SubscriptionInfoDto>(`/subscription/info`);
    return response.data;
  } catch (error) {
    console.error('Error fetching subscription info:', error);
    throw error;
  }
};
