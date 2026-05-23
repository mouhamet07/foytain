'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import {
  LayoutDashboard, Heart, Wallet, Bell, Settings,
  Shield, LogOut, Menu, X, TrendingUp, CreditCard,
} from 'lucide-react';
import { cn, getInitials } from '@/lib/utils';
import { useAuth } from '@/store/auth.store';
import { authService } from '@/services/auth.service';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const NAV_ITEMS = [
  { name: 'Tableau de bord', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Mes Tontines', href: '/tontines', icon: TrendingUp },
  { name: 'Demandes médicales', href: '/medical-requests', icon: Heart },
  { name: 'Cotisations', href: '/contributions', icon: Wallet },
  { name: 'Paiements', href: '/payments', icon: CreditCard },
  { name: 'Notifications', href: '/notifications', icon: Bell },
  { name: 'Profil', href: '/profile', icon: Settings },
];

const ADMIN_NAV = [{ name: 'Admin Panel', href: '/admin', icon: Shield }];

interface NavLinkProps {
  href: string;
  icon: React.ElementType;
  label: string;
  isActive: boolean;
  onClick?: () => void;
}

function NavLink({ href, icon: Icon, label, isActive, onClick }: NavLinkProps) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150',
        isActive
          ? 'bg-primary text-primary-foreground shadow-sm'
          : 'text-muted-foreground hover:text-foreground hover:bg-muted',
      )}
    >
      <Icon className="w-4 h-4 flex-shrink-0" />
      {label}
    </Link>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuth();

  const isAdmin = user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN';
  const allNav = [...NAV_ITEMS, ...(isAdmin ? ADMIN_NAV : [])];

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch {
      // Logout even if API call fails
    }
    logout();
    toast.success('Déconnecté avec succès');
    router.push('/login');
  };

  const close = () => setIsOpen(false);

  const Content = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b">
        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
          <Heart className="w-4 h-4 text-white" />
        </div>
        <span className="font-bold text-lg">Foytain</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {allNav.map((item) => (
          <NavLink
            key={item.href}
            href={item.href}
            icon={item.icon}
            label={item.name}
            isActive={pathname === item.href || pathname.startsWith(`${item.href}/`)}
            onClick={close}
          />
        ))}
      </nav>

      {/* User section */}
      <div className="px-3 py-4 border-t space-y-1">
        <div className="flex items-center gap-3 px-3 py-2 rounded-lg">
          <Avatar className="w-8 h-8 flex-shrink-0">
            <AvatarImage src={user?.avatarUrl ?? undefined} />
            <AvatarFallback className="text-xs bg-primary text-primary-foreground">
              {user ? getInitials(user.firstName, user.lastName) : 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLogout}
          className="w-full justify-start gap-3 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
        >
          <LogOut className="w-4 h-4" />
          Déconnexion
        </Button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile top bar */}
      <div className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-4 h-14 bg-background border-b md:hidden">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-primary rounded-lg flex items-center justify-center">
            <Heart className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="font-bold">Foytain</span>
        </div>
        <button
          onClick={() => setIsOpen((v) => !v)}
          className="p-2 rounded-lg hover:bg-muted"
          aria-label="Menu"
        >
          {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          onClick={close}
          aria-hidden="true"
        />
      )}

      {/* Mobile drawer */}
      <div
        className={cn(
          'fixed top-0 left-0 z-40 w-72 h-full bg-background border-r shadow-xl transition-transform duration-200 md:hidden',
          isOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        {Content}
      </div>

      {/* Desktop sidebar */}
      <div className="hidden md:flex w-64 flex-col border-r bg-background fixed left-0 top-0 h-full z-20">
        {Content}
      </div>
    </>
  );
}
