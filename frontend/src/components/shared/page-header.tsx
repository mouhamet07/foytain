import { Button } from '@/components/ui/button';
import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';

interface PageHeaderProps {
  title: string;
  description?: string;
  action?: { label: string; href: string; icon?: LucideIcon };
}

export function PageHeader({ title, description, action }: PageHeaderProps) {
  return (
    <div className="flex items-start justify-between mb-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        {description && <p className="text-muted-foreground mt-1">{description}</p>}
      </div>
      {action && (
        <Button asChild>
          <Link href={action.href} className="flex items-center gap-2">
            {action.icon && <action.icon className="w-4 h-4" />}
            {action.label}
          </Link>
        </Button>
      )}
    </div>
  );
}
