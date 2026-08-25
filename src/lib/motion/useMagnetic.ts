'use client';

import { useState, useRef, useCallback, useEffect } from 'react';

interface MagneticOptions {
  maxPull?: number; // max offset in px (e.g. 3-8px)
  disabled?: boolean;
}

export function useMagnetic({ maxPull = 5, disabled = false }: MagneticOptions = {}) {
  const [style, setStyle] = useState<React.CSSProperties>({});
  const ref = useRef<HTMLButtonElement | HTMLDivElement | null>(null);
  const isTouchDevice = useRef(false);

  useEffect(() => {
    isTouchDevice.current =
      typeof window !== 'undefined' &&
      ('ontouchstart' in window || navigator.maxTouchPoints > 0);
  }, []);

  const onMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (disabled || isTouchDevice.current || !ref.current) return;

      const rect = ref.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const deltaX = (e.clientX - centerX) / (rect.width / 2);
      const deltaY = (e.clientY - centerY) / (rect.height / 2);

      const pullX = deltaX * maxPull;
      const pullY = deltaY * maxPull;

      setStyle({
        transform: `translate3d(${pullX.toFixed(2)}px, ${pullY.toFixed(2)}px, 0) scale(1.025)`,
        transition: 'transform 0.15s cubic-bezier(0.16, 1, 0.3, 1)',
      });
    },
    [disabled, maxPull]
  );

  const onMouseLeave = useCallback(() => {
    if (disabled || isTouchDevice.current) return;

    setStyle({
      transform: 'translate3d(0, 0, 0) scale(1)',
      transition: 'transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)',
    });
  }, [disabled]);

  return {
    ref,
    magneticProps: {
      ref: ref as any,
      onMouseMove,
      onMouseLeave,
      style,
    },
  };
}
