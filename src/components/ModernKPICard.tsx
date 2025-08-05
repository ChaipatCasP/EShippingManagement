import React from 'react';
import { Card, CardContent } from './ui/card';
import { 
  Package, 
  FileText, 
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react';

type IconType = 'Package' | 'FileText' | 'CheckCircle';
type ColorType = 'blue' | 'orange' | 'purple';

interface ModernKPICardProps {
  title: string;
  pending: number;
  total?: number; // Made optional for flexible display
  subtitle: string;
  icon: IconType;
  color: ColorType;
  // Enhanced props for better UX display
  customDisplay?: {
    mainText: string;
    subText?: string;
    metrics?: {
      primary: { label: string; value: string | number; color?: string };
      secondary?: { label: string; value: string | number; color?: string };
      tertiary?: { label: string; value: string | number };

      split?: {
        left: { label: string; value: string | number; color?: string };
        right: { label: string; value: string | number; color?: string };
      };
    };
  };
}

const iconMap = {
  Package,
  FileText,
  CheckCircle
};

const colorConfig = {
  blue: {
    primary: 'text-blue-600',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    accent: 'bg-blue-500',
    light: 'text-blue-500'
  },
  orange: {
    primary: 'text-orange-600',
    bg: 'bg-orange-50',
    border: 'border-orange-200',
    accent: 'bg-orange-500',
    light: 'text-orange-500'
  },
  purple: {
    primary: 'text-purple-600',
    bg: 'bg-purple-50',
    border: 'border-purple-200',
    accent: 'bg-purple-500',
    light: 'text-purple-500'
  }
};

export function ModernKPICard({ 
  title, 
  pending,
  total,
  subtitle,
  icon, 
  color,
  customDisplay
}: ModernKPICardProps) {
  const IconComponent = iconMap[icon];
  const config = colorConfig[color];

  return (
    <Card className="bg-white border border-gray-200 hover:shadow-md transition-shadow duration-200">
      <CardContent className="p-5">
        {/* UPDATED: More compact header with better visual hierarchy */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 ${config.bg} rounded-lg flex items-center justify-center`}>
              <IconComponent className={`w-4 h-4 ${config.primary}`} />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900 leading-tight">
                {title}
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                {subtitle}
              </p>
            </div>
          </div>
        </div>

        {/* UPDATED: Enhanced display with better UX patterns */}
        <div className="space-y-3">
          {customDisplay ? (
            // UPDATED: New structured metrics display for better readability
            <>
              {customDisplay.metrics ? (
                // New metrics-based display with enhanced layouts
                <div className="space-y-3">
                  {/* Split layout for left/right alignment */}
                  {customDisplay.metrics.split ? (
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <div className="text-xs text-gray-500 uppercase tracking-wide font-medium">
                            {customDisplay.metrics.split.left.label}
                          </div>
                          <div className={`text-2xl font-bold tabular-nums ${
                            customDisplay.metrics.split.left.color || config.primary
                          }`}>
                            {customDisplay.metrics.split.left.value}
                          </div>
                        </div>
                        <div className="space-y-1 text-right">
                          <div className="text-xs text-gray-500 uppercase tracking-wide font-medium">
                            {customDisplay.metrics.split.right.label}
                          </div>
                          <div className={`text-2xl font-bold tabular-nums ${
                            customDisplay.metrics.split.right.color || config.light
                          }`}>
                            {customDisplay.metrics.split.right.value}
                          </div>
                        </div>
                      </div>
                      
                      {/* Tertiary and quaternary metrics */}
                      {(customDisplay.metrics.tertiary || customDisplay.metrics.quaternary) && (
                        <div className="pt-2 border-t border-gray-100 space-y-2">
                          {customDisplay.metrics.tertiary && (
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-gray-500">
                                {customDisplay.metrics.tertiary.label}
                              </span>
                              <span className="text-sm font-medium text-gray-700 tabular-nums">
                                {customDisplay.metrics.tertiary.value}
                              </span>
                            </div>
                          )}

                        </div>
                      )}
                    </div>
                  ) : (
                    // Original primary/secondary layout
                    <div className="space-y-3">
                      {/* Primary metric - most prominent */}
                      <div className="space-y-1">
                        <div className="text-xs text-gray-500 uppercase tracking-wide font-medium">
                          {customDisplay.metrics.primary.label}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`text-2xl font-bold tabular-nums ${
                            customDisplay.metrics.primary.color || config.primary
                          }`}>
                            {customDisplay.metrics.primary.value}
                          </span>
                          {customDisplay.metrics.secondary && (
                            <>
                              <div className="w-px h-6 bg-gray-300 mx-1" />
                              <div className="flex flex-col">
                                <span className={`text-lg font-semibold tabular-nums ${
                                  customDisplay.metrics.secondary.color || config.light
                                }`}>
                                  {customDisplay.metrics.secondary.value}
                                </span>
                                <span className="text-xs text-gray-500 -mt-0.5">
                                  {customDisplay.metrics.secondary.label}
                                </span>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                      
                      {/* Tertiary metric - smaller, contextual */}
                      {customDisplay.metrics.tertiary && (
                        <div className="pt-2 border-t border-gray-100">
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-500">
                              {customDisplay.metrics.tertiary.label}
                            </span>
                            <span className="text-sm font-medium text-gray-700 tabular-nums">
                              {customDisplay.metrics.tertiary.value}
                            </span>
                          </div>
                        </div>
                      )}
                      

                    </div>
                  )}
                </div>
              ) : customDisplay.mainText.includes('Today') && customDisplay.mainText.includes('|') ? (
                // UPDATED: Enhanced Today layout with better visual separation
                <div className="space-y-3">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Clock className="w-3 h-3 text-gray-400" />
                      <span className="text-xs text-gray-500 uppercase tracking-wide font-medium">Today</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <div className={`text-xl font-bold ${config.primary} tabular-nums`}>
                          {customDisplay.mainText.split('|')[0].replace('Pending', '').trim()}
                        </div>
                        <div className="text-xs text-gray-500">Pending</div>
                      </div>
                      <div className="space-y-1">
                        <div className={`text-xl font-bold ${config.light} tabular-nums`}>
                          {customDisplay.mainText.split('|')[1].replace('Total', '').trim()}
                        </div>
                        <div className="text-xs text-gray-500">Total</div>
                      </div>
                    </div>
                  </div>
                  
                  {customDisplay.subText && (
                    <div className="pt-2 border-t border-gray-100">
                      <div className="text-xs text-gray-500">
                        {customDisplay.subText}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                // UPDATED: Enhanced simple display with better typography
                <div className="space-y-2">
                  <div className={`text-2xl font-bold ${config.primary} leading-tight tabular-nums`}>
                    {customDisplay.mainText}
                  </div>
                  {customDisplay.subText && (
                    <div className="text-sm text-gray-600 leading-relaxed">
                      {customDisplay.subText}
                    </div>
                  )}
                </div>
              )}
            </>
          ) : (
            // UPDATED: Enhanced original format with better hierarchy
            <div className="space-y-3">
              <div className="space-y-2">
                <div className="flex items-baseline gap-3">
                  <span className={`text-3xl font-bold ${config.primary} tabular-nums leading-none`}>
                    {pending.toLocaleString()}
                  </span>
                  <div className="flex items-center gap-1">
                    <AlertCircle className="w-3 h-3 text-amber-500" />
                    <span className="text-sm text-gray-600 font-medium">Pending</span>
                  </div>
                </div>
                
                {total !== undefined && (
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <span>of</span>
                    <span className={`font-semibold ${config.light} tabular-nums`}>
                      {total.toLocaleString()}
                    </span>
                    <span>total</span>
                  </div>
                )}
              </div>

              {/* UPDATED: Enhanced progress bar with percentage */}
              {total !== undefined && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500">Progress</span>
                    <span className={`font-medium ${config.light}`}>
                      {total > 0 ? Math.round((pending / total) * 100) : 0}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${config.accent} transition-all duration-300`}
                      style={{
                        width: total > 0 ? `${Math.min((pending / total) * 100, 100)}%` : '0%'
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}


// import React from 'react';
// import { motion } from 'framer-motion';
// import { Card, CardContent, CardHeader } from './ui/card';
// import { cn } from './ui/utils';

// interface KPICardProps {
//   title: string;
//   value: string | number;
//   change?: {
//     value: number;
//     period: string;
//     type: 'increase' | 'decrease' | 'neutral';
//   };
//   subtitle?: string;
//   icon?: React.ReactNode;
//   trend?: Array<{ label: string; value: number; color?: string }>;
//   variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger';
//   size?: 'sm' | 'md' | 'lg';
//   index?: number;
// }

// const variantStyles = {
//   default: {
//     card: 'bg-gradient-to-br from-gray-50 to-white border-gray-200/60 hover:border-gray-300/80',
//     header: 'text-gray-600',
//     value: 'text-gray-900',
//     accent: 'bg-gray-100 text-gray-700',
//     glow: 'shadow-gray-200/40'
//   },
//   primary: {
//     card: 'bg-gradient-to-br from-blue-50 to-indigo-50/30 border-blue-200/60 hover:border-blue-300/80',
//     header: 'text-blue-600',
//     value: 'text-blue-900',
//     accent: 'bg-blue-100 text-blue-700',
//     glow: 'shadow-blue-200/40'
//   },
//   success: {
//     card: 'bg-gradient-to-br from-green-50 to-emerald-50/30 border-green-200/60 hover:border-green-300/80',
//     header: 'text-green-600',
//     value: 'text-green-900',
//     accent: 'bg-green-100 text-green-700',
//     glow: 'shadow-green-200/40'
//   },
//   warning: {
//     card: 'bg-gradient-to-br from-amber-50 to-orange-50/30 border-amber-200/60 hover:border-amber-300/80',
//     header: 'text-amber-600',
//     value: 'text-amber-900',
//     accent: 'bg-amber-100 text-amber-700',
//     glow: 'shadow-amber-200/40'
//   },
//   danger: {
//     card: 'bg-gradient-to-br from-red-50 to-rose-50/30 border-red-200/60 hover:border-red-300/80',
//     header: 'text-red-600',
//     value: 'text-red-900',
//     accent: 'bg-red-100 text-red-700',
//     glow: 'shadow-red-200/40'
//   }
// };

// const sizeStyles = {
//   sm: {
//     card: 'p-4',
//     value: 'text-2xl',
//     subtitle: 'text-xs',
//     icon: 'w-4 h-4'
//   },
//   md: {
//     card: 'p-4', // Changed from p-5 to p-4 for 16px padding
//     value: 'text-3xl',
//     subtitle: 'text-sm',
//     icon: 'w-5 h-5'
//   },
//   lg: {
//     card: 'p-4', // Changed from p-6 to p-4 for 16px padding
//     value: 'text-4xl',
//     subtitle: 'text-base',
//     icon: 'w-6 h-6'
//   }
// };

// export function ModernKPICard({
//   title,
//   value,
//   change,
//   subtitle,
//   icon,
//   trend,
//   variant = 'default',
//   size = 'md',
//   index = 0
// }: KPICardProps) {
//   const styles = variantStyles[variant];
//   const sizing = sizeStyles[size];

//   return (
//     <motion.div
//       initial={{ opacity: 0, y: 20, scale: 0.95 }}
//       animate={{ opacity: 1, y: 0, scale: 1 }}
//       transition={{
//         duration: 0.4,
//         delay: index * 0.1,
//         ease: [0.23, 1, 0.32, 1]
//       }}
//       whileHover={{ 
//         y: -4,
//         transition: { duration: 0.2, ease: [0.23, 1, 0.32, 1] }
//       }}
//       className="group"
//     >
//       <Card className={cn(
//         'relative overflow-hidden transition-all duration-300 hover:shadow-lg border backdrop-blur-sm h-full flex flex-col',
//         styles.card,
//         `hover:${styles.glow}`,
//         sizing.card
//       )}>
//         {/* Background Pattern */}
//         <div className="absolute top-0 right-0 w-32 h-32 opacity-5">
//           <div className="absolute inset-0 bg-gradient-radial from-current to-transparent rounded-full scale-150" />
//         </div>

//         <CardHeader className="relative z-10 flex-shrink-0 p-[0px]">
//           <div className="flex items-center gap-2 min-h-[3rem]">
//             {icon && (
//               <motion.div 
//                 className={cn('p-2 rounded-lg', styles.accent)}
//                 whileHover={{ scale: 1.1, rotate: 5 }}
//                 transition={{ duration: 0.2 }}
//               >
//                 <div className={sizing.icon}>
//                   {icon}
//                 </div>
//               </motion.div>
//             )}
//             <div>
//               <h3 className={cn(
//                 'font-medium tracking-tight leading-none',
//                 styles.header,
//                 sizing.subtitle
//               )}>
//                 {title}
//               </h3>
//               {subtitle && (
//                 <p className="text-xs text-gray-500 mt-1">
//                   {subtitle}
//                 </p>
//               )}
//             </div>
//           </div>
//         </CardHeader>

//         <CardContent className="relative z-10 flex-grow flex flex-col justify-between">
//           <div className="space-y-3">
//             {/* Main Value */}
//             <motion.div
//               initial={{ scale: 0.8, opacity: 0 }}
//               animate={{ scale: 1, opacity: 1 }}
//               transition={{ 
//                 delay: (index * 0.1) + 0.2, 
//                 duration: 0.4,
//                 ease: [0.23, 1, 0.32, 1]
//               }}
//             >
//               <div className={cn(
//                 'font-bold tracking-tight leading-none',
//                 styles.value,
//                 sizing.value
//               )}>
//                 {typeof value === 'number' ? value.toLocaleString() : value}
//               </div>
//             </motion.div>

//             {/* Change Period */}
//             {change && (
//               <motion.p 
//                 className="text-xs text-gray-500"
//                 initial={{ opacity: 0 }}
//                 animate={{ opacity: 1 }}
//                 transition={{ delay: (index * 0.1) + 0.4 }}
//               >
//                 {change.period}
//               </motion.p>
//             )}
//           </div>

//           {/* Trend Mini Chart - Bottom aligned */}
//           {trend && trend.length > 0 && (
//             <motion.div 
//               className="pt-2 mt-auto"
//               initial={{ opacity: 0, height: 0 }}
//               animate={{ opacity: 1, height: 'auto' }}
//               transition={{ delay: (index * 0.1) + 0.5, duration: 0.3 }}
//             >
//               <div className="flex items-end gap-1 h-8">
//                 {trend.map((point, i) => (
//                   <motion.div
//                     key={i}
//                     className={cn(
//                       'bg-current rounded-sm opacity-60 group-hover:opacity-80 transition-opacity',
//                       styles.header
//                     )}
//                     style={{ 
//                       width: '6px',
//                       height: `${Math.max(8, (point.value / Math.max(...trend.map(t => t.value))) * 100)}%`
//                     }}
//                     initial={{ height: 0 }}
//                     animate={{ 
//                       height: `${Math.max(8, (point.value / Math.max(...trend.map(t => t.value))) * 100)}%`
//                     }}
//                     transition={{ 
//                       delay: (index * 0.1) + 0.6 + (i * 0.05),
//                       duration: 0.4,
//                       ease: [0.23, 1, 0.32, 1]
//                     }}
//                     whileHover={{ opacity: 1, scale: 1.1 }}
//                   />
//                 ))}
//               </div>
//             </motion.div>
//           )}
//         </CardContent>

//         {/* Hover Accent Line */}
//         <motion.div
//           className={cn('absolute bottom-0 left-0 h-1 bg-current', styles.header)}
//           initial={{ width: 0 }}
//           whileHover={{ width: '100%' }}
//           transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
//         />
//       </Card>
//     </motion.div>
//   );
// }

// // Container component for animated KPI grid
// export function ModernKPIGrid({ children }: { children: React.ReactNode }) {
//   return (
//     <motion.div
//       className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 auto-rows-fr"
//       style={{ gap: '16px' }} // Explicit 16px gap
//       initial={{ opacity: 0 }}
//       animate={{ opacity: 1 }}
//       transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
//     >
//       {children}
//     </motion.div>
//   );
// }