import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Heart, Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-6 text-center">
      <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-6">
        <Heart className="w-8 h-8 text-primary" />
      </div>

      <h1 className="text-6xl font-bold text-primary mb-2">404</h1>
      <h2 className="text-2xl font-semibold mb-3">Page introuvable</h2>
      <p className="text-muted-foreground mb-8 max-w-sm">
        La page que vous cherchez n&apos;existe pas ou a été déplacée.
      </p>

      <div className="flex gap-3">
        <Button variant="outline" asChild>
          <Link href="javascript:history.back()">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour
          </Link>
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
