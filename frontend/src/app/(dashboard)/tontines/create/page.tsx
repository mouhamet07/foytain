'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { tontinesService } from '@/services/tontines.service';
import { Header } from '@/components/layout/header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const schema = z.object({
  name: z.string().min(3, 'Nom trop court').max(100),
  description: z.string().max(1000).optional(),
  type: z.enum(['PUBLIC', 'PRIVATE']),
  frequency: z.enum(['WEEKLY', 'BIWEEKLY', 'MONTHLY', 'QUARTERLY']),
  contributionAmount: z.coerce.number().min(100, 'Minimum 100 XOF'),
  currency: z.string().default('XOF'),
  maxMembers: z.coerce.number().min(2).optional().or(z.literal('')),
  startDate: z.string().min(1, 'Date requise'),
  endDate: z.string().optional(),
  rules: z.string().max(2000).optional(),
});

type CreateTontineForm = z.infer<typeof schema>;

export default function CreateTontinePage() {
  const router = useRouter();

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<CreateTontineForm>({
    resolver: zodResolver(schema),
    defaultValues: { type: 'PUBLIC', frequency: 'MONTHLY', currency: 'XOF' },
  });

  const { mutate: create, isPending } = useMutation({
    mutationFn: (data: CreateTontineForm) =>
      tontinesService.create({
        ...data,
        contributionAmount: Number(data.contributionAmount),
        maxMembers: data.maxMembers ? Number(data.maxMembers) : undefined,
      }),
    onSuccess: (tontine) => {
      toast.success('Tontine créée avec succès!');
      router.push(`/tontines/${tontine.slug}`);
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message;
      toast.error(Array.isArray(msg) ? msg[0] : msg ?? 'Erreur lors de la création');
    },
  });

  return (
    <div className="flex flex-col min-h-screen">
      <Header title="Créer une tontine" />
      <div className="flex-1 p-6 animate-fade-in max-w-2xl mx-auto w-full">
        <Link href="/tontines" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="w-4 h-4" /> Retour
        </Link>

        <div className="mb-6">
          <h1 className="text-2xl font-bold">Créer une nouvelle tontine</h1>
          <p className="text-muted-foreground mt-1">Configurez votre groupe de solidarité médicale</p>
        </div>

        <form onSubmit={handleSubmit((d) => create(d))} className="space-y-6">
          <Card>
            <CardHeader><CardTitle className="text-base">Informations générales</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Nom de la tontine *</Label>
                <Input placeholder="ex: Solidarité Santé Dakar" {...register('name')} />
                {errors.name && <p className="text-destructive text-xs">{errors.name.message}</p>}
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  placeholder="Décrivez l'objectif et les valeurs de votre tontine..."
                  rows={3}
                  {...register('description')}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Type *</Label>
                  <Select defaultValue="PUBLIC" onValueChange={(v) => setValue('type', v as 'PUBLIC' | 'PRIVATE')}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PUBLIC">Publique — Ouverte à tous</SelectItem>
                      <SelectItem value="PRIVATE">Privée — Sur invitation</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Fréquence *</Label>
                  <Select defaultValue="MONTHLY" onValueChange={(v) => setValue('frequency', v as any)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="WEEKLY">Hebdomadaire</SelectItem>
                      <SelectItem value="BIWEEKLY">Bimensuel</SelectItem>
                      <SelectItem value="MONTHLY">Mensuel</SelectItem>
                      <SelectItem value="QUARTERLY">Trimestriel</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Cotisation & Membres</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Montant de cotisation (XOF) *</Label>
                  <Input type="number" placeholder="25000" {...register('contributionAmount')} />
                  {errors.contributionAmount && <p className="text-destructive text-xs">{errors.contributionAmount.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label>Membres maximum</Label>
                  <Input type="number" placeholder="50 (optionnel)" {...register('maxMembers')} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Dates</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Date de début *</Label>
                  <Input type="date" {...register('startDate')} />
                  {errors.startDate && <p className="text-destructive text-xs">{errors.startDate.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label>Date de fin (optionnel)</Label>
                  <Input type="date" {...register('endDate')} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Règles & Conditions</CardTitle></CardHeader>
            <CardContent>
              <Textarea
                placeholder="Définissez les règles de votre tontine : conditions d'adhésion, modalités de paiement, critères d'approbation des demandes médicales..."
                rows={5}
                {...register('rules')}
              />
            </CardContent>
          </Card>

          <div className="flex gap-3">
            <Button type="button" variant="outline" className="flex-1" asChild>
              <Link href="/tontines">Annuler</Link>
            </Button>
            <Button type="submit" className="flex-1" loading={isPending}>
              Créer la tontine
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
