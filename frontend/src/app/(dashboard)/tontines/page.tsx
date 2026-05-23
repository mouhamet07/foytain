'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus, Search, Filter, Users, Calendar, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { tontinesService } from '@/services/tontines.service';
import { Header } from '@/components/layout/header';
import { PageHeader } from '@/components/shared/page-header';
import { StatusBadge } from '@/components/shared/status-badge';
import { EmptyState } from '@/components/shared/empty-state';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatCurrency, formatDate, getInitials, STATUS_LABELS } from '@/lib/utils';
import type { Tontine } from '@/types';

export default function TontinesPage() {
  const [search, setSearch] = useState('');
  const [type, setType] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['tontines', search, type, status, page],
    queryFn: () => tontinesService.findAll({ search, type, status, page, limit: 12 }),
    staleTime: 20000,
  });

  return (
    <div className="flex flex-col min-h-screen">
      <Header title="Tontines" />
      <div className="flex-1 p-6 animate-fade-in">
        <PageHeader
          title="Explorer les Tontines"
          description="Trouvez et rejoignez des tontines médicales"
          action={{ label: 'Créer une tontine', href: '/tontines/create', icon: Plus }}
        />

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher une tontine..."
              className="pl-9"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            />
          </div>
          <Select value={type} onValueChange={(v) => { setType(v === 'all' ? '' : v); setPage(1); }}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les types</SelectItem>
              <SelectItem value="PUBLIC">Publique</SelectItem>
              <SelectItem value="PRIVATE">Privée</SelectItem>
            </SelectContent>
          </Select>
          <Select value={status} onValueChange={(v) => { setStatus(v === 'all' ? '' : v); setPage(1); }}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="Statut" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les statuts</SelectItem>
              <SelectItem value="ACTIVE">Actif</SelectItem>
              <SelectItem value="PENDING">En attente</SelectItem>
              <SelectItem value="FINISHED">Terminé</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Grid */}
        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-5 space-y-3">
                  <Skeleton className="h-32 w-full rounded-lg" />
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <div className="flex gap-2">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : data?.data?.length === 0 ? (
          <EmptyState
            icon={TrendingUp}
            title="Aucune tontine trouvée"
            description="Essayez de modifier vos filtres ou créez votre propre tontine."
            action={{ label: 'Créer une tontine', href: '/tontines/create' }}
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {data?.data?.map((tontine: Tontine) => (
              <TontineCard key={tontine.id} tontine={tontine} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {data?.meta && data.meta.totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-8">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
            >
              Précédent
            </Button>
            <span className="text-sm text-muted-foreground">
              Page {page} sur {data.meta.totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={page === data.meta.totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Suivant
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

function TontineCard({ tontine }: { tontine: Tontine }) {
  return (
    <Link href={`/tontines/${tontine.slug}`}>
      <Card className="hover:shadow-md transition-all hover:-translate-y-0.5 duration-150 cursor-pointer h-full">
        <CardContent className="p-5">
          {/* Cover / placeholder */}
          <div className="relative h-32 rounded-lg overflow-hidden bg-gradient-to-br from-primary/20 to-primary/5 mb-4">
            {tontine.coverImageUrl ? (
              <Image src={tontine.coverImageUrl} alt={tontine.name} fill className="object-cover" />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <TrendingUp className="w-10 h-10 text-primary/30" />
              </div>
            )}
            <div className="absolute top-2 right-2">
              <StatusBadge status={tontine.status} />
            </div>
            <div className="absolute top-2 left-2">
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-black/40 text-white">
                {STATUS_LABELS[tontine.type] ?? tontine.type}
              </span>
            </div>
          </div>

          {/* Info */}
          <div className="space-y-2">
            <h3 className="font-semibold line-clamp-1">{tontine.name}</h3>
            {tontine.description && (
              <p className="text-xs text-muted-foreground line-clamp-2">{tontine.description}</p>
            )}

            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Users className="w-3.5 h-3.5" />
                <span>{tontine._count?.memberships ?? 0} membres</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Calendar className="w-3.5 h-3.5" />
                <span>{formatDate(tontine.startDate)}</span>
              </div>
            </div>

            <div className="flex items-center justify-between border-t pt-3 mt-1">
              <div className="flex items-center gap-2">
                <Avatar className="w-6 h-6">
                  <AvatarImage src={tontine.owner?.avatarUrl} />
                  <AvatarFallback className="text-[10px] bg-primary/10 text-primary">
                    {getInitials(tontine.owner?.firstName ?? 'U', tontine.owner?.lastName ?? 'N')}
                  </AvatarFallback>
                </Avatar>
                <span className="text-xs text-muted-foreground">
                  {tontine.owner?.firstName} {tontine.owner?.lastName}
                </span>
              </div>
              <p className="text-sm font-bold text-primary">
                {formatCurrency(tontine.contributionAmount)}
                <span className="text-xs font-normal text-muted-foreground">/mois</span>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
