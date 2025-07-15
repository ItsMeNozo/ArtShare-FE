import { BackendErrorResponse } from '@/api/types/error-response.type';
import { ReportTargetType } from '@/features/user-profile-public/api/report.api';
import axios, { AxiosError } from 'axios';

export const extractApiErrorMessage = (
  error: unknown,
  fallbackMessage: string,
): string => {
  return axios.isAxiosError(error)
    ? ((error as AxiosError<BackendErrorResponse>).response?.data?.message ??
        fallbackMessage)
    : error instanceof Error
      ? error.message
      : 'An unexpected error occurred. Please try again.';
};

export const extractReportErrorMessage = (
  error: unknown,
  itemType: ReportTargetType = ReportTargetType.POST,
): string => {
  if (axios.isAxiosError(error)) {
    const apiError = error as AxiosError<BackendErrorResponse>;
    const { statusCode, message } = apiError.response?.data || {};

    if (statusCode === 409) {
      // Convert enum to user-friendly string
      const itemTypeName = itemType.toLowerCase();
      return `You have already reported this ${itemTypeName}.`;
    }

    return message || `Failed to submit report. Please try again.`;
  }

  return error instanceof Error
    ? error.message
    : 'An unexpected error occurred. Please try again.';
};
