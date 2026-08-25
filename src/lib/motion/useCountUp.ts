'use client';

import { useState, useEffect } from 'react';

interface CountUpOptions {
  duration?: number; // ms
  decimals?: number;
}

export function useCountUp(endValue: number, { duration = 800, decimals = 0 }: CountUpOptions = {}) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTimestamp: number | null = null;
    let frameId: number;

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);

      // Ease out expo for fast responsive start and gentle finish
      const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      const current = easeProgress * endValue;

      setCount(decimals === 0 ? Math.round(current) : parseFloat(current.toFixed(decimals)));

      if (progress < 1) {
        frameId = window.requestAnimationFrame(step);
      }
    };

    frameId = window.requestAnimationFrame(step);

    return () => {
      if (frameId) window.cancelAnimationFrame(frameId);
    };
  }, [endValue, duration, decimals]);

  return count;
}
