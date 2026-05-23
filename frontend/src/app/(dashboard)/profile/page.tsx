'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useState, useRef } from 'react';
import { Camera, Shield, User, Phone } from 'lucide-react';
import api from '@/lib/axios';
import { useAuth } from '@/store/auth.store';
import { Header } from '@/components/layout/header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getInitials } from '@/lib/utils';

const profileSchema = z.object({
  firstName: z.string().min(2).max(50),
  lastName: z.string().min(2).max(50),
  phone: z.string().optional(),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Requis'),
  newPassword: z.string().min(8, 'Minimum 8 caractères')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/, 'Trop faible'),
  confirmPassword: z.string(),
}).refine((d) => d.newPassword === d.confirmPassword, {
  message: 'Les mots de passe ne correspondent pas',
  path: ['confirmPassword'],
});

type ProfileForm = z.infer<typeof profileSchema>;
type PasswordForm = z.infer<typeof passwordSchema>;

export default function ProfilePage() {
  const { user, setUser } = useAuth();
  const fileRef = useRef<HTMLInputElement>(null);

  const { register: regProfile, handleSubmit: handleProfile, formState: { errors: profileErrors } } =
    useForm<ProfileForm>({
      resolver: zodResolver(profileSchema),
      defaultValues: { firstName: user?.firstName, lastName: user?.lastName, phone: user?.phone ?? '' },
    });

  const { register: regPass, handleSubmit: handlePass, reset: resetPass, formState: { errors: passErrors } } =
    useForm<PasswordForm>({ resolver: zodResolver(passwordSchema) });

  const { mutate: updateProfile, isPending: isUpdating } = useMutation({
    mutationFn: (data: ProfileForm) => api.put('/users/profile', data).then((r) => r.data.data),
    onSuccess: (updatedUser) => {
      setUser({ ...user!, ...updatedUser });
      toast.success('Profil mis à jour!');
    },
    onError: (err: any) => toast.error(err?.response?.data?.message ?? 'Erreur'),
  });

  const { mutate: changePassword, isPending: isChangingPass } = useMutation({
    mutationFn: (data: PasswordForm) => api.patch('/users/change-password', data),
    onSuccess: () => {
      toast.success('Mot de passe changé avec succès!');
      resetPass();
    },
    onError: (err: any) => toast.error(err?.response?.data?.message ?? 'Mot de passe actuel incorrect'),
  });

  const { mutate: uploadAvatar, isPending: isUploadingAvatar } = useMutation({
    mutationFn: (file: File) => {
      const fd = new FormData();
      fd.append('avatar', file);
      return api.patch('/users/avatar', fd, { headers: { 'Content-Type': 'multipart/form-data' } }).then((r) => r.data.data);
    },
    onSuccess: (res) => {
      setUser({ ...user!, avatarUrl: res.avatarUrl });
      toast.success('Avatar mis à jour!');
    },
    onError: () => toast.error('Erreur lors du téléchargement'),
  });

  return (
    <div className="flex flex-col min-h-screen">
      <Header title="Profil" />
      <div className="flex-1 p-6 animate-fade-in max-w-2xl mx-auto w-full">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Mon Profil</h1>
          <p className="text-muted-foreground mt-1">Gérez vos informations personnelles et la sécurité de votre compte</p>
        </div>

        {/* Avatar */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-center gap-6">
              <div className="relative">
                <Avatar className="w-20 h-20">
                  <AvatarImage src={user?.avatarUrl} />
                  <AvatarFallback className="text-xl bg-primary text-primary-foreground">
                    {user ? getInitials(user.firstName, user.lastName) : 'U'}
                  </AvatarFallback>
                </Avatar>
                <button
                  onClick={() => fileRef.current?.click()}
                  className="absolute -bottom-1 -right-1 w-7 h-7 bg-primary text-primary-foreground rounded-full flex items-center justify-center hover:bg-primary/90 transition-colors"
                >
                  <Camera className="w-3.5 h-3.5" />
                </button>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && uploadAvatar(e.target.files[0])}
                />
              </div>
              <div>
                <p className="font-semibold text-lg">{user?.firstName} {user?.lastName}</p>
                <p className="text-muted-foreground text-sm">@{user?.username}</p>
                <p className="text-muted-foreground text-sm">{user?.email}</p>
                <span className={`inline-flex items-center mt-1 px-2 py-0.5 rounded-full text-xs font-semibold ${
                  user?.role === 'SUPER_ADMIN' ? 'bg-purple-100 text-purple-700' :
                  user?.role === 'ADMIN' ? 'bg-blue-100 text-blue-700' :
                  'bg-gray-100 text-gray-700'
                }`}>
                  {user?.role}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="info">
          <TabsList className="mb-6">
            <TabsTrigger value="info" className="gap-2">
              <User className="w-4 h-4" /> Informations
            </TabsTrigger>
            <TabsTrigger value="security" className="gap-2">
              <Shield className="w-4 h-4" /> Sécurité
            </TabsTrigger>
          </TabsList>

          {/* Profile info */}
          <TabsContent value="info">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Informations personnelles</CardTitle>
                <CardDescription>Mettez à jour vos informations de profil</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleProfile((d) => updateProfile(d))} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Prénom</Label>
                      <Input {...regProfile('firstName')} />
                      {profileErrors.firstName && <p className="text-destructive text-xs">{profileErrors.firstName.message}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label>Nom</Label>
                      <Input {...regProfile('lastName')} />
                      {profileErrors.lastName && <p className="text-destructive text-xs">{profileErrors.lastName.message}</p>}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input value={user?.email} disabled className="text-muted-foreground" />
                    <p className="text-xs text-muted-foreground">L&apos;email ne peut pas être modifié.</p>
                  </div>

                  <div className="space-y-2">
                    <Label className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5" /> Téléphone
                    </Label>
                    <Input placeholder="+221771234567" {...regProfile('phone')} />
                  </div>

                  <Button type="submit" loading={isUpdating}>Enregistrer les modifications</Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security */}
          <TabsContent value="security">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Changer le mot de passe</CardTitle>
                <CardDescription>Utilisez un mot de passe fort pour sécuriser votre compte</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handlePass((d) => changePassword(d))} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Mot de passe actuel</Label>
                    <Input type="password" placeholder="••••••••" {...regPass('currentPassword')} />
                    {passErrors.currentPassword && <p className="text-destructive text-xs">{passErrors.currentPassword.message}</p>}
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <Label>Nouveau mot de passe</Label>
                    <Input type="password" placeholder="••••••••" {...regPass('newPassword')} />
                    {passErrors.newPassword && <p className="text-destructive text-xs">{passErrors.newPassword.message}</p>}
                    <p className="text-xs text-muted-foreground">Minimum 8 caractères, avec majuscule, chiffre et symbole.</p>
                  </div>

                  <div className="space-y-2">
                    <Label>Confirmer le nouveau mot de passe</Label>
                    <Input type="password" placeholder="••••••••" {...regPass('confirmPassword')} />
                    {passErrors.confirmPassword && <p className="text-destructive text-xs">{passErrors.confirmPassword.message}</p>}
                  </div>

                  <Button type="submit" loading={isChangingPass}>Changer le mot de passe</Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
