'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Wallet, Calendar, TrendingUp, AlertCircle } from 'lucide-react';
import api from '@/lib/axios';
import { Header } from '@/components/layout/header';
import { PageHeader } from '@/components/shared/page-header';
import { StatCard } from '@/components/shared/stat-card';
import { StatusBadge } from '@/components/shared/status-badge';
import { EmptyState } from '@/components/shared/empty-state';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { formatCurrency, formatDate } from '@/lib/utils';
import type { Contribution } from '@/types';

export default function ContributionsPage() {
  const [status, setStatus] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['contributions-my', status],
    queryFn: () =>
      api.get('/contributions/my', { params: { status, limit: 50 } }).then((r) => r.data),
  });

  const contributions: Contribution[] = data?.data ?? [];

  const paid = contributions.filter((c) => c.status === 'PAID').length;
  const unpaid = contributions.filter((c) => c.status === 'UNPAID').length;
  const late = contributions.filter((c) => c.status === 'LATE').length;
  const totalPaid = contributions
    .filter((c) => c.status === 'PAID')
    .reduce((sum, c) => sum + Number(c.amount), 0);

  return (
    <div className="flex flex-col min-h-screen">
      <Header title="Cotisations" />
      <div className="flex-1 p-6 animate-fade-in space-y-6">
        <PageHeader title="Mes Cotisations" description="Historique et suivi de vos cotisations" />

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard title="Total payé" value={formatCurrency(totalPaid)} icon={TrendingUp} color="green" loading={isLoading} />
          <StatCard title="Payées" value={paid} icon={Wallet} color="green" loading={isLoading} />
          <StatCard title="En attente" value={unpaid} icon={Calendar} color="yellow" loading={isLoading} />
          <StatCard title="En retard" value={late} icon={AlertCircle} color="red" loading={isLoading} />
        </div>

        {/* Filter */}
        <div className="flex justify-end">
          <Select value={status} onValueChange={(v) => setStatus(v === 'all' ? '' : v)}>
            <SelectTrigger className="w-44">
              <SelectValue placeholder="Tous les statuts" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les statuts</SelectItem>
              <SelectItem value="PAID">Payées</SelectItem>
              <SelectItem value="UNPAID">Non payées</SelectItem>
              <SelectItem value="LATE">En retard</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* List */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Historique des cotisations</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3 py-2">
                    <Skeleton className="h-10 w-10 rounded-lg" />
                    <div className="flex-1 space-y-1.5">
                      <Skeleton className="h-4 w-40" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                    <Skeleton className="h-5 w-20 rounded-full" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                ))}
              </div>
            ) : contributions.length === 0 ? (
              <EmptyState icon={Wallet} title="Aucune cotisation" description="Vous n'avez pas encore de cotisations enregistrées." />
            ) : (
              <div className="divide-y">
                {contributions.map((c) => (
                  <div key={c.id} className="flex items-center gap-4 py-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      c.status === 'PAID' ? 'bg-green-100 dark:bg-green-900/20' :
                      c.status === 'LATE' ? 'bg-red-100 dark:bg-red-900/20' :
                      'bg-yellow-100 dark:bg-yellow-900/20'
                    }`}>
                      <Wallet className={`w-4 h-4 ${
                        c.status === 'PAID' ? 'text-green-600' :
                        c.status === 'LATE' ? 'text-red-600' : 'text-yellow-600'
                      }`} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{c.tontine?.name}</p>
                      <p className="text-xs text-muted-foreground">{c.periodLabel}</p>
                    </div>

                    <StatusBadge status={c.status} />

                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-semibold">{formatCurrency(Number(c.amount))}</p>
                      <p className="text-xs text-muted-foreground">
                        {c.paidAt ? `Payé le ${formatDate(c.paidAt)}` : `Échéance ${formatDate(c.dueDate)}`}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
