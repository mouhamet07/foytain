'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { CreditCard, ArrowUpRight, ArrowDownLeft, Clock } from 'lucide-react';
import api from '@/lib/axios';
import { Header } from '@/components/layout/header';
import { PageHeader } from '@/components/shared/page-header';
import { StatCard } from '@/components/shared/stat-card';
import { StatusBadge } from '@/components/shared/status-badge';
import { EmptyState } from '@/components/shared/empty-state';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { formatCurrency, formatDate, STATUS_LABELS } from '@/lib/utils';
import type { Payment } from '@/types';

export default function PaymentsPage() {
  const [status, setStatus] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['payments', status],
    queryFn: () =>
      api.get('/payments', { params: { status, limit: 50 } }).then((r) => r.data),
  });

  const payments: Payment[] = data?.data ?? [];
  const completed = payments.filter((p) => p.status === 'COMPLETED');
  const totalCompleted = completed.reduce((s, p) => s + Number(p.amount), 0);
  const pending = payments.filter((p) => p.status === 'PENDING').length;

  return (
    <div className="flex flex-col min-h-screen">
      <Header title="Paiements" />
      <div className="flex-1 p-6 animate-fade-in space-y-6">
        <PageHeader title="Historique des paiements" description="Suivez tous vos paiements" />

        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard title="Total payé" value={formatCurrency(totalCompleted)} icon={CreditCard} color="green" loading={isLoading} />
          <StatCard title="Paiements complétés" value={completed.length} icon={ArrowDownLeft} color="blue" loading={isLoading} />
          <StatCard title="En attente" value={pending} icon={Clock} color="yellow" loading={isLoading} />
        </div>

        <div className="flex justify-end">
          <Select value={status} onValueChange={(v) => setStatus(v === 'all' ? '' : v)}>
            <SelectTrigger className="w-44">
              <SelectValue placeholder="Tous les statuts" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous</SelectItem>
              <SelectItem value="COMPLETED">Complétés</SelectItem>
              <SelectItem value="PENDING">En attente</SelectItem>
              <SelectItem value="FAILED">Échoués</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3 py-2">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="flex-1 space-y-1.5">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-48" />
                    </div>
                    <Skeleton className="h-5 w-20 rounded-full" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                ))}
              </div>
            ) : payments.length === 0 ? (
              <EmptyState icon={CreditCard} title="Aucun paiement" description="Vos paiements apparaîtront ici." />
            ) : (
              <div className="divide-y">
                {payments.map((p) => (
                  <div key={p.id} className="flex items-center gap-4 py-3.5">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                      p.status === 'COMPLETED' ? 'bg-green-100 dark:bg-green-900/20' :
                      p.status === 'FAILED' ? 'bg-red-100 dark:bg-red-900/20' :
                      'bg-yellow-100 dark:bg-yellow-900/20'
                    }`}>
                      <CreditCard className={`w-4 h-4 ${
                        p.status === 'COMPLETED' ? 'text-green-600' :
                        p.status === 'FAILED' ? 'text-red-600' : 'text-yellow-600'
                      }`} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{p.description ?? 'Paiement'}</p>
                      <p className="text-xs text-muted-foreground font-mono">{p.reference.slice(0, 16)}…</p>
                      <p className="text-xs text-muted-foreground">{STATUS_LABELS[p.method] ?? p.method}</p>
                    </div>

                    <StatusBadge status={p.status} />

                    <div className="text-right flex-shrink-0">
                      <p className={`text-sm font-bold ${p.status === 'COMPLETED' ? 'text-green-600' : ''}`}>
                        {formatCurrency(Number(p.amount), p.currency)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(p.processedAt ?? p.createdAt)}
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
