'use client';

import React from 'react';
import { useCountUp } from '@/lib/motion/useCountUp';

interface AnimatedNumberProps {
  value: number | string;
  decimals?: number;
  duration?: number;
  suffix?: string;
  prefix?: string;
  className?: string;
}

export default function AnimatedNumber({
  value,
  decimals = 0,
  duration = 800,
  suffix = '',
  prefix = '',
  className = '',
}: AnimatedNumberProps) {
  // If string contains non-numbers (e.g. '88.6%' or '12/15'), extract numeric part
  const numericVal =
    typeof value === 'number'
      ? value
      : parseFloat(String(value).replace(/[^0-9.-]/g, '')) || 0;

  const count = useCountUp(numericVal, { duration, decimals });

  return (
    <span className={`metric-value ${className}`}>
      {prefix}
      {count}
      {suffix}
    </span>
  );
}
