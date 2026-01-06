import type { ReactNode } from 'react';

export function Badge({
  children,
  color = 'gray',
}: {
  children: ReactNode;
  color?: 'gray' | 'blue' | 'green' | 'yellow' | 'red' | 'purple';
}) {
  const colors: Record<string, string> = {
    gray: 'bg-gray-100 text-gray-600',
    blue: 'bg-blue-50 text-blue-700',
    green: 'bg-green-50 text-green-700',
    yellow: 'bg-yellow-50 text-yellow-700',
    red: 'bg-red-50 text-red-700',
    purple: 'bg-purple-50 text-purple-700',
  };

  return (
    <span className={`px-1.5 py-0.5 rounded-[3px] text-xs font-medium ${colors[color] || colors.gray}`}>
      {children}
    </span>
  );
}

export function StatusBadge({
  status,
  labels,
}: {
  status: string;
  labels?: Record<string, string>;
}) {
  const styles: Record<string, string> = {
    in_progress: 'text-blue-700 bg-blue-50',
    planned: 'text-gray-600 bg-gray-100',
    paused: 'text-yellow-700 bg-yellow-50',
    ready: 'text-green-700 bg-green-50',
    draft: 'text-gray-500 bg-gray-50 border border-dashed border-gray-300',
    needs_review: 'text-orange-700 bg-orange-50',
    done: 'text-purple-700 bg-purple-50',
    deprecated: 'text-gray-400 bg-gray-100 line-through',
  };

  const label = labels?.[status] ?? status;
  const style = styles[status] ?? styles.planned;

  return <span className={`text-xs px-2 py-0.5 rounded-[3px] ${style}`}>{label}</span>;
}
