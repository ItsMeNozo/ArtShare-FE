import api from '@/api/baseApi';
import { TargetType } from '@/utils/constants';

export enum ReportTargetType {
  POST = TargetType.POST,
  BLOG = TargetType.BLOG,
  COMMENT = 'COMMENT',
  USER = 'USER',
}

export interface CreateReportDto {
  targetId: number;
  targetType: ReportTargetType;
  reason: string;
  userId?: string;
  targetUrl: string;
  targetTitle: string;
}

export enum ViewTab {
  ALL = 'all',
  USER = 'user',
  POST = 'post',
  BLOG = 'blog',
  COMMENT = 'comment',
}

/**
 * Payload for fetching reports by tab.
 */
export interface ViewReportsDto {
  tab?: ViewTab;
  skip?: number;
  take?: number;
}

/**
 * A user summary included on each report.
 */
export interface ReporterSummary {
  id: string;
  username: string;
}

/**
 * Representation of a report returned by the API.
 */
export interface Report {
  id: number;
  reporterId: string;
  moderatorId?: string;
  targetId: number;
  targetType: ReportTargetType;
  reason: string;
  status: string;
  createdAt: string;
  updatedAt?: string;
  resolvedAt?: string;
  resolutionComment?: string;
  reporter: ReporterSummary;
  moderator?: ReporterSummary;
}

/**
 * Submit a new report.
 */
export async function submitReport(
  dto: CreateReportDto,
): Promise<{ message: string; reportId: number }> {
  const response = await api.post<{ message: string; reportId: number }>(
    '/reports',
    dto,
  );
  return response.data;
}

export async function getPendingReports(
  skip?: number,
  take?: number,
): Promise<Report[]> {
  const response = await api.get<Report[]>('/reports/pending', {
    params: { skip, take },
  });
  return response.data;
}

/**
 * Fetch reports filtered by tab (all, user, post, blog, comment).
 */
export async function viewReports(dto: ViewReportsDto): Promise<Report[]> {
  const response = await api.post<Report[]>('/reports/view', dto);
  return response.data;
}

export async function updateReportStatus(
  reportId: number,
  status: string,
): Promise<Report> {
  const resp = await api.patch<Report>(`/reports/${reportId}/status`, {
    status,
  });
  return resp.data;
}

export interface ResolveReportDto {
  resolveDate: string;
  resolutionComment?: string;
}

export async function resolveReport(
  reportId: number,
  dto: ResolveReportDto,
): Promise<Report> {
  const response = await api.patch<Report>(`/reports/${reportId}/resolve`, dto);
  return response.data;
}
