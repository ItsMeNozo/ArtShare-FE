import api from '@/api/baseApi';
import axios from 'axios';

export interface CreateCheckoutSessionPayload {
  planId: string;
  email?: string;
  userId?: string;
}

export interface CreateCheckoutSessionResponse {
  url: string;
  type: 'checkout' | 'portal';
}

export const createCheckoutSession = async (
  payload?: CreateCheckoutSessionPayload,
): Promise<CreateCheckoutSessionResponse> => {
  const endpoint = `/api/stripe/create-checkout-session`;
  try {
    const response = await api.post<CreateCheckoutSessionResponse>(
      endpoint,
      payload,
    );
    if (!response.data?.url) {
      throw new Error('Received invalid session data from server.');
    }
    return response.data;
  } catch (error) {
    console.error(`API Error calling ${endpoint}:`, error);
    let errorMessage = 'Could not initiate checkout.';
    if (axios.isAxiosError(error)) {
      errorMessage =
        error.response?.data?.message || error.message || errorMessage;
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }
    throw new Error(errorMessage);
  }
};

export const createCustomerPortalSession = async (): Promise<{
  url: string;
}> => {
  const endpoint = `/api/stripe/create-customer-portal-session`;
  try {
    const response = await api.post<{ url: string }>(endpoint);
    if (!response.data?.url) throw new Error('Invalid portal session data.');
    return response.data;
  } catch (error) {
    console.error(`API Error calling ${endpoint}:`, error);
    let errorMessage = 'Could not open customer portal.';
    if (axios.isAxiosError(error)) {
      errorMessage =
        error.response?.data?.message || error.message || errorMessage;
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }
    throw new Error(errorMessage);
  }
};
