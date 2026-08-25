'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { AIMode, CodeAIContext } from '@/types/codelab';
import MarkdownRenderer from '@/components/ai/MarkdownRenderer';
import AITutorErrorBoundary from './AITutorErrorBoundary';
import {
  Bot,
  Send,
  Sparkles,
  Zap,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Bug,
  Cpu,
  FileCode2,
  Lightbulb,
  TestTube,
  RotateCcw,
  Wand2,
  RefreshCw,
  Clock,
} from 'lucide-react';

export type AIRequestState = 'idle' | 'loading' | 'success' | 'error' | 'timeout';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  title?: string;
  timestamp: number;
}

interface AITutorPanelProps {
  codeContext: CodeAIContext;
  aiMode: AIMode;
  onToggleAiMode: () => void;
  onRequestFix: () => void;
}

const AI_TIMEOUT_MS = 25000; // 25s hard timeout

export default function AITutorPanel(props: AITutorPanelProps) {
  return (
    <AITutorErrorBoundary>
      <AITutorPanelInner {...props} />
    </AITutorErrorBoundary>
  );
}

function AITutorPanelInner({
  codeContext,
  aiMode,
  onToggleAiMode,
  onRequestFix,
}: AITutorPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-welcome',
      role: 'assistant',
      title: 'Campus OS Code Mentor',
      content: `### 🎓 Campus OS Code Mentor Active

Select an action below or ask any coding question:
- **Explain Code**: Line-by-line breakdown & $O(N)$ Big-O complexity
- **Find Bugs**: Static scan for runtime exceptions & edge cases
- **Fix with AI**: Root-cause diagnostic & one-click diff fix
- **Optimize O(n)**: Refactor loops & memory allocations
- **Give Hint**: Socratic guidance without giving away the answer`,
      timestamp: Date.now(),
    },
  ]);

  const [inputMessage, setInputMessage] = useState('');
  const [requestState, setRequestState] = useState<AIRequestState>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [currentActionTitle, setCurrentActionTitle] = useState<string>('');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const timeoutIdRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-scroll to bottom safely
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, requestState, scrollToBottom]);

  // Clean up any in-flight request on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (timeoutIdRef.current) {
        clearTimeout(timeoutIdRef.current);
      }
    };
  }, []);

  /**
   * Dispatches an AI request with single in-flight guard, dedicated controller, and hard timeout.
   */
  const executeAIRequest = async (
    mode: 'action' | 'chat',
    actionType: string,
    userPrompt: string,
    displayTitle?: string
  ) => {
    // Guard: Prevent duplicate requests while loading
    if (requestState === 'loading') {
      return;
    }

    // Cancel previous request if any
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    if (timeoutIdRef.current) {
      clearTimeout(timeoutIdRef.current);
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    setRequestState('loading');
    setErrorMessage('');
    setCurrentActionTitle(displayTitle || 'AI analyzing code...');

    // Add user message to log
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: userPrompt,
      timestamp: Date.now(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');

    // Set 25s hard timeout
    timeoutIdRef.current = setTimeout(() => {
      controller.abort();
      setRequestState('timeout');
      setErrorMessage('AI request timed out after 25s. The model server took too long to respond.');
    }, AI_TIMEOUT_MS);

    try {
      const payload = {
        mode,
        action: actionType,
        message: userPrompt,
        context: codeContext,
        history: messages.slice(-4).map((m) => ({ role: m.role, content: m.content })),
      };

      const response = await fetch('/api/code/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      if (timeoutIdRef.current) {
        clearTimeout(timeoutIdRef.current);
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `AI server returned HTTP ${response.status}`);
      }

      const data = await response.json();

      if (data.success && data.response) {
        const assistantMsg: ChatMessage = {
          id: `asst-${Date.now()}`,
          role: 'assistant',
          title: data.title || displayTitle,
          content: data.response,
          timestamp: Date.now(),
        };

        setMessages((prev) => [...prev, assistantMsg]);
        setRequestState('success');
      } else {
        throw new Error(data.error || 'AI could not generate a response.');
      }
    } catch (err: any) {
      if (err.name === 'AbortError') {
        if (requestState !== 'timeout') {
          setRequestState('error');
          setErrorMessage('Request was cancelled.');
        }
      } else {
        setRequestState('error');
        setErrorMessage(
          err.message || 'AI assistant is temporarily unavailable. Check your LLM keys or network.'
        );
      }
    } finally {
      abortControllerRef.current = null;
      if (timeoutIdRef.current) {
        clearTimeout(timeoutIdRef.current);
      }
    }
  };

  const handleActionClick = (actionKey: string, title: string, promptText: string) => {
    if (actionKey === 'FIX_CODE') {
      onRequestFix();
      return;
    }
    executeAIRequest('action', actionKey, promptText, title);
  };

  const handleChatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || requestState === 'loading') return;
    executeAIRequest('chat', 'FREE_CHAT', inputMessage.trim(), 'AI Mentor');
  };

  const quickActions = [
    {
      key: 'FIX_CODE',
      label: 'Fix with AI',
      icon: <Wand2 className="w-3.5 h-3.5 text-accent" />,
      title: 'Bug Fix Proposal',
      prompt: 'Fix current code error with structured patch',
      highlight: true,
    },
    {
      key: 'EXPLAIN_CODE',
      label: 'Explain Code',
      icon: <FileCode2 className="w-3.5 h-3.5 text-primary" />,
      title: 'Code Explanation & Complexity',
      prompt: 'Explain this code line by line and its Big-O complexity.',
    },
    {
      key: 'FIND_BUGS',
      label: 'Find Bugs',
      icon: <Bug className="w-3.5 h-3.5 text-rose-400" />,
      title: 'Bug & Vulnerability Scan',
      prompt: 'Find any bugs, edge cases, or potential errors in this code.',
    },
    {
      key: 'OPTIMIZE_CODE',
      label: 'Optimize O(n)',
      icon: <Cpu className="w-3.5 h-3.5 text-emerald-400" />,
      title: 'Optimization & Big-O Analysis',
      prompt: 'Analyze time & space complexity and suggest an optimized solution.',
    },
    {
      key: 'TUTOR',
      label: 'Give Hint',
      icon: <Lightbulb className="w-3.5 h-3.5 text-amber-400" />,
      title: 'Socratic Tutor Hint',
      prompt: 'Give me a smart progressive hint without spoiling the solution.',
    },
    {
      key: 'GENERATE_TESTS',
      label: 'Generate Tests',
      icon: <TestTube className="w-3.5 h-3.5 text-purple-400" />,
      title: 'Edge-Case Test Suite',
      prompt: 'Generate edge case test inputs and expected outputs for this code.',
    },
  ];

  return (
    <div className="w-full h-full min-w-0 flex flex-col bg-[#070e22]/95 border-l border-border/70 select-none overflow-hidden">
      {/* Header */}
      <div className="p-3 bg-[#0a142f] border-b border-border/60 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white shadow-glow">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-800 text-foreground flex items-center gap-1.5">
              <span>Code Mentor</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <div className="text-[10px] text-muted-foreground">
              {aiMode === 'tutor' ? '🎓 Socratic Tutor Mode' : '🛠️ Direct Solution Mode'}
            </div>
          </div>
        </div>

        <button
          onClick={onToggleAiMode}
          title="Toggle Tutor Mode vs Solution Mode"
          className="text-[11px] px-2 py-1 rounded-lg bg-secondary border border-border hover:border-primary/40 text-muted-foreground hover:text-foreground transition-all cursor-pointer font-semibold"
        >
          {aiMode === 'tutor' ? 'Tutor' : 'Solution'}
        </button>
      </div>

      {/* Quick Action Chips */}
      <div className="p-2 border-b border-border/50 bg-[#060b18]/60 overflow-x-auto shrink-0">
        <div className="flex items-center gap-1.5 flex-nowrap min-w-max">
          {quickActions.map((action) => (
            <button
              key={action.key}
              disabled={requestState === 'loading'}
              onClick={() => handleActionClick(action.key, action.title, action.prompt)}
              className={`px-2.5 py-1 rounded-xl text-[11px] font-semibold flex items-center gap-1.5 border transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                action.highlight
                  ? 'bg-primary/20 border-primary/50 text-accent hover:bg-primary/30 shadow-glow'
                  : 'bg-secondary/60 border-border hover:border-primary/40 text-muted-foreground hover:text-foreground'
              }`}
            >
              {action.icon}
              <span>{action.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Messages Scroll Area */}
      <div className="flex-1 min-h-0 p-3 overflow-y-auto overflow-x-hidden space-y-3.5 select-text text-xs">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
          >
            {msg.title && msg.role === 'assistant' && (
              <span className="text-[10px] font-bold text-accent uppercase tracking-wider mb-1 px-1">
                {msg.title}
              </span>
            )}
            <div
              className={`max-w-[92%] p-3 rounded-2xl overflow-x-auto ${
                msg.role === 'user'
                  ? 'bg-primary text-white rounded-br-none shadow-glow font-medium'
                  : 'bg-[#0a142f] text-foreground border border-border/70 rounded-bl-none shadow-sm'
              }`}
            >
              {msg.role === 'assistant' ? (
                <MarkdownRenderer content={msg.content} />
              ) : (
                <p className="whitespace-pre-wrap">{msg.content}</p>
              )}
            </div>
            <span className="text-[9px] text-muted-foreground/60 mt-1 px-1">
              {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        ))}

        {/* Loading State Animation */}
        {requestState === 'loading' && (
          <div className="p-3 rounded-2xl bg-[#0a142f]/80 border border-primary/40 flex items-center gap-3 text-xs text-foreground animate-pulse">
            <div className="w-5 h-5 rounded-full border-2 border-primary border-t-transparent animate-spin shrink-0" />
            <div>
              <div className="font-bold text-accent">{currentActionTitle || 'Analyzing code...'}</div>
              <div className="text-[11px] text-muted-foreground">Evaluating syntax and Big-O runtime...</div>
            </div>
          </div>
        )}

        {/* Error / Timeout State Card */}
        {(requestState === 'error' || requestState === 'timeout') && (
          <div className="p-3 rounded-2xl bg-danger/10 border border-danger/40 text-xs space-y-2 animate-fade-in">
            <div className="flex items-center gap-1.5 text-danger font-bold">
              {requestState === 'timeout' ? (
                <Clock className="w-4 h-4" />
              ) : (
                <AlertCircle className="w-4 h-4" />
              )}
              <span>{requestState === 'timeout' ? 'AI Request Timed Out' : 'AI Request Failed'}</span>
            </div>
            <p className="text-rose-200 text-[11px] leading-relaxed">{errorMessage}</p>
            <div className="pt-1">
              <button
                onClick={() => setRequestState('idle')}
                className="px-3 py-1 bg-danger/20 hover:bg-danger/30 text-rose-200 border border-danger/40 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer transition-all"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Dismiss</span>
              </button>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Chat Input Form */}
      <div className="p-3 bg-[#0a142f] border-t border-border/70 shrink-0">
        <form onSubmit={handleChatSubmit} className="flex items-center gap-2">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder={
              requestState === 'loading'
                ? 'AI is analyzing code...'
                : 'Ask AI tutor (e.g. "How does this loop work?")'
            }
            disabled={requestState === 'loading'}
            className="flex-1 bg-[#060b18] text-xs text-foreground px-3.5 py-2.5 rounded-xl border border-border focus:outline-none focus:border-primary placeholder:text-muted-foreground/50 transition-all font-sans disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={requestState === 'loading' || !inputMessage.trim()}
            className="p-2.5 rounded-xl bg-gradient-to-r from-primary to-accent text-white shadow-glow hover:shadow-glow-cyan disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer shrink-0"
          >
            {requestState === 'loading' ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
