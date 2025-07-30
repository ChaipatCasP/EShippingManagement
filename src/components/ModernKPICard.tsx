import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader } from './ui/card';
import { Badge } from './ui/badge';
import { cn } from './ui/utils';
import { 
  TrendingUp, 
  TrendingDown, 
  Minus,
  ArrowUpRight,
  ArrowDownRight,
  Activity
} from 'lucide-react';

interface KPICardProps {
  title: string;
  value: string | number;
  change?: {
    value: number;
    period: string;
    type: 'increase' | 'decrease' | 'neutral';
  };
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: Array<{ label: string; value: number; color?: string }>;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  index?: number;
}

const variantStyles = {
  default: {
    card: 'bg-gradient-to-br from-gray-50 to-white border-gray-200/60 hover:border-gray-300/80',
    header: 'text-gray-600',
    value: 'text-gray-900',
    accent: 'bg-gray-100 text-gray-700',
    glow: 'shadow-gray-200/40'
  },
  primary: {
    card: 'bg-gradient-to-br from-blue-50 to-indigo-50/30 border-blue-200/60 hover:border-blue-300/80',
    header: 'text-blue-600',
    value: 'text-blue-900',
    accent: 'bg-blue-100 text-blue-700',
    glow: 'shadow-blue-200/40'
  },
  success: {
    card: 'bg-gradient-to-br from-green-50 to-emerald-50/30 border-green-200/60 hover:border-green-300/80',
    header: 'text-green-600',
    value: 'text-green-900',
    accent: 'bg-green-100 text-green-700',
    glow: 'shadow-green-200/40'
  },
  warning: {
    card: 'bg-gradient-to-br from-amber-50 to-orange-50/30 border-amber-200/60 hover:border-amber-300/80',
    header: 'text-amber-600',
    value: 'text-amber-900',
    accent: 'bg-amber-100 text-amber-700',
    glow: 'shadow-amber-200/40'
  },
  danger: {
    card: 'bg-gradient-to-br from-red-50 to-rose-50/30 border-red-200/60 hover:border-red-300/80',
    header: 'text-red-600',
    value: 'text-red-900',
    accent: 'bg-red-100 text-red-700',
    glow: 'shadow-red-200/40'
  }
};

const sizeStyles = {
  sm: {
    card: 'p-4',
    value: 'text-2xl',
    subtitle: 'text-xs',
    icon: 'w-4 h-4'
  },
  md: {
    card: 'p-4', // Changed from p-5 to p-4 for 16px padding
    value: 'text-3xl',
    subtitle: 'text-sm',
    icon: 'w-5 h-5'
  },
  lg: {
    card: 'p-4', // Changed from p-6 to p-4 for 16px padding
    value: 'text-4xl',
    subtitle: 'text-base',
    icon: 'w-6 h-6'
  }
};

export function ModernKPICard({
  title,
  value,
  change,
  subtitle,
  icon,
  trend,
  variant = 'default',
  size = 'md',
  index = 0
}: KPICardProps) {
  const styles = variantStyles[variant];
  const sizing = sizeStyles[size];

  const getTrendIcon = () => {
    if (!change) return null;
    
    switch (change.type) {
      case 'increase':
        return <TrendingUp className="w-3 h-3" />;
      case 'decrease':
        return <TrendingDown className="w-3 h-3" />;
      default:
        return <Minus className="w-3 h-3" />;
    }
  };

  const getTrendColor = () => {
    if (!change) return 'text-gray-500';
    
    switch (change.type) {
      case 'increase':
        return 'text-green-600';
      case 'decrease':
        return 'text-red-600';
      default:
        return 'text-gray-500';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        duration: 0.4,
        delay: index * 0.1,
        ease: [0.23, 1, 0.32, 1]
      }}
      whileHover={{ 
        y: -4,
        transition: { duration: 0.2, ease: [0.23, 1, 0.32, 1] }
      }}
      className="group"
    >
      <Card className={cn(
        'relative overflow-hidden transition-all duration-300 hover:shadow-lg border backdrop-blur-sm h-full flex flex-col',
        styles.card,
        `hover:${styles.glow}`,
        sizing.card
      )}>
        {/* Background Pattern */}
        <div className="absolute top-0 right-0 w-32 h-32 opacity-5">
          <div className="absolute inset-0 bg-gradient-radial from-current to-transparent rounded-full scale-150" />
        </div>

        <CardHeader className="relative z-10 flex-shrink-0 p-[0px]">
          <div className="flex items-center gap-2 min-h-[3rem]">
            {icon && (
              <motion.div 
                className={cn('p-2 rounded-lg', styles.accent)}
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ duration: 0.2 }}
              >
                <div className={sizing.icon}>
                  {icon}
                </div>
              </motion.div>
            )}
            <div>
              <h3 className={cn(
                'font-medium tracking-tight leading-none',
                styles.header,
                sizing.subtitle
              )}>
                {title}
              </h3>
              {subtitle && (
                <p className="text-xs text-gray-500 mt-1">
                  {subtitle}
                </p>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="relative z-10 flex-grow flex flex-col justify-between">
          <div className="space-y-3">
            {/* Main Value */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ 
                delay: (index * 0.1) + 0.2, 
                duration: 0.4,
                ease: [0.23, 1, 0.32, 1]
              }}
            >
              <div className={cn(
                'font-bold tracking-tight leading-none',
                styles.value,
                sizing.value
              )}>
                {typeof value === 'number' ? value.toLocaleString() : value}
              </div>
            </motion.div>

            {/* Change Period */}
            {change && (
              <motion.p 
                className="text-xs text-gray-500"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: (index * 0.1) + 0.4 }}
              >
                {change.period}
              </motion.p>
            )}
          </div>

          {/* Trend Mini Chart - Bottom aligned */}
          {trend && trend.length > 0 && (
            <motion.div 
              className="pt-2 mt-auto"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              transition={{ delay: (index * 0.1) + 0.5, duration: 0.3 }}
            >
              <div className="flex items-end gap-1 h-8">
                {trend.map((point, i) => (
                  <motion.div
                    key={i}
                    className={cn(
                      'bg-current rounded-sm opacity-60 group-hover:opacity-80 transition-opacity',
                      styles.header
                    )}
                    style={{ 
                      width: '6px',
                      height: `${Math.max(8, (point.value / Math.max(...trend.map(t => t.value))) * 100)}%`
                    }}
                    initial={{ height: 0 }}
                    animate={{ 
                      height: `${Math.max(8, (point.value / Math.max(...trend.map(t => t.value))) * 100)}%`
                    }}
                    transition={{ 
                      delay: (index * 0.1) + 0.6 + (i * 0.05),
                      duration: 0.4,
                      ease: [0.23, 1, 0.32, 1]
                    }}
                    whileHover={{ opacity: 1, scale: 1.1 }}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </CardContent>

        {/* Hover Accent Line */}
        <motion.div
          className={cn('absolute bottom-0 left-0 h-1 bg-current', styles.header)}
          initial={{ width: 0 }}
          whileHover={{ width: '100%' }}
          transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
        />
      </Card>
    </motion.div>
  );
}

// Container component for animated KPI grid
export function ModernKPIGrid({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 auto-rows-fr"
      style={{ gap: '16px' }} // Explicit 16px gap
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
    >
      {children}
    </motion.div>
  );
}