'use client';

import { useQuery } from '@tanstack/react-query';
import { Users, TrendingUp, Heart, CreditCard, Shield } from 'lucide-react';
import api from '@/lib/axios';
import { Header } from '@/components/layout/header';
import { StatCard } from '@/components/shared/stat-card';
import { StatusBadge } from '@/components/shared/status-badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { formatCurrency, formatDate, getInitials } from '@/lib/utils';

export default function AdminPage() {
  const { data: overview, isLoading } = useQuery({
    queryKey: ['admin-overview'],
    queryFn: () => api.get('/admin/overview').then((r) => r.data.data),
  });

  const { data: pendingRequests } = useQuery({
    queryKey: ['admin-pending-requests'],
    queryFn: () => api.get('/admin/medical-requests/pending').then((r) => r.data.data),
  });

  const { data: recentUsers } = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => api.get('/admin/users', { params: { limit: 5 } }).then((r) => r.data),
  });

  const totalUsers = overview?.users?.reduce((s: number, u: any) => s + u._count, 0) ?? 0;
  const totalTontines = overview?.tontines?.reduce((s: number, t: any) => s + t._count, 0) ?? 0;

  return (
    <div className="flex flex-col min-h-screen">
      <Header title="Admin Panel" />
      <div className="flex-1 p-6 animate-fade-in space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
            <Shield className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Tableau de bord Admin</h1>
            <p className="text-muted-foreground text-sm">Gérez la plateforme Foytain</p>
          </div>
        </div>

        {/* Platform Stats */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard title="Utilisateurs" value={totalUsers} icon={Users} color="blue" loading={isLoading} />
          <StatCard title="Tontines" value={totalTontines} icon={TrendingUp} color="green" loading={isLoading} />
          <StatCard title="Demandes en attente" value={overview?.pendingMedical ?? 0} icon={Heart} color="yellow" loading={isLoading} />
          <StatCard
            title="Paiements complétés"
            value={formatCurrency(Number(overview?.totalPayments?._sum?.amount ?? 0))}
            icon={CreditCard}
            color="purple"
            loading={isLoading}
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Pending Medical Requests */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Heart className="w-4 h-4 text-red-500" />
                Demandes médicales en attente
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!pendingRequests ? (
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-14" />)}
                </div>
              ) : pendingRequests.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6">Aucune demande en attente</p>
              ) : (
                <div className="space-y-3">
                  {pendingRequests.map((req: any) => (
                    <div key={req.id} className="flex items-center justify-between gap-3 p-3 rounded-lg border">
                      <div className="flex items-center gap-3 min-w-0">
                        <Avatar className="w-8 h-8">
                          <AvatarFallback className="text-xs bg-primary/10 text-primary">
                            {getInitials(req.user?.firstName ?? 'U', req.user?.lastName ?? 'N')}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">{req.title}</p>
                          <p className="text-xs text-muted-foreground">{req.user?.firstName} · {req.tontine?.name}</p>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-sm font-bold text-primary">{formatCurrency(req.amount)}</p>
                        <StatusBadge status={req.status} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Users */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-500" />
                Utilisateurs récents
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!recentUsers ? (
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-12" />)}
                </div>
              ) : (
                <div className="space-y-3">
                  {recentUsers.data?.map((u: any) => (
                    <div key={u.id} className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <Avatar className="w-8 h-8">
                          <AvatarFallback className="text-xs bg-primary/10 text-primary">
                            {getInitials(u.firstName, u.lastName)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">{u.firstName} {u.lastName}</p>
                          <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                        </div>
                      </div>
                      <div className="flex-shrink-0 text-right">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                          u.role === 'ADMIN' ? 'bg-blue-100 text-blue-700' :
                          u.role === 'SUPER_ADMIN' ? 'bg-purple-100 text-purple-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {u.role}
                        </span>
                        <p className="text-xs text-muted-foreground mt-0.5">{formatDate(u.createdAt)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Platform breakdown */}
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Utilisateurs par rôle</CardTitle>
            </CardHeader>
            <CardContent>
              {overview?.users?.map((u: any) => (
                <div key={u.role} className="flex items-center justify-between py-2 border-b last:border-0">
                  <span className="text-sm font-medium">{u.role}</span>
                  <span className="text-sm font-bold">{u._count}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Tontines par statut</CardTitle>
            </CardHeader>
            <CardContent>
              {overview?.tontines?.map((t: any) => (
                <div key={t.status} className="flex items-center justify-between py-2 border-b last:border-0">
                  <StatusBadge status={t.status} />
                  <span className="text-sm font-bold">{t._count}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
