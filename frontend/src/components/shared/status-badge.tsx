import { cn, STATUS_COLORS, STATUS_LABELS } from '@/lib/utils';

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const colorClass = STATUS_COLORS[status as keyof typeof STATUS_COLORS] ?? 'bg-gray-100 text-gray-800';
  const label = STATUS_LABELS[status] ?? status;

  return (
    <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold', colorClass, className)}>
      {label}
    </span>
  );
}
