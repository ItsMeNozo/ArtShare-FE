import api from '@/api/baseApi';
import { connectToNotifications } from '@/api/sockets/socket';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import type { Socket } from 'socket.io-client';
import {
  Notification,
  NotificationsContext,
  NotificationsContextType,
  ReportResolvedPayload,
} from './NotificationsContext';
import { useUser } from './user/useUser';

export const NotificationsProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user } = useUser();
  const socketRef = useRef<Socket | null>(null);
  const [notifications, setNotifications] = useState<
    Notification<ReportResolvedPayload>[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Helper function to start polling only when absolutely necessary
  const startPollingFallback = useCallback(() => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
    }

    console.log(
      '[NotificationsProvider] Starting polling fallback (every 5 minutes)',
    );

    const checkForNotifications = async () => {
      try {
        const res = await api.get('/notifications');
        if (res.status === 200 || res.status === 201) {
          const freshNotifications: Notification<ReportResolvedPayload>[] =
            res.data.filter(
              (notification: Notification<ReportResolvedPayload>) =>
                notification.type !== 'report_created',
            );

          setNotifications((prev) => {
            const currentIds = new Set(prev.map((n) => n.id));
            const freshIds = new Set(freshNotifications.map((n) => n.id));

            // Only update if there are actually new notifications
            if (
              freshNotifications.length !== prev.length ||
              !Array.from(freshIds).every((id) => currentIds.has(id))
            ) {
              console.log(
                '[NotificationsProvider] Found new notifications via polling',
              );
              return freshNotifications;
            }
            return prev;
          });
        }
      } catch (error) {
        console.error('[NotificationsProvider] Polling failed:', error);
      }
    };

    // Poll every 5 minutes (300000ms) instead of every 30 seconds
    pollingIntervalRef.current = setInterval(checkForNotifications, 300000);
  }, []);

  const stopPollingFallback = useCallback(() => {
    if (pollingIntervalRef.current) {
      console.log('[NotificationsProvider] Stopping polling fallback');
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
  }, []);
  // Only establish one socket connection per user
  useEffect(() => {
    if (!user?.id) {
      setNotifications([]);
      setLoading(false);
      setIsConnected(false);
      return;
    }

    // Cleanup any existing connection
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }

    // Stop any existing polling
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }

    // Establish new connection
    setLoading(true);

    socketRef.current = connectToNotifications(user.id);

    // Handle incoming notifications
    const handler = (notification: Notification<ReportResolvedPayload>) => {
      if (notification.type === 'report_created') return;
      setNotifications((prev) => {
        // Prevent duplicates by checking if notification already exists
        const exists = prev.some((n) => n.id === notification.id);
        if (exists) {
          return prev;
        }
        const updated = [notification, ...prev];
        return updated;
      });
    };

    // Handle report resolved notifications specifically
    const reportResolvedHandler = (data: Record<string, unknown>) => {
      // Convert to standard notification format if needed
      const payload = data.payload as Record<string, unknown> | undefined;
      const notification: Notification<ReportResolvedPayload> = {
        id:
          (data.id as string) ||
          `report_${(data.reportId as number) || 'unknown'}_${Date.now()}`,
        userId: user.id,
        type: 'report_resolved',
        payload: {
          message:
            (data.message as string) ||
            (payload?.message as string) ||
            'Your report has been resolved',
          reportId:
            (data.reportId as number) || (payload?.reportId as number) || 0,
          resolvedAt:
            (data.resolvedAt as string) ||
            (payload?.resolvedAt as string) ||
            new Date().toISOString(),
        },
        isRead: false,
        createdAt: new Date().toISOString(),
      };
      handler(notification);
    };

    // Set up socket event listeners IMMEDIATELY
    if (socketRef.current) {
      // Add the notification listener immediately
      socketRef.current.on('new-notification', handler);

      // Listen for specific report resolved events (backend might emit different event names)
      socketRef.current.on('report_resolved', reportResolvedHandler);
      socketRef.current.on('reportResolved', reportResolvedHandler);
      socketRef.current.on('report-resolved', reportResolvedHandler);

      // Listen for common event patterns to debug (but don't auto-refresh)
      socketRef.current.onAny((eventName: string, ...args) => {
        if (
          ![
            'connect',
            'disconnect',
            'connect_error',
            'reconnect',
            'reconnect_attempt',
            'reconnect_error',
            'reconnect_failed',
            'ping',
            'pong',
          ].includes(eventName)
        ) {
          console.log(
            `[NotificationsProvider] Received socket event: ${eventName}`,
            args,
          );
          // Don't auto-refresh here - let the specific handlers deal with new notifications
        }
      });

      // Also listen for connection events to ensure we're ready
      socketRef.current.on('connect', () => {
        console.log('[NotificationsProvider] Socket connected successfully');
        setIsConnected(true);
        stopPollingFallback();
      });

      socketRef.current.on('disconnect', () => {
        console.log('[NotificationsProvider] Socket disconnected');
        setIsConnected(false);
        // Start polling only after a longer delay to allow for reconnection
        setTimeout(() => {
          if (!socketRef.current?.connected && user?.id) {
            console.log(
              '[NotificationsProvider] Socket still disconnected, starting polling fallback',
            );
            startPollingFallback();
          }
        }, 30000); // Wait 30 seconds before falling back to polling
      });

      socketRef.current.on('connect_error', (error) => {
        console.error(
          '[NotificationsProvider] Socket connection error:',
          error,
        );
        console.error(
          '[NotificationsProvider] Make sure the backend server is running!',
        );
        setIsConnected(false);
        // Start polling fallback on connection error, but wait longer
        setTimeout(() => {
          if (!socketRef.current?.connected && user?.id) {
            console.log(
              '[NotificationsProvider] Starting polling fallback due to connection error',
            );
            startPollingFallback();
          }
        }, 60000); // Wait 1 minute before falling back to polling
      });

      socketRef.current.on('error', (error) => {
        console.error('[NotificationsProvider] Socket error:', error);
      });

      // Add additional debugging for socket connection
      socketRef.current.on('reconnect', () => {
        console.log('[NotificationsProvider] Socket reconnected successfully');
        setIsConnected(true);
        stopPollingFallback();
      });

      socketRef.current.on('reconnect_attempt', () => {
        // Reconnection attempt in progress
      });

      socketRef.current.on('reconnect_error', (error) => {
        console.error(
          '[NotificationsProvider] Socket reconnection failed:',
          error,
        );
      });

      socketRef.current.on('reconnect_failed', () => {
        console.error(
          '[NotificationsProvider] Socket reconnection failed permanently - backend may be down',
        );
        // Start polling as last resort
        setTimeout(() => {
          if (!socketRef.current?.connected && user?.id) {
            console.log(
              '[NotificationsProvider] Starting polling fallback due to permanent reconnection failure',
            );
            startPollingFallback();
          }
        }, 10000); // Wait 10 seconds before falling back to polling
      });
    }

    // Load initial notifications
    (async () => {
      try {
        const res = await api.get('/notifications');
        if (res.status !== 200 && res.status !== 201) {
          console.log('failed res:', res);
          throw new Error('Failed to fetch notifications');
        }
        const existing: Notification<ReportResolvedPayload>[] = res.data;
        const freshNotifications: Notification<ReportResolvedPayload>[] =
          existing.filter(
            (notification: Notification<ReportResolvedPayload>) =>
              notification.type !== 'report_created',
          );

        // Merge with any notifications received via socket while loading
        setNotifications((prev) => {
          // Get IDs of existing notifications to avoid duplicates
          const existingIds = freshNotifications.map((n) => n.id);
          const socketNotifications = prev.filter(
            (n) => !existingIds.includes(n.id),
          );

          // Combine socket notifications (newer) with existing notifications
          return [...socketNotifications, ...freshNotifications];
        });
      } catch (err) {
        console.error(
          '[NotificationsProvider] could not load initial notifications:',
          err,
        );
        // Don't clear socket notifications if API fails
        setNotifications((prev) => prev);
        // Start polling if initial load fails AND socket isn't connected
        if (!socketRef.current?.connected) {
          console.log(
            '[NotificationsProvider] Initial load failed and socket not connected, starting polling',
          );
          startPollingFallback();
        }
      } finally {
        setLoading(false);
      }
    })();

    // Cleanup on unmount or user change
    return () => {
      stopPollingFallback();
      if (socketRef.current) {
        socketRef.current.off('new-notification', handler);
        socketRef.current.off('report_resolved', reportResolvedHandler);
        socketRef.current.off('reportResolved', reportResolvedHandler);
        socketRef.current.off('report-resolved', reportResolvedHandler);
        socketRef.current.off('connect');
        socketRef.current.off('disconnect');
        socketRef.current.off('connect_error');
        socketRef.current.off('error');
        socketRef.current.offAny();
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [user?.id, startPollingFallback, stopPollingFallback]);
  const markAsRead = async (notificationId: string) => {
    // Optimistic update - immediately update the UI
    setNotifications((prev) => {
      const updated = prev.map((notif) =>
        notif.id === notificationId ? { ...notif, isRead: true } : notif,
      );
      return updated;
    });

    try {
      const res = await api.post('/notifications/read', { id: notificationId });
      if (res.status !== 200 && res.status !== 201) {
        // Revert the optimistic update if the API call failed
        setNotifications((prev) =>
          prev.map((notif) =>
            notif.id === notificationId ? { ...notif, isRead: false } : notif,
          ),
        );
        throw new Error('Failed to mark notification as read');
      }
    } catch (error) {
      console.error(
        '[NotificationsProvider] Failed to mark notification as read:',
        error,
      );
      // Revert the optimistic update
      setNotifications((prev) =>
        prev.map((notif) =>
          notif.id === notificationId ? { ...notif, isRead: false } : notif,
        ),
      );
    }
  };
  const markAllAsRead = async () => {
    try {
      const unreadIds = notifications.filter((n) => !n.isRead).map((n) => n.id);
      if (unreadIds.length === 0) return;

      const res = await api.post('/notifications/read-all');
      if (res.status === 200 || res.status === 201) {
        setNotifications((prev) =>
          prev.map((notif) => ({ ...notif, isRead: true })),
        );
      }
    } catch (error) {
      console.error(
        '[NotificationsProvider] Failed to mark all notifications as read:',
        error,
      );
    }
  };

  const unreadCount = useMemo(() => {
    const count = notifications.filter((notif) => !notif.isRead).length;
    return count;
  }, [notifications]);

  const value: NotificationsContextType = {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    loading,
    isConnected,
  };

  return (
    <NotificationsContext.Provider value={value}>
      {children}{' '}
    </NotificationsContext.Provider>
  );
};
