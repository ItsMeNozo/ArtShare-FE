interface ProjectInfo {
  id: number;
  title: string;
}

export interface Platform {
  id: number;
  name: 'FACEBOOK' | 'INSTAGRAM';
  externalPageId: string;
  config: {
    pageName: string;
    category?: string;
  };
  status: PlatformStatus;
  tokenExpiresAt: string | null;
  pictureUrl?: string | null;
  autoProjects: ProjectInfo[];
}
