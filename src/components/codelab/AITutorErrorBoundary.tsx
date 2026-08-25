'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Bot, RefreshCw, AlertCircle } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  errorMessage: string;
}

export default class AITutorErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    errorMessage: '',
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, errorMessage: error?.message || 'Unknown UI Error' };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[AITutorErrorBoundary] Caught error in AI component:', error, errorInfo);
  }

  private handleRetry = () => {
    this.setState({ hasError: false, errorMessage: '' });
    this.props.onReset?.();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="w-full h-full min-h-[260px] flex flex-col items-center justify-center p-6 bg-[#070e22] text-center select-none border-l border-border/70">
          <div className="w-12 h-12 rounded-2xl bg-danger/20 border border-danger/40 flex items-center justify-center text-danger mb-3 shadow-glow">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-800 text-foreground mb-1">
            {this.props.fallbackTitle || 'AI Assistant encountered an error'}
          </h3>
          <p className="text-xs text-muted-foreground max-w-xs mb-4 leading-relaxed font-mono">
            {this.state.errorMessage.slice(0, 100) || 'The AI assistant panel encountered an unexpected rendering problem.'}
          </p>
          <button
            onClick={this.handleRetry}
            className="px-4 py-2 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-bold shadow-glow flex items-center gap-1.5 cursor-pointer transition-all btn-press"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Try Again</span>
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
