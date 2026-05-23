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

const loginSchema = z.object({
  email: z.string().email('Adresse email invalide'),
  password: z.string().min(6, 'Mot de passe trop court'),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { setUser, setTokens } = useAuth();
  const [showPassword, setShowPassword] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const { mutate: login, isPending } = useMutation({
    mutationFn: authService.login,
    onSuccess: (data) => {
      setUser(data.user);
      setTokens(data.accessToken, data.refreshToken);
      toast.success(`Bienvenue, ${data.user.firstName}!`);
      router.push('/dashboard');
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message ?? 'Email ou mot de passe incorrect';
      toast.error(Array.isArray(message) ? message[0] : message);
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Se connecter</h1>
        <p className="text-muted-foreground mt-1">Bienvenue! Entrez vos identifiants.</p>
      </div>

      <form onSubmit={handleSubmit((data) => login(data))} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="fatou@example.com"
            autoComplete="email"
            {...register('email')}
          />
          {errors.email && <p className="text-destructive text-xs">{errors.email.message}</p>}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Mot de passe</Label>
            <Link href="#" className="text-xs text-primary hover:underline">Mot de passe oublié?</Link>
          </div>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              autoComplete="current-password"
              className="pr-10"
              {...register('password')}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {errors.password && <p className="text-destructive text-xs">{errors.password.message}</p>}
        </div>

        <Button type="submit" className="w-full" loading={isPending}>
          Se connecter
        </Button>
      </form>

      <div className="text-center text-sm text-muted-foreground">
        Pas encore de compte?{' '}
        <Link href="/register" className="text-primary font-medium hover:underline">
          S&apos;inscrire gratuitement
        </Link>
      </div>

      {/* Demo credentials */}
      <div className="rounded-lg border border-dashed p-4 bg-muted/30">
        <p className="text-xs font-medium mb-2 text-muted-foreground">Comptes de démonstration:</p>
        <div className="space-y-1 text-xs text-muted-foreground font-mono">
          <p>fatou@example.com / User@123456</p>
          <p>admin@Foytain.com / Admin@123456</p>
        </div>
      </div>
    </div>
  );
}
