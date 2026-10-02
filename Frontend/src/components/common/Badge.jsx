import React from 'react';

export const Badge = ({ children, variant = 'default', size = 'sm', className = '' }) => {
  const variants = {
    // Result Badges
    tp: 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-400 dark:border-emerald-500/30',
    sl: 'bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-500/15 dark:text-rose-400 dark:border-rose-500/30',
    be: 'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-500/15 dark:text-amber-400 dark:border-amber-500/30',
    manual: 'bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-500/15 dark:text-blue-400 dark:border-blue-500/30',
    pending: 'bg-gray-100 text-gray-600 border border-gray-200 dark:bg-gray-500/15 dark:text-gray-400 dark:border-gray-500/30',

    // Direction Badges
    buy: 'bg-emerald-100 text-emerald-800 font-semibold border border-emerald-300 dark:bg-emerald-500/20 dark:text-emerald-300 dark:border-emerald-500/40',
    sell: 'bg-rose-100 text-rose-800 font-semibold border border-rose-300 dark:bg-rose-500/20 dark:text-rose-300 dark:border-rose-500/40',

    // Status Badges
    open: 'bg-cyan-50 text-cyan-700 border border-cyan-300 dark:bg-cyan-500/15 dark:text-cyan-400 dark:border-cyan-500/30 animate-pulse',
    closed: 'bg-gray-100 text-gray-700 border border-gray-300 dark:bg-gray-700/40 dark:text-gray-300 dark:border-gray-600/40',

    // Generic
    info: 'bg-cyan-50 text-cyan-700 border border-cyan-300 dark:bg-cyan-500/15 dark:text-cyan-400 dark:border-cyan-500/30',
    default: 'bg-gray-100 text-gray-700 border border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700',
  };

  const sizes = {
    xs: 'px-1.5 py-0.5 text-[10px]',
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-xs',
  };

  const selectedVariant = variants[variant.toLowerCase()] || variants.default;
  const selectedSize = sizes[size] || sizes.sm;

  return (
    <span
      className={`inline-flex items-center gap-1 font-medium rounded-md tracking-wider uppercase ${selectedVariant} ${selectedSize} ${className}`}
    >
      {children}
    </span>
  );
};
