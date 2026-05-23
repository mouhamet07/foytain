'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus, Heart, ThumbsUp, ThumbsDown, Clock } from 'lucide-react';
import Link from 'next/link';
import { medicalRequestsService } from '@/services/medical-requests.service';
import { Header } from '@/components/layout/header';
import { PageHeader } from '@/components/shared/page-header';
import { StatusBadge } from '@/components/shared/status-badge';
import { EmptyState } from '@/components/shared/empty-state';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { formatCurrency, formatRelativeDate, getInitials } from '@/lib/utils';
import type { MedicalRequest } from '@/types';

export default function MedicalRequestsPage() {
  const [tab, setTab] = useState<'all' | 'my'>('all');
  const [status, setStatus] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['medical-requests', tab, status],
    queryFn: () =>
      tab === 'my'
        ? medicalRequestsService.getMy({ status })
        : medicalRequestsService.findAll({ status }),
  });

  return (
    <div className="flex flex-col min-h-screen">
      <Header title="Demandes médicales" />
      <div className="flex-1 p-6 animate-fade-in">
        <PageHeader
          title="Demandes médicales"
          description="Gérez et votez pour les demandes d'aide médicale"
          action={{ label: 'Nouvelle demande', href: '/medical-requests/create', icon: Plus }}
        />

        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <Tabs value={tab} onValueChange={(v) => setTab(v as 'all' | 'my')} className="w-auto">
            <TabsList>
              <TabsTrigger value="all">Toutes</TabsTrigger>
              <TabsTrigger value="my">Mes demandes</TabsTrigger>
            </TabsList>
          </Tabs>
          <Select value={status} onValueChange={(v) => setStatus(v === 'all' ? '' : v)}>
            <SelectTrigger className="w-full sm:w-44">
              <SelectValue placeholder="Tous les statuts" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les statuts</SelectItem>
              <SelectItem value="PENDING">En attente</SelectItem>
              <SelectItem value="APPROVED">Approuvée</SelectItem>
              <SelectItem value="REJECTED">Refusée</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-5 flex gap-4">
                  <Skeleton className="h-12 w-12 rounded-full flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-48" />
                    <Skeleton className="h-4 w-64" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : data?.data?.length === 0 ? (
          <EmptyState
            icon={Heart}
            title="Aucune demande médicale"
            description="Soyez le premier à soumettre une demande d'aide médicale dans votre tontine."
            action={{ label: 'Soumettre une demande', href: '/medical-requests/create' }}
          />
        ) : (
          <div className="space-y-4">
            {data?.data?.map((req: MedicalRequest) => (
              <MedicalRequestCard key={req.id} request={req} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function MedicalRequestCard({ request }: { request: MedicalRequest }) {
  const totalVotes = (request.voteStats?.for ?? 0) + (request.voteStats?.against ?? 0);
  const forPercent = totalVotes > 0 ? Math.round(((request.voteStats?.for ?? 0) / totalVotes) * 100) : 0;

  return (
    <Link href={`/medical-requests/${request.id}`}>
      <Card className="hover:shadow-md transition-all hover:-translate-y-0.5 duration-150 cursor-pointer">
        <CardContent className="p-5">
          <div className="flex items-start gap-4">
            <Avatar className="w-11 h-11 flex-shrink-0">
              <AvatarImage src={request.user?.avatarUrl} />
              <AvatarFallback className="bg-red-100 text-red-600 text-sm">
                {getInitials(request.user?.firstName ?? 'U', request.user?.lastName ?? 'N')}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 mb-1">
                <div>
                  <h3 className="font-semibold line-clamp-1">{request.title}</h3>
                  <p className="text-xs text-muted-foreground">
                    {request.user?.firstName} {request.user?.lastName} · {request.tontine?.name}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <p className="text-base font-bold text-primary">{formatCurrency(request.amount)}</p>
                  <StatusBadge status={request.status} />
                </div>
              </div>

              <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{request.description}</p>

              {/* Vote progress */}
              {request.voteStats && totalVotes > 0 && (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1 text-green-600">
                        <ThumbsUp className="w-3 h-3" /> {request.voteStats.for}
                      </span>
                      <span className="flex items-center gap-1 text-red-500">
                        <ThumbsDown className="w-3 h-3" /> {request.voteStats.against}
                      </span>
                    </div>
                    <span>{totalVotes} votes</span>
                  </div>
                  <Progress value={forPercent} className="h-1.5" />
                </div>
              )}

              <div className="flex items-center justify-between mt-2">
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {formatRelativeDate(request.createdAt)}
                </p>
                {request.votingDeadline && request.status === 'PENDING' && (
                  <p className="text-xs text-muted-foreground">
                    Vote jusqu&apos;au {new Date(request.votingDeadline).toLocaleDateString('fr-FR')}
                  </p>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
