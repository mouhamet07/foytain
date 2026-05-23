import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency: string = 'XOF'): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(date: string | Date, options?: Intl.DateTimeFormatOptions): string {
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    ...options,
  }).format(new Date(date));
}

export function formatRelativeDate(date: string | Date): string {
  const now = new Date();
  const d = new Date(date);
  const diffMs = now.getTime() - d.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 60) return 'À l\'instant';
  if (diffMins < 60) return `Il y a ${diffMins}min`;
  if (diffHours < 24) return `Il y a ${diffHours}h`;
  if (diffDays < 7) return `Il y a ${diffDays}j`;
  return formatDate(date);
}

export function getInitials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength)}...`;
}

export const STATUS_COLORS = {
  PENDING: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
  ACTIVE: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
  CANCELLED: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
  FINISHED: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400',
  APPROVED: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
  REJECTED: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
  PAID: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
  UNPAID: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
  LATE: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
  COMPLETED: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
  FAILED: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
};

export const STATUS_LABELS: Record<string, string> = {
  PENDING: 'En attente',
  ACTIVE: 'Actif',
  CANCELLED: 'Annulé',
  FINISHED: 'Terminé',
  APPROVED: 'Approuvé',
  REJECTED: 'Refusé',
  PAID: 'Payé',
  UNPAID: 'Non payé',
  LATE: 'En retard',
  PUBLIC: 'Publique',
  PRIVATE: 'Privée',
  MONTHLY: 'Mensuel',
  WEEKLY: 'Hebdomadaire',
  BIWEEKLY: 'Bimensuel',
  QUARTERLY: 'Trimestriel',
  UNDER_REVIEW: 'En révision',
  DISBURSED: 'Versé',
  COMPLETED: 'Complété',
  FAILED: 'Échoué',
  REFUNDED: 'Remboursé',
  BANK_TRANSFER: 'Virement bancaire',
  MOBILE_MONEY: 'Mobile Money',
  CASH: 'Espèces',
  CARD: 'Carte',
};
