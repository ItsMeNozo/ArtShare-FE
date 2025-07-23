import { parseISO } from 'date-fns';
import { Event } from 'react-big-calendar';

interface Platform {
  id: number;
  name: string;
}

interface AutoProject {
  id: number;
  title: string;
  status: string;
  platform: Platform;
  postCount: number;
  nextPostAt: string | null;
}

interface Post {
  id: number;
  autoProjectId: number;
  content: string;
  scheduledAt: string | null;
  status: 'PENDING' | 'POSTED';
}

export const transformDataToEvents = (
  projects: AutoProject[],
  posts: Post[],
): Event[] => {
  const events: Event[] = [];

  posts.forEach((post) => {
    const project = projects.find((p) => p.id === post.autoProjectId);
    if (project && post.scheduledAt) {
      const startDate = parseISO(post.scheduledAt);
      const endDate = new Date(startDate.getTime() + 60 * 60 * 1000);
      events.push({
        title: `${project.title}`,
        start: startDate,
        end: endDate,
        resource: {
          status: post.status,
          content: post.content,
          platform: project.platform.name,
        },
      });
    }
  });
  return events;
};
