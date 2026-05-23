import Link from 'next/link';
import { Heart } from 'lucide-react';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left panel — branding */}
      <div className="hidden lg:flex flex-col justify-between p-12 bg-primary text-primary-foreground">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
            <Heart className="w-5 h-5" />
          </div>
          <span className="font-bold text-xl">Foytain</span>
        </Link>

        <div>
          <blockquote className="text-2xl font-semibold leading-relaxed mb-4">
            &ldquo;La solidarité médicale, réinventée pour l&apos;ère numérique.&rdquo;
          </blockquote>
          <p className="text-primary-foreground/70 text-base">
            Rejoignez des milliers de familles qui s&apos;entraident pour couvrir leurs frais de santé.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {[
            { label: 'Membres actifs', value: '12 000+' },
            { label: 'Tontines actives', value: '500+' },
            { label: 'Demandes approuvées', value: '2 400+' },
            { label: 'Montant versé', value: '480M XOF' },
          ].map((stat) => (
            <div key={stat.label} className="bg-white/10 rounded-xl p-4">
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-sm text-primary-foreground/70">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <Link href="/" className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Heart className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-lg">Foytain</span>
          </Link>
          {children}
        </div>
      </div>
    </div>
  );
}
