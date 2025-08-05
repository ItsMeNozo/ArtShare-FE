import { BackendErrorResponse } from '@/api/types/error-response.type';
import { ReportTargetType } from '@/features/user-profile-public/api/report.api';
import axios, { AxiosError } from 'axios';

export const extractApiErrorMessage = (
  error: unknown,
  defaultMessage: string,
): string => {
  if (axios.isAxiosError(error) && error.response?.data) {
    const responseData = error.response.data;

    const nestedMessage = responseData.message?.message;
    if (typeof nestedMessage === 'string') {
      return nestedMessage;
    }

    const primaryMessage = responseData.message;
    if (typeof primaryMessage === 'string') {
      return primaryMessage;
    }
  }

  return defaultMessage;
};

export const extractReportErrorMessage = (
  error: unknown,
  itemType: ReportTargetType = ReportTargetType.POST,
): string => {
  if (axios.isAxiosError(error)) {
    const apiError = error as AxiosError<BackendErrorResponse>;
    const { statusCode, message } = apiError.response?.data || {};

    if (statusCode === 409) {
      const itemTypeName = itemType.toLowerCase();
      return `You have already reported this ${itemTypeName}.`;
    }

    return message || `Failed to submit report. Please try again.`;
  }

  return error instanceof Error
    ? error.message
    : 'An unexpected error occurred. Please try again.';
};
