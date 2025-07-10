import { useMutation } from '@tanstack/react-query';
import {
  CreateReportDto,
  ReportTargetType,
  submitReport,
} from '../api/report.api';

interface ReportVariables {
  targetId: number;
  targetType: ReportTargetType;
  reason: string;
  targetTitle: string;
}

export function useReport() {
  return useMutation({
    mutationFn: ({
      targetId,
      reason,
      targetType,
      targetTitle,
    }: ReportVariables) => {
      const url = window.location.href;
      const dto: CreateReportDto = {
        targetId,
        targetType,
        reason,
        targetUrl: url,
        targetTitle,
      };
      return submitReport(dto);
    },
  });
}
