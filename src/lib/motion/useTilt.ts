'use client';

import { useState, useRef, useCallback, useEffect } from 'react';

interface TiltOptions {
  maxRotation?: number; // max tilt degrees (e.g. 3-6)
  perspective?: number; // perspective in px
  scale?: number; // scale on hover
  disabled?: boolean;
}

export function useTilt({
  maxRotation = 4,
  perspective = 1000,
  scale = 1.015,
  disabled = false,
}: TiltOptions = {}) {
  const [style, setStyle] = useState<React.CSSProperties>({});
  const [glowPos, setGlowPos] = useState({ x: 50, y: 50, opacity: 0 });
  const ref = useRef<HTMLDivElement | null>(null);
  const isTouchDevice = useRef(false);

  useEffect(() => {
    isTouchDevice.current =
      typeof window !== 'undefined' &&
      ('ontouchstart' in window || navigator.maxTouchPoints > 0);
  }, []);

  const onMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (disabled || isTouchDevice.current || !ref.current) return;

      const rect = ref.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const xPercent = (x / rect.width) * 100;
      const yPercent = (y / rect.height) * 100;

      // Calculate tilt: cursor at top-left -> tilt toward top-left
      const rotateX = ((y - rect.height / 2) / (rect.height / 2)) * -maxRotation;
      const rotateY = ((x - rect.width / 2) / (rect.width / 2)) * maxRotation;

      setStyle({
        transform: `perspective(${perspective}px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale3d(${scale}, ${scale}, ${scale})`,
        transition: 'transform 0.1s cubic-bezier(0.16, 1, 0.3, 1)',
      });

      setGlowPos({
        x: Math.round(xPercent),
        y: Math.round(yPercent),
        opacity: 1,
      });
    },
    [disabled, maxRotation, perspective, scale]
  );

  const onMouseLeave = useCallback(() => {
    if (disabled || isTouchDevice.current) return;

    setStyle({
      transform: `perspective(${perspective}px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`,
      transition: 'transform 0.45s cubic-bezier(0.16, 1, 0.3, 1)',
    });

    setGlowPos((prev) => ({ ...prev, opacity: 0 }));
  }, [disabled, perspective]);

  return {
    ref,
    tiltProps: {
      ref,
      onMouseMove,
      onMouseLeave,
      style,
    },
    glowPos,
  };
}
