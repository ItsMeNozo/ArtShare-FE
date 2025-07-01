interface ProjectInfo {
  id: number;
  title: string;
}

export interface Platform {
  id: number;
  name: 'FACEBOOK' | 'INSTAGRAM';
  external_page_id: string;
  config: {
    page_name: string;
    category?: string;
  };
  status: PlatformStatus;
  token_expires_at: string | null;
  picture_url?: string | null;
  autoProjects: ProjectInfo[];
}
