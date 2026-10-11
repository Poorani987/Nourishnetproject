import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  iconBgColor?: string;
  iconColor?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  iconBgColor = 'bg-softGreen',
  iconColor = 'text-forest',
}) => {
  return (
    <div className="card-warm p-6 flex items-start justify-between">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-mutedText">{title}</p>
        <p className="font-serif text-3xl font-bold text-forest mt-2">{value}</p>
        {subtitle && (
          <p className="text-xs text-mutedText mt-1.5 leading-relaxed">{subtitle}</p>
        )}
      </div>
      <div className={`w-12 h-12 rounded-2xl ${iconBgColor} flex items-center justify-center shrink-0`}>
        <Icon className={`w-6 h-6 ${iconColor}`} />
      </div>
    </div>
  );
};
