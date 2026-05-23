'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Heart, RefreshCw, Home } from 'lucide-react';
import Link from 'next/link';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error('[Global Error Boundary]', error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-6 text-center">
      <div className="w-16 h-16 bg-destructive/10 rounded-2xl flex items-center justify-center mb-6">
        <Heart className="w-8 h-8 text-destructive" />
      </div>

      <h2 className="text-2xl font-semibold mb-3">Une erreur est survenue</h2>
      <p className="text-muted-foreground mb-2 max-w-sm">
        Quelque chose s&apos;est mal passé. Réessayez ou revenez à l&apos;accueil.
      </p>
      {error?.digest && (
        <p className="text-xs text-muted-foreground font-mono mb-6">
          Code : {error.digest}
        </p>
      )}

      <div className="flex gap-3">
        <Button variant="outline" onClick={reset}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Réessayer
        </Button>
        <Button asChild>
          <Link href="/dashboard">
            <Home className="w-4 h-4 mr-2" />
            Accueil
          </Link>
        </Button>
      </div>
    </div>
  );
}
