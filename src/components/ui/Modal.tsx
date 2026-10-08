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
      {/* macOS-style Sheet Backdrop */}
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-md animate-fade-in"
        onClick={onClose}
      />

      {/* Sheet Dialog */}
      <div
        role="dialog"
        aria-modal="true"
        className={`relative bg-white rounded-[22px] p-6 border border-black/[0.08] shadow-modal w-full animate-modal-pop ${maxWidthStyles[maxWidth]} ${className}`}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-4 pb-3 border-b border-black/[0.06]">
          <div>
            {title && typeof title === 'string' ? (
              <h3 className="text-lg font-bold text-[#1D1D1F] tracking-tight leading-snug">{title}</h3>
            ) : (
              title
            )}
            {description && <p className="text-xs text-[#6E6E73] mt-0.5">{description}</p>}
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-black/[0.04] hover:bg-black/[0.08] flex items-center justify-center text-[#8E8E93] hover:text-[#1D1D1F] transition-colors cursor-pointer"
            title="Close"
          >
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="text-sm text-[#1D1D1F]">{children}</div>

        {/* Footer */}
        {footer && <div className="mt-6 flex items-center justify-end gap-2.5 pt-3 border-t border-black/[0.06]">{footer}</div>}
      </div>
    </div>
  );
}
