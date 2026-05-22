import { LucideIcon } from 'lucide-react';

interface Props {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: { value: number; label: string };
  color?: 'navy' | 'gold' | 'green' | 'blue';
}

const colors = {
  navy: { bg: 'bg-navy', text: 'text-navy', light: 'bg-navy/10' },
  gold: { bg: 'bg-gold', text: 'text-gold', light: 'bg-gold/10' },
  green: { bg: 'bg-green-600', text: 'text-green-600', light: 'bg-green-50' },
  blue: { bg: 'bg-blue-600', text: 'text-blue-600', light: 'bg-blue-50' },
};

export function StatCard({ title, value, icon: Icon, trend, color = 'navy' }: Props) {
  const c = colors[color];
  return (
    <div className="bg-white rounded-xl shadow-md p-6 flex items-center gap-4">
      <div className={`${c.light} rounded-xl p-3 flex-shrink-0`}>
        <Icon className={`h-7 w-7 ${c.text}`} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-500 truncate">{title}</p>
        <p className="text-2xl font-bold text-navy mt-0.5">{value}</p>
        {trend && (
          <p className={`text-xs mt-0.5 ${trend.value >= 0 ? 'text-green-600' : 'text-red-500'}`}>
            {trend.value >= 0 ? '↑' : '↓'} {Math.abs(trend.value)}% {trend.label}
          </p>
        )}
      </div>
    </div>
  );
}
