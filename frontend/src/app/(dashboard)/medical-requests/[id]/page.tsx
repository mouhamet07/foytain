'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import { ArrowLeft, ThumbsUp, ThumbsDown, Minus, FileText, Calendar, Building2 } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { medicalRequestsService } from '@/services/medical-requests.service';
import { useAuthStore } from '@/store/auth.store';
import { Header } from '@/components/layout/header';
import { StatusBadge } from '@/components/shared/status-badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { formatCurrency, formatDate, getInitials } from '@/lib/utils';
import type { Vote } from '@/types';

export default function MedicalRequestDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  const { data: request, isLoading } = useQuery({
    queryKey: ['medical-request', id],
    queryFn: () => medicalRequestsService.findOne(id),
  });

  const { data: votesData } = useQuery({
    queryKey: ['votes', id],
    queryFn: () => medicalRequestsService.getVotes(id),
    enabled: !!id,
  });

  const { mutate: castVote, isPending: isVoting } = useMutation({
    mutationFn: (choice: 'FOR' | 'AGAINST' | 'ABSTAIN') =>
      medicalRequestsService.vote({ medicalRequestId: id, choice }),
    onSuccess: () => {
      toast.success('Vote enregistré!');
      queryClient.invalidateQueries({ queryKey: ['medical-request', id] });
      queryClient.invalidateQueries({ queryKey: ['votes', id] });
    },
    onError: (err: any) => toast.error(err?.response?.data?.message ?? 'Erreur lors du vote'),
  });

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header title="Demande médicale" />
        <div className="p-6 space-y-4">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      </div>
    );
  }

  if (!request) return <div className="p-6">Demande introuvable.</div>;

  const myVote = votesData?.votes?.find((v: Vote) => v.userId === user?.id);
  const canVote = !myVote && request.status === 'PENDING' && request.userId !== user?.id;
  const totalVotes = (request.voteStats?.for ?? 0) + (request.voteStats?.against ?? 0) + (request.voteStats?.abstain ?? 0);
  const forPercent = totalVotes > 0 ? Math.round(((request.voteStats?.for ?? 0) / totalVotes) * 100) : 0;

  return (
    <div className="flex flex-col min-h-screen">
      <Header title="Demande médicale" />
      <div className="flex-1 p-6 animate-fade-in max-w-3xl mx-auto w-full space-y-6">
        <Link href="/medical-requests" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-4 h-4" /> Retour
        </Link>

        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <Avatar className="w-12 h-12 flex-shrink-0">
              <AvatarImage src={request.user?.avatarUrl} />
              <AvatarFallback className="bg-red-100 text-red-600">
                {getInitials(request.user?.firstName ?? 'U', request.user?.lastName ?? 'N')}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-xl font-bold">{request.title}</h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                Soumis par <span className="font-medium">{request.user?.firstName} {request.user?.lastName}</span>
                {' '}· {request.tontine?.name}
              </p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <p className="text-2xl font-bold text-primary">{formatCurrency(request.amount)}</p>
            <StatusBadge status={request.status} />
          </div>
        </div>

        {/* Details */}
        <Card>
          <CardHeader><CardTitle className="text-base">Détails de la demande</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground leading-relaxed">{request.description}</p>
            <Separator />
            <div className="grid grid-cols-2 gap-4 text-sm">
              {request.diagnosis && (
                <div>
                  <p className="text-xs text-muted-foreground mb-0.5">Diagnostic</p>
                  <p className="font-medium">{request.diagnosis}</p>
                </div>
              )}
              {request.hospitalName && (
                <div className="flex items-start gap-1.5">
                  <Building2 className="w-4 h-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-xs text-muted-foreground mb-0.5">Établissement</p>
                    <p className="font-medium">{request.hospitalName}</p>
                  </div>
                </div>
              )}
              <div className="flex items-start gap-1.5">
                <Calendar className="w-4 h-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-xs text-muted-foreground mb-0.5">Soumis le</p>
                  <p className="font-medium">{formatDate(request.createdAt)}</p>
                </div>
              </div>
              {request.votingDeadline && (
                <div>
                  <p className="text-xs text-muted-foreground mb-0.5">Vote jusqu&apos;au</p>
                  <p className="font-medium">{formatDate(request.votingDeadline)}</p>
                </div>
              )}
            </div>

            {/* Documents */}
            {request.documentUrls?.length > 0 && (
              <>
                <Separator />
                <div>
                  <p className="text-sm font-medium mb-2">Documents justificatifs</p>
                  <div className="flex flex-wrap gap-2">
                    {request.documentUrls.map((url, i) => (
                      <a
                        key={i}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs hover:bg-muted transition-colors"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        Document {i + 1}
                      </a>
                    ))}
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Vote section */}
        <Card>
          <CardHeader><CardTitle className="text-base">Votes de la communauté</CardTitle></CardHeader>
          <CardContent className="space-y-5">
            {/* Stats */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <div className="flex gap-4">
                  <span className="flex items-center gap-1.5 text-green-600 font-medium">
                    <ThumbsUp className="w-4 h-4" /> {request.voteStats?.for ?? 0} Pour
                  </span>
                  <span className="flex items-center gap-1.5 text-red-500 font-medium">
                    <ThumbsDown className="w-4 h-4" /> {request.voteStats?.against ?? 0} Contre
                  </span>
                  <span className="flex items-center gap-1.5 text-muted-foreground">
                    <Minus className="w-4 h-4" /> {request.voteStats?.abstain ?? 0} Abstention
                  </span>
                </div>
                <span className="text-muted-foreground text-xs">{totalVotes} votes au total</span>
              </div>
              <Progress value={forPercent} className="h-2" />
              <p className="text-xs text-muted-foreground">{forPercent}% en faveur</p>
            </div>

            {/* Cast vote */}
            {canVote && (
              <div className="border-t pt-4">
                <p className="text-sm font-medium mb-3">Votre vote</p>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    className="flex-1 border-green-300 text-green-700 hover:bg-green-50 dark:hover:bg-green-900/20"
                    onClick={() => castVote('FOR')}
                    loading={isVoting}
                  >
                    <ThumbsUp className="w-4 h-4 mr-2" /> Pour
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1 border-red-300 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                    onClick={() => castVote('AGAINST')}
                    loading={isVoting}
                  >
                    <ThumbsDown className="w-4 h-4 mr-2" /> Contre
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => castVote('ABSTAIN')}
                    loading={isVoting}
                  >
                    <Minus className="w-4 h-4 mr-2" /> Abstention
                  </Button>
                </div>
              </div>
            )}

            {myVote && (
              <p className="text-sm text-center text-muted-foreground border-t pt-4">
                Vous avez voté <span className="font-medium">{myVote.choice === 'FOR' ? 'POUR' : myVote.choice === 'AGAINST' ? 'CONTRE' : 'ABSTENTION'}</span>
              </p>
            )}

            {/* Voters list */}
            {votesData?.votes?.length > 0 && (
              <div className="border-t pt-4 space-y-2">
                <p className="text-sm font-medium">Votants</p>
                {votesData.votes.slice(0, 5).map((v: Vote) => (
                  <div key={v.id} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <Avatar className="w-6 h-6">
                        <AvatarFallback className="text-[10px]">
                          {getInitials(v.user?.firstName ?? 'U', v.user?.lastName ?? 'N')}
                        </AvatarFallback>
                      </Avatar>
                      <span>{v.user?.firstName} {v.user?.lastName}</span>
                    </div>
                    <span className={
                      v.choice === 'FOR' ? 'text-green-600 font-medium' :
                      v.choice === 'AGAINST' ? 'text-red-500 font-medium' : 'text-muted-foreground'
                    }>
                      {v.choice === 'FOR' ? 'Pour' : v.choice === 'AGAINST' ? 'Contre' : 'Abstention'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {request.rejectionReason && (
          <Card className="border-destructive/30 bg-destructive/5">
            <CardContent className="p-4">
              <p className="text-sm font-medium text-destructive">Motif de refus</p>
              <p className="text-sm text-muted-foreground mt-1">{request.rejectionReason}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
