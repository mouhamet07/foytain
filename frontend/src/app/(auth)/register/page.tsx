'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { authService } from '@/services/auth.service';
import { useAuth } from '@/store/auth.store';

const registerSchema = z.object({
  firstName: z.string().min(2, 'Prénom trop court').max(50),
  lastName: z.string().min(2, 'Nom trop court').max(50),
  email: z.string().email('Email invalide'),
  username: z.string().min(3, 'Username trop court').max(30).regex(/^[a-zA-Z0-9_-]+$/, 'Caractères invalides'),
  phone: z.string().optional(),
  password: z.string()
    .min(8, 'Minimum 8 caractères')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/, 'Doit contenir majuscule, minuscule, chiffre et symbole'),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: 'Les mots de passe ne correspondent pas',
  path: ['confirmPassword'],
});

type RegisterForm = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const { setUser, setTokens } = useAuth();
  const [showPassword, setShowPassword] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  const { mutate: signup, isPending } = useMutation({
    mutationFn: (data: RegisterForm) => {
      const { confirmPassword, ...rest } = data;
      return authService.register(rest);
    },
    onSuccess: (data) => {
      setUser(data.user);
      setTokens(data.accessToken, data.refreshToken);
      toast.success('Compte créé avec succès! Bienvenue sur Foytain!');
      router.push('/dashboard');
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message ?? 'Erreur lors de la création du compte';
      toast.error(Array.isArray(message) ? message[0] : message);
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Créer un compte</h1>
        <p className="text-muted-foreground mt-1">Rejoignez la communauté Foytain</p>
      </div>

      <form onSubmit={handleSubmit((data) => signup(data))} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="firstName">Prénom</Label>
            <Input id="firstName" placeholder="Fatou" {...register('firstName')} />
            {errors.firstName && <p className="text-destructive text-xs">{errors.firstName.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName">Nom</Label>
            <Input id="lastName" placeholder="Diallo" {...register('lastName')} />
            {errors.lastName && <p className="text-destructive text-xs">{errors.lastName.message}</p>}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" placeholder="fatou@example.com" {...register('email')} />
          {errors.email && <p className="text-destructive text-xs">{errors.email.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="username">Nom d&apos;utilisateur</Label>
          <Input id="username" placeholder="fatou_diallo" {...register('username')} />
          {errors.username && <p className="text-destructive text-xs">{errors.username.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Téléphone <span className="text-muted-foreground">(optionnel)</span></Label>
          <Input id="phone" type="tel" placeholder="+221771234567" {...register('phone')} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Mot de passe</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              className="pr-10"
              {...register('password')}
            />
            <button type="button" onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {errors.password && <p className="text-destructive text-xs">{errors.password.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
          <Input id="confirmPassword" type="password" placeholder="••••••••" {...register('confirmPassword')} />
          {errors.confirmPassword && <p className="text-destructive text-xs">{errors.confirmPassword.message}</p>}
        </div>

        <Button type="submit" className="w-full" loading={isPending}>
          Créer mon compte
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        Déjà un compte?{' '}
        <Link href="/login" className="text-primary font-medium hover:underline">Se connecter</Link>
      </p>
    </div>
  );
}
