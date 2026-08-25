'use client';

import React, { useEffect } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  className?: string;
}

const maxWidthStyles = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
};

export default function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  maxWidth = 'md',
  className = '',
}: ModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-md animate-fade-in"
        onClick={onClose}
      />

      {/* Modal Dialog with Spring Pop Animation */}
      <div
        role="dialog"
        aria-modal="true"
        className={`relative glass-card rounded-3xl p-6 border border-primary/40 shadow-2xl w-full animate-modal-pop ${maxWidthStyles[maxWidth]} ${className}`}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-4 pb-2 border-b border-border/50">
          <div>
            {title && typeof title === 'string' ? (
              <h3 className="text-lg font-800 text-foreground tracking-tight leading-snug">{title}</h3>
            ) : (
              title
            )}
            {description && <p className="text-xs text-muted-foreground mt-0.5">{description}</p>}
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-all btn-press cursor-pointer border border-border/40"
            title="Close dialog"
          >
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="text-sm text-foreground">{children}</div>

        {/* Footer */}
        {footer && <div className="mt-6 flex items-center justify-end gap-3 pt-3 border-t border-border/40">{footer}</div>}
      </div>
    </div>
  );
}
