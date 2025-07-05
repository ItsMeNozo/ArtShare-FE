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
        target_id: targetId,
        target_type: targetType,
        reason,
        target_url: url,
        target_title: targetTitle,
      };
      return submitReport(dto);
    },
  });
}
