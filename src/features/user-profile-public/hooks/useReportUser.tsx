// src/hooks/useReportUser.ts
import { useMutation } from '@tanstack/react-query';
import {
  CreateReportDto,
  ReportTargetType,
  submitReport,
} from '../api/report.api';

interface ReportUserVariables {
  targetId: number;
  reason: string;
  userId?: string;
  targetTitle: string;
}

export function useReportUser() {
  return useMutation({
    mutationFn: ({
      targetId,
      reason,
      userId,
      targetTitle,
    }: ReportUserVariables) => {
      const url = window.location.href;
      const dto: CreateReportDto = {
        targetId,
        userId,
        targetType: ReportTargetType.USER,
        reason,
        targetUrl: url,
        targetTitle,
      };
      console.log('response', dto);
      return submitReport(dto);
    },
  });
}
