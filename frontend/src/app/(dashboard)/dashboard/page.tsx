'use client';

import { useQuery } from '@tanstack/react-query';
import { Users, TrendingUp, Wallet, Heart, Bell, ArrowRight, Clock } from 'lucide-react';
import Link from 'next/link';
import { formatCurrency, formatRelativeDate, STATUS_LABELS } from '@/lib/utils';
import { dashboardService } from '@/services/dashboard.service';
import { useAuth } from '@/store/auth.store';
import { Header } from '@/components/layout/header';
import { StatCard } from '@/components/shared/stat-card';
import { StatusBadge } from '@/components/shared/status-badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { getInitials } from '@/lib/utils';

export default function DashboardPage() {
  const { user } = useAuth();

  const { data, isLoading } = useQuery({
    queryKey: ['dashboard-user'],
    queryFn: dashboardService.getUserDashboard,
  });

  const stats = data?.stats;

  return (
    <div className="flex flex-col min-h-screen">
      <Header title="Tableau de bord" />

      <div className="flex-1 p-6 space-y-8 animate-fade-in">
        {/* Welcome */}
        <div>
          <h2 className="text-xl font-semibold">
            Bonjour, {user?.firstName} 👋
          </h2>
          <p className="text-muted-foreground mt-0.5 text-sm">
            Voici un aperçu de votre activité
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Tontines actives"
            value={stats?.activeTontines ?? 0}
            icon={TrendingUp}
            color="blue"
            loading={isLoading}
          />
          <StatCard
            title="Total cotisé"
            value={formatCurrency(stats?.totalPaid ?? 0)}
            icon={Wallet}
            color="green"
            loading={isLoading}
          />
          <StatCard
            title="Cotisations en attente"
            value={stats?.pendingContributions ?? 0}
            icon={Clock}
            color="yellow"
            loading={isLoading}
          />
          <StatCard
            title="Cotisations en retard"
            value={stats?.lateContributions ?? 0}
            icon={Bell}
            color="red"
            loading={isLoading}
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Recent Contributions */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-base">Cotisations récentes</CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/contributions" className="gap-1 text-xs">
                  Voir tout <ArrowRight className="w-3 h-3" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {isLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Skeleton className="h-9 w-9 rounded-lg" />
                    <div className="flex-1 space-y-1.5">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                    <Skeleton className="h-5 w-16 rounded-full" />
                  </div>
                ))
              ) : data?.recentActivity?.contributions?.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">Aucune cotisation</p>
              ) : (
                data?.recentActivity?.contributions?.map((c: any) => (
                  <div key={c.id} className="flex items-center justify-between gap-3 py-1">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 bg-muted rounded-lg flex items-center justify-center flex-shrink-0">
                        <Wallet className="w-4 h-4 text-muted-foreground" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{c.tontine?.name}</p>
                        <p className="text-xs text-muted-foreground">{c.periodLabel}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <p className="text-sm font-semibold">{formatCurrency(c.amount)}</p>
                      <StatusBadge status={c.status} />
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Recent Medical Requests */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-base">Demandes médicales</CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/medical-requests" className="gap-1 text-xs">
                  Voir tout <ArrowRight className="w-3 h-3" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {isLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Skeleton className="h-9 w-9 rounded-full" />
                    <div className="flex-1 space-y-1.5">
                      <Skeleton className="h-4 w-40" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                    <Skeleton className="h-5 w-16 rounded-full" />
                  </div>
                ))
              ) : data?.recentActivity?.medicalRequests?.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">Aucune demande</p>
              ) : (
                data?.recentActivity?.medicalRequests?.map((req: any) => (
                  <Link key={req.id} href={`/medical-requests/${req.id}`}
                    className="flex items-center justify-between gap-3 py-1 hover:opacity-80 transition-opacity">
                    <div className="flex items-center gap-3 min-w-0">
                      <Avatar className="w-9 h-9 flex-shrink-0">
                        <AvatarFallback className="text-xs bg-primary/10 text-primary">
                          {getInitials(req.user?.firstName ?? 'U', req.user?.lastName ?? 'N')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{req.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {req.user?.firstName} · {req.tontine?.name}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <p className="text-sm font-semibold">{formatCurrency(req.amount)}</p>
                      <StatusBadge status={req.status} />
                    </div>
                  </Link>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Actions rapides</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: 'Créer une tontine', href: '/tontines/create', icon: TrendingUp, color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' },
                { label: 'Rejoindre une tontine', href: '/tontines', icon: Users, color: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' },
                { label: 'Demande médicale', href: '/medical-requests/create', icon: Heart, color: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' },
                { label: 'Mes cotisations', href: '/contributions', icon: Wallet, color: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400' },
              ].map((action) => (
                <Link
                  key={action.label}
                  href={action.href}
                  className="flex flex-col items-center gap-3 p-4 rounded-xl border hover:bg-muted/50 transition-colors text-center"
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${action.color}`}>
                    <action.icon className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-medium leading-tight">{action.label}</span>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
