import React from 'react';
import { cn } from './utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function LoadingSpinner({ size = 'md', className }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  return (
    <div
      className={cn(
        'animate-spin rounded-full border-2 border-gray-300 border-t-blue-600',
        sizeClasses[size],
        className
      )}
      role="status"
      aria-label="Loading"
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
}

interface LoadingDotsProps {
  className?: string;
  color?: string;
}

export function LoadingDots({ className, color = 'bg-blue-600' }: LoadingDotsProps) {
  return (
    <div className={cn('flex space-x-1', className)}>
      <div className={cn('w-2 h-2 rounded-full animate-bounce', color)} style={{ animationDelay: '0ms' }}></div>
      <div className={cn('w-2 h-2 rounded-full animate-bounce', color)} style={{ animationDelay: '150ms' }}></div>
      <div className={cn('w-2 h-2 rounded-full animate-bounce', color)} style={{ animationDelay: '300ms' }}></div>
    </div>
  );
}

interface LoadingPulseProps {
  className?: string;
}

export function LoadingPulse({ className }: LoadingPulseProps) {
  return (
    <div className={cn('flex space-x-1', className)}>
      <div className="w-3 h-3 bg-blue-600 rounded-full animate-pulse"></div>
      <div className="w-3 h-3 bg-blue-600 rounded-full animate-pulse" style={{ animationDelay: '0.1s' }}></div>
      <div className="w-3 h-3 bg-blue-600 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
    </div>
  );
}

interface ProgressBarProps {
  progress: number;
  className?: string;
  showPercentage?: boolean;
  animated?: boolean;
  color?: string;
}

export function ProgressBar({ 
  progress, 
  className, 
  showPercentage = false, 
  animated = true,
  color = 'bg-blue-600'
}: ProgressBarProps) {
  const clampedProgress = Math.min(100, Math.max(0, progress));
  
  return (
    <div className={cn('w-full', className)}>
      <div className="flex justify-between text-sm text-gray-600 mb-1">
        {showPercentage && (
          <span className="transition-all duration-300">
            {clampedProgress.toFixed(0)}%
          </span>
        )}
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
        <div
          className={cn(
            'h-full rounded-full transition-all duration-500 ease-out',
            color,
            animated && 'animate-pulse'
          )}
          style={{ width: `${clampedProgress}%` }}
        >
          {animated && (
            <div className="w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
          )}
        </div>
      </div>
    </div>
  );
}

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
  animation?: 'pulse' | 'wave' | 'none';
}

export function Skeleton({ 
  className, 
  variant = 'rectangular', 
  animation = 'pulse' 
}: SkeletonProps) {
  const baseClasses = 'bg-gray-200';
  
  const variantClasses = {
    text: 'h-4 rounded',
    circular: 'rounded-full',
    rectangular: 'rounded'
  };
  
  const animationClasses = {
    pulse: 'animate-pulse',
    wave: 'animate-shimmer',
    none: ''
  };

  return (
    <div
      className={cn(
        baseClasses,
        variantClasses[variant],
        animationClasses[animation],
        className
      )}
    />
  );
}

interface LoadingOverlayProps {
  isVisible: boolean;
  message?: string;
  children?: React.ReactNode;
}

export function LoadingOverlay({ isVisible, message, children }: LoadingOverlayProps) {
  if (!isVisible) return <>{children}</>;
  
  return (
    <div className="relative">
      {children && <div className="opacity-50 pointer-events-none">{children}</div>}
      <div className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm z-50">
        <div className="flex flex-col items-center gap-3 p-6 bg-white rounded-lg shadow-lg border">
          <LoadingSpinner size="lg" />
          {message && (
            <p className="text-sm text-gray-600 text-center max-w-xs">
              {message}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// Table Skeleton for ShipmentTable
export function TableSkeleton({ rows = 5, columns = 6 }: { rows?: number; columns?: number }) {
  return (
    <div className="space-y-3">
      {/* Header skeleton */}
      <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
        {Array.from({ length: columns }, (_, i) => (
          <Skeleton key={`header-${i}`} className="h-6 w-24" />
        ))}
      </div>
      
      {/* Rows skeleton */}
      {Array.from({ length: rows }, (_, rowIndex) => (
        <div 
          key={`row-${rowIndex}`} 
          className="grid gap-4 py-2" 
          style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
        >
          {Array.from({ length: columns }, (_, colIndex) => (
            <Skeleton 
              key={`cell-${rowIndex}-${colIndex}`} 
              className="h-4 w-full" 
              animation="wave"
            />
          ))}
        </div>
      ))}
    </div>
  );
}

// Card Loading Skeleton
export function CardSkeleton() {
  return (
    <div className="border rounded-lg p-4 space-y-4">
      <div className="flex items-center gap-3">
        <Skeleton variant="circular" className="w-10 h-10" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-24" />
        </div>
      </div>
      <div className="space-y-2">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    </div>
  );
}