'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Bell, CheckCheck, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { notificationsService } from '@/services/notifications.service';
import { Header } from '@/components/layout/header';
import { EmptyState } from '@/components/shared/empty-state';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { cn, formatRelativeDate } from '@/lib/utils';
import type { Notification } from '@/types';

const NOTIFICATION_ICONS: Record<string, string> = {
  MEMBERSHIP_APPROVED: '✅',
  MEMBERSHIP_REJECTED: '❌',
  CONTRIBUTION_DUE: '💳',
  CONTRIBUTION_LATE: '⚠️',
  CONTRIBUTION_PAID: '✅',
  MEDICAL_REQUEST_CREATED: '🏥',
  MEDICAL_REQUEST_APPROVED: '✅',
  MEDICAL_REQUEST_REJECTED: '❌',
  VOTE_OPENED: '🗳️',
  VOTE_CLOSED: '🔒',
  PAYMENT_RECEIVED: '💰',
  PAYMENT_FAILED: '❌',
  SYSTEM: '🔔',
  TONTINE_INVITE: '📨',
};

export default function NotificationsPage() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => notificationsService.findAll({ limit: 50 }),
  });

  const { mutate: markAllRead, isPending: isMarking } = useMutation({
    mutationFn: notificationsService.markAllAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications-count'] });
      toast.success('Toutes les notifications marquées comme lues');
    },
  });

  const { mutate: markRead } = useMutation({
    mutationFn: (id: string) => notificationsService.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications-count'] });
    },
  });

  const { mutate: deleteNotif } = useMutation({
    mutationFn: (id: string) => notificationsService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast.success('Notification supprimée');
    },
  });

  const notifications: Notification[] = data?.data ?? [];
  const unreadCount = data?.meta?.unreadCount ?? 0;

  return (
    <div className="flex flex-col min-h-screen">
      <Header title="Notifications" />
      <div className="flex-1 p-6 animate-fade-in">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Notifications</h1>
            {unreadCount > 0 && (
              <p className="text-muted-foreground mt-0.5 text-sm">{unreadCount} non lue{unreadCount > 1 ? 's' : ''}</p>
            )}
          </div>
          {unreadCount > 0 && (
            <Button variant="outline" size="sm" onClick={() => markAllRead()} loading={isMarking} className="gap-2">
              <CheckCheck className="w-4 h-4" />
              Tout marquer comme lu
            </Button>
          )}
        </div>

        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-4 flex gap-4">
                  <Skeleton className="h-10 w-10 rounded-xl flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-3 w-64" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <EmptyState
            icon={Bell}
            title="Aucune notification"
            description="Vous n'avez pas encore de notifications. Elles apparaîtront ici."
          />
        ) : (
          <div className="space-y-2">
            {notifications.map((n) => (
              <Card
                key={n.id}
                className={cn('transition-colors', !n.isRead && 'border-primary/20 bg-primary/5 dark:bg-primary/5')}
              >
                <CardContent className="p-4">
                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center text-lg flex-shrink-0">
                      {NOTIFICATION_ICONS[n.type] ?? '🔔'}
                    </div>

                    <div className="flex-1 min-w-0" onClick={() => !n.isRead && markRead(n.id)}>
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className={cn('text-sm', !n.isRead && 'font-semibold')}>{n.title}</p>
                          <p className="text-sm text-muted-foreground mt-0.5">{n.message}</p>
                          <p className="text-xs text-muted-foreground mt-1.5">{formatRelativeDate(n.createdAt)}</p>
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          {!n.isRead && (
                            <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-muted-foreground hover:text-destructive"
                            onClick={(e) => { e.stopPropagation(); deleteNotif(n.id); }}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
