'use client';

import { Bell, Search, Sun, Moon } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useQuery } from '@tanstack/react-query';
import { notificationsService } from '@/services/notifications.service';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface HeaderProps {
  title: string;
}

export function Header({ title }: HeaderProps) {
  const { theme, setTheme } = useTheme();

  const { data: unreadData } = useQuery({
    queryKey: ['notifications-count'],
    queryFn: () => notificationsService.getUnreadCount(),
    refetchInterval: 30000,
  });

  return (
    <header className="sticky top-0 z-20 flex items-center justify-between h-16 px-6 bg-background/80 backdrop-blur-sm border-b">
      <h1 className="text-xl font-semibold hidden md:block">{title}</h1>

      <div className="flex items-center gap-3 ml-auto">
        {/* Search — hidden on mobile */}
        <div className="relative hidden lg:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Rechercher..." className="pl-9 w-64 h-9" />
        </div>

        {/* Theme toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="h-9 w-9"
        >
          <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        </Button>

        {/* Notifications */}
        <Link href="/notifications">
          <Button variant="ghost" size="icon" className="relative h-9 w-9">
            <Bell className="h-4 w-4" />
            {unreadData && unreadData.count > 0 && (
              <span className={cn(
                'absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] rounded-full',
                'bg-primary text-primary-foreground text-[10px] font-bold',
                'flex items-center justify-center px-1',
              )}>
                {unreadData.count > 99 ? '99+' : unreadData.count}
              </span>
            )}
          </Button>
        </Link>
      </div>
    </header>
  );
}
