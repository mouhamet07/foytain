'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Users, Calendar, Wallet, Settings, UserPlus, Share2, Heart } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { toast } from 'sonner';
import { tontinesService } from '@/services/tontines.service';
import api from '@/lib/axios';
import { useAuthStore } from '@/store/auth.store';
import { Header } from '@/components/layout/header';
import { StatusBadge } from '@/components/shared/status-badge';
import { StatCard } from '@/components/shared/stat-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { formatCurrency, formatDate, getInitials, STATUS_LABELS } from '@/lib/utils';
import type { Membership } from '@/types';

export default function TontineDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  const { data: tontine, isLoading } = useQuery({
    queryKey: ['tontine', id],
    queryFn: () => tontinesService.findOne(id),
  });

  const { data: statsData } = useQuery({
    queryKey: ['tontine-stats', tontine?.id],
    queryFn: () => api.get(`/contributions/stats/${tontine?.id}`).then((r) => r.data.data),
    enabled: !!tontine?.id,
  });

  const { mutate: joinTontine, isPending: isJoining } = useMutation({
    mutationFn: () => api.post('/memberships/join', { tontineId: tontine?.id }),
    onSuccess: () => {
      toast.success('Demande envoyée!');
      queryClient.invalidateQueries({ queryKey: ['tontine', id] });
    },
    onError: (err: any) => toast.error(err?.response?.data?.message ?? 'Erreur'),
  });

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header title="Tontine" />
        <div className="p-6 space-y-6">
          <Skeleton className="h-56 w-full rounded-2xl" />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28" />)}
          </div>
        </div>
      </div>
    );
  }

  if (!tontine) return <div className="p-6">Tontine introuvable.</div>;

  const isOwner = tontine.ownerId === user?.id;
  const membership = tontine.memberships?.find((m: Membership) => m.userId === user?.id);
  const isMember = membership?.status === 'ACTIVE';
  const isPending = membership?.status === 'PENDING';

  return (
    <div className="flex flex-col min-h-screen">
      <Header title={tontine.name} />
      <div className="flex-1 p-6 animate-fade-in space-y-6">
        {/* Back */}
        <Link href="/tontines" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-4 h-4" /> Retour aux tontines
        </Link>

        {/* Cover + Header */}
        <div className="relative rounded-2xl overflow-hidden h-48 sm:h-64 bg-gradient-to-br from-primary/30 to-primary/10">
          {tontine.coverImageUrl && (
            <Image src={tontine.coverImageUrl} alt={tontine.name} fill className="object-cover" />
          )}
          <div className="absolute inset-0 bg-black/30 flex items-end p-6">
            <div className="flex-1">
              <div className="flex flex-wrap gap-2 mb-2">
                <StatusBadge status={tontine.status} />
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-black/40 text-white">
                  {STATUS_LABELS[tontine.type]}
                </span>
              </div>
              <h1 className="text-2xl font-bold text-white">{tontine.name}</h1>
              <p className="text-white/80 text-sm mt-1">
                par {tontine.owner?.firstName} {tontine.owner?.lastName}
              </p>
            </div>
            <div className="flex gap-2">
              {isOwner && (
                <Button size="sm" variant="secondary" asChild>
                  <Link href={`/tontines/${tontine.slug}/edit`}>
                    <Settings className="w-4 h-4 mr-1" /> Gérer
                  </Link>
                </Button>
              )}
              {!isMember && !isPending && !isOwner && (
                <Button size="sm" onClick={() => joinTontine()} loading={isJoining}>
                  <UserPlus className="w-4 h-4 mr-1" /> Rejoindre
                </Button>
              )}
              {isPending && (
                <Button size="sm" variant="outline" disabled>En attente d&apos;approbation</Button>
              )}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Membres actifs" value={tontine._count?.memberships ?? 0} icon={Users} color="blue" />
          <StatCard title="Cotisation mensuelle" value={formatCurrency(tontine.contributionAmount)} icon={Wallet} color="green" />
          <StatCard title="Total collecté" value={formatCurrency(statsData?.totalCollected ?? 0)} icon={Wallet} color="purple" />
          <StatCard title="Date de début" value={formatDate(tontine.startDate)} icon={Calendar} color="yellow" />
        </div>

        {/* Description */}
        {tontine.description && (
          <Card>
            <CardContent className="p-5">
              <p className="text-sm text-muted-foreground leading-relaxed">{tontine.description}</p>
            </CardContent>
          </Card>
        )}

        {/* Tabs */}
        <Tabs defaultValue="members">
          <TabsList>
            <TabsTrigger value="members">Membres ({tontine.memberships?.length ?? 0})</TabsTrigger>
            <TabsTrigger value="rules">Règles</TabsTrigger>
          </TabsList>

          <TabsContent value="members" className="mt-4">
            <Card>
              <CardContent className="p-5">
                <div className="space-y-3">
                  {tontine.memberships?.map((m: Membership) => (
                    <div key={m.id} className="flex items-center justify-between gap-3 py-1">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-9 h-9">
                          <AvatarImage src={m.user?.avatarUrl} />
                          <AvatarFallback className="text-xs bg-primary/10 text-primary">
                            {getInitials(m.user?.firstName ?? 'U', m.user?.lastName ?? 'N')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">
                            {m.user?.firstName} {m.user?.lastName}
                          </p>
                          <p className="text-xs text-muted-foreground">{m.user?.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground capitalize">{STATUS_LABELS[m.role] ?? m.role}</span>
                        {m.joinedAt && (
                          <span className="text-xs text-muted-foreground">· {formatDate(m.joinedAt)}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="rules" className="mt-4">
            <Card>
              <CardContent className="p-5">
                {tontine.rules ? (
                  <p className="text-sm text-muted-foreground whitespace-pre-line">{tontine.rules}</p>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">Aucune règle définie.</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
