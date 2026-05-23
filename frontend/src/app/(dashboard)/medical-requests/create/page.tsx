'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Upload } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { useState, useRef } from 'react';
import { medicalRequestsService } from '@/services/medical-requests.service';
import { tontinesService } from '@/services/tontines.service';
import { Header } from '@/components/layout/header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const schema = z.object({
  tontineId: z.string().min(1, 'Sélectionnez une tontine'),
  title: z.string().min(5, 'Titre trop court').max(200),
  description: z.string().min(20, 'Description trop courte'),
  amount: z.coerce.number().min(1000, 'Minimum 1 000 XOF'),
  diagnosis: z.string().optional(),
  hospitalName: z.string().optional(),
  votingDeadline: z.string().optional(),
});

type CreateRequestForm = z.infer<typeof schema>;

export default function CreateMedicalRequestPage() {
  const router = useRouter();
  const [files, setFiles] = useState<File[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  const { data: myTontines } = useQuery({
    queryKey: ['my-tontines'],
    queryFn: tontinesService.getMyTontines,
  });

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<CreateRequestForm>({
    resolver: zodResolver(schema),
  });

  const { mutate: create, isPending } = useMutation({
    mutationFn: async (data: CreateRequestForm) => {
      const request = await medicalRequestsService.create(data);
      if (files.length > 0) {
        await medicalRequestsService.uploadDocuments(request.id, files);
      }
      return request;
    },
    onSuccess: (request) => {
      toast.success('Demande soumise avec succès!');
      router.push(`/medical-requests/${request.id}`);
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message;
      toast.error(Array.isArray(msg) ? msg[0] : msg ?? 'Erreur lors de la soumission');
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files).slice(0, 5));
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header title="Nouvelle demande médicale" />
      <div className="flex-1 p-6 animate-fade-in max-w-2xl mx-auto w-full">
        <Link href="/medical-requests" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="w-4 h-4" /> Retour
        </Link>

        <div className="mb-6">
          <h1 className="text-2xl font-bold">Soumettre une demande d&apos;aide</h1>
          <p className="text-muted-foreground mt-1">Décrivez votre situation médicale pour que la communauté puisse vous aider</p>
        </div>

        <form onSubmit={handleSubmit((d) => create(d))} className="space-y-6">
          <Card>
            <CardHeader><CardTitle className="text-base">Tontine concernée</CardTitle></CardHeader>
            <CardContent>
              <Select onValueChange={(v) => setValue('tontineId', v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez votre tontine" />
                </SelectTrigger>
                <SelectContent>
                  {myTontines?.map((t: any) => (
                    <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.tontineId && <p className="text-destructive text-xs mt-1">{errors.tontineId.message}</p>}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Informations médicales</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Titre de la demande *</Label>
                <Input placeholder="ex: Opération chirurgicale urgente" {...register('title')} />
                {errors.title && <p className="text-destructive text-xs">{errors.title.message}</p>}
              </div>

              <div className="space-y-2">
                <Label>Description détaillée *</Label>
                <Textarea
                  placeholder="Décrivez votre situation médicale, les soins nécessaires et pourquoi vous avez besoin d'aide..."
                  rows={5}
                  {...register('description')}
                />
                {errors.description && <p className="text-destructive text-xs">{errors.description.message}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Diagnostic</Label>
                  <Input placeholder="ex: Appendicite aiguë" {...register('diagnosis')} />
                </div>
                <div className="space-y-2">
                  <Label>Établissement de santé</Label>
                  <Input placeholder="ex: Hôpital Principal de Dakar" {...register('hospitalName')} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Montant demandé</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Montant (XOF) *</Label>
                <Input type="number" placeholder="500000" {...register('amount')} />
                {errors.amount && <p className="text-destructive text-xs">{errors.amount.message}</p>}
                <p className="text-xs text-muted-foreground">Indiquez le montant total des frais médicaux que vous devez couvrir.</p>
              </div>

              <div className="space-y-2">
                <Label>Date limite de vote</Label>
                <Input type="date" {...register('votingDeadline')} />
                <p className="text-xs text-muted-foreground">Par défaut, le vote est ouvert 7 jours.</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Documents justificatifs</CardTitle></CardHeader>
            <CardContent>
              <div
                onClick={() => fileRef.current?.click()}
                className="border-2 border-dashed rounded-xl p-8 text-center cursor-pointer hover:bg-muted/50 transition-colors"
              >
                <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm font-medium">Cliquez pour uploader vos documents</p>
                <p className="text-xs text-muted-foreground mt-1">Ordonnances, factures, résultats d&apos;examens (max 5 fichiers, 10MB chacun)</p>
                <input
                  ref={fileRef}
                  type="file"
                  multiple
                  accept="image/*,.pdf,.doc,.docx"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </div>
              {files.length > 0 && (
                <ul className="mt-3 space-y-1.5">
                  {files.map((f, i) => (
                    <li key={i} className="flex items-center justify-between text-sm px-3 py-1.5 bg-muted rounded-lg">
                      <span className="truncate">{f.name}</span>
                      <span className="text-xs text-muted-foreground ml-2">{(f.size / 1024).toFixed(0)}KB</span>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          <div className="flex gap-3">
            <Button type="button" variant="outline" className="flex-1" asChild>
              <Link href="/medical-requests">Annuler</Link>
            </Button>
            <Button type="submit" className="flex-1" loading={isPending}>
              Soumettre la demande
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
