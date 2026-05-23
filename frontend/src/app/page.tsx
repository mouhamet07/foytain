import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Heart, Shield, Users, TrendingUp, ArrowRight, CheckCircle, Star } from 'lucide-react';

export default function LandingPage() {
  const features = [
    { icon: Users, title: 'Tontines Communautaires', description: 'Créez ou rejoignez des groupes de solidarité médicale. Publiques ou privées, pour toute communauté.' },
    { icon: Heart, title: 'Aide Médicale Rapide', description: "Soumettez des demandes d'aide, votez pour vos membres, recevez les fonds rapidement quand vous en avez besoin." },
    { icon: Shield, title: 'Sécurité & Transparence', description: 'Chaque cotisation, chaque vote, chaque paiement est tracé et visible par tous les membres.' },
    { icon: TrendingUp, title: 'Tableau de Bord Complet', description: 'Suivez vos cotisations, statistiques et l\'activité de vos tontines en temps réel.' },
  ];

  const stats = [
    { label: 'Tontines actives', value: '500+' },
    { label: 'Membres inscrits', value: '12 000+' },
    { label: 'Demandes approuvées', value: '2 400+' },
    { label: 'Montant versé', value: '480M XOF' },
  ];

  const testimonials = [
    { name: 'Fatou Diallo', role: 'Enseignante, Dakar', text: 'Foytain m\'a permis de couvrir les frais d\'hospitalisation de mon père en moins de 48h. La solidarité de la communauté est incroyable.', rating: 5 },
    { name: 'Mamadou Ba', role: 'Commerçant, Thiès', text: 'Je gère ma tontine familiale directement depuis mon téléphone. C\'est simple, transparent et efficace.', rating: 5 },
    { name: 'Aissatou Sow', role: 'Infirmière, Ziguinchor', text: 'La plateforme est très intuitive. Le système de vote pour les demandes médicales est juste et équitable.', rating: 5 },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Heart className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-lg">Foytain</span>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/login">
                <Button variant="ghost" size="sm">Se connecter</Button>
              </Link>
              <Link href="/register">
                <Button size="sm">Commencer</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-medium mb-6">
            <Heart className="w-3.5 h-3.5" />
            La tontine médicale numérique
          </div>
          <h1 className="text-5xl sm:text-6xl font-bold tracking-tight mb-6 leading-tight">
            La solidarité médicale,{' '}
            <span className="text-primary">réinventée</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
            Rejoignez des milliers de familles qui s&apos;entraident pour couvrir leurs frais de santé grâce
            à la tontine médicale numérique. Simple, transparent, solidaire.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/register">
              <Button size="lg" className="w-full sm:w-auto gap-2 h-12 px-8">
                Créer mon compte gratuitement
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link href="/tontines">
              <Button variant="outline" size="lg" className="w-full sm:w-auto h-12 px-8">
                Explorer les tontines
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 bg-muted/30">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-3xl font-bold text-primary">{stat.value}</p>
                <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold mb-4">Tout ce dont vous avez besoin</h2>
            <p className="text-muted-foreground text-lg">Une plateforme complète pour gérer vos tontines médicales</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature) => (
              <div key={feature.title} className="p-6 rounded-2xl border bg-card hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 bg-muted/30 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold mb-4">Comment ça marche</h2>
            <p className="text-muted-foreground text-lg">Démarrez en 3 étapes simples</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: '01', title: 'Créez votre compte', desc: 'Inscrivez-vous gratuitement en quelques secondes avec votre email.' },
              { step: '02', title: 'Rejoignez ou créez', desc: 'Rejoignez une tontine existante ou créez la vôtre pour votre famille ou communauté.' },
              { step: '03', title: 'Cotisez & Entraidez-vous', desc: 'Payez vos cotisations, votez pour les demandes et recevez l\'aide quand vous en avez besoin.' },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-14 h-14 bg-primary text-primary-foreground rounded-2xl flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                  {item.step}
                </div>
                <h3 className="font-semibold mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold mb-4">Ils nous font confiance</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <div key={t.name} className="p-6 rounded-2xl border bg-card">
                <div className="flex gap-1 mb-3">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed mb-4">&ldquo;{t.text}&rdquo;</p>
                <div>
                  <p className="font-semibold text-sm">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-primary text-primary-foreground px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Prêt à rejoindre la communauté?</h2>
          <p className="text-primary-foreground/80 mb-8 text-lg">Créez votre compte gratuitement et commencez à cotiser dès aujourd&apos;hui.</p>
          <Link href="/register">
            <Button size="lg" variant="secondary" className="gap-2 h-12 px-8">
              Commencer maintenant
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-primary rounded-lg flex items-center justify-center">
              <Heart className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-bold">Foytain</span>
          </div>
          <p className="text-sm text-muted-foreground">© 2024 Foytain. Tous droits réservés.</p>
          <div className="flex gap-6 text-sm text-muted-foreground">
            <Link href="#" className="hover:text-foreground">Confidentialité</Link>
            <Link href="#" className="hover:text-foreground">Conditions</Link>
            <Link href="#" className="hover:text-foreground">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
