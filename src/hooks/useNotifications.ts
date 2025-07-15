import type { NotificationsContextType } from '@/contexts/NotificationsContext';
import { useNotifications as useNotificationsContext } from '@/contexts/NotificationsContext';

export const useNotifications = (): NotificationsContextType => {
  return useNotificationsContext();
};
