'use client';

import React, { useState, useRef, useEffect, useCallback, Suspense, memo } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { useProfile } from '@/hooks/useProfile';
import { Role } from '@/types/campus';
import { AIChatMessage } from '@/lib/ai/aiTypes';
import Badge from '@/components/ui/Badge';
import AIOrb, { AIThinkingIndicator } from '@/components/motion/AIOrb';
import MagneticButton from '@/components/motion/MagneticButton';
import MarkdownRenderer from './MarkdownRenderer';

interface CampusAIAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface AIStatusData {
  status: 'online' | 'local-deterministic' | 'offline';
  provider: string;
  model: string;
  baseUrl?: string;
  isFree: boolean;
  localAvailable: boolean;
  availableModels?: string[];
  toolsRegistered?: number;
  hardware?: {
    totalRamGb: number;
    freeRamGb: number;
    cpuCores: number;
    cpuModel: string;
    recommendedLocalModel: string;
    recommendedAlternativeModels: string[];
  };
}

export interface ActiveDocumentContext {
  id?: string;
  title: string;
  subject?: string;
  fileName?: string;
  fileType?: string;
  fileSize?: string;
  extractedText: string;
  pageCount?: number;
  isScanned?: boolean;
}

interface MessageWithMetadata extends AIChatMessage {
  executionSteps?: Array<{ step: string; toolName?: string; status: string; durationMs?: number }>;
  toolsUsed?: string[];
  modelUsed?: string;
  provider?: string;
  durationMs?: number;
  attachedFileName?: string;
  isError?: boolean;
  canRetry?: boolean;
}

const MAX_RESPONSE_LENGTH = 60000;
const REQUEST_TIMEOUT_MS = 45000;

const ChatMessageItem = memo(function ChatMessageItem({
  msg,
  debugMode,
  onNavigate,
  onRetry,
}: {
  msg: MessageWithMetadata;
  debugMode: boolean;
  onNavigate: (route: string) => void;
  onRetry?: (text: string) => void;
}) {
  return (
    <div className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} animate-fade-in`}>
      <div
        className={`max-w-[92%] p-4 sm:p-5 rounded-[18px] text-[13.5px] leading-relaxed ${
          msg.role === 'user'
            ? 'bg-[#DCFCE7] text-[#1D1D1F] border border-black/[0.04] rounded-tr-sm shadow-subtle'
            : 'bg-white border border-black/[0.06] text-[#1D1D1F] rounded-tl-sm shadow-card'
        }`}
      >
        {/* Attached document tag */}
        {msg.attachedFileName && (
          <div className="mb-2 px-2.5 py-1 rounded-lg bg-white text-[11px] font-mono flex items-center gap-1.5 text-primary-dark border border-brand-100 shadow-sm">
            <span>📄</span>
            <span>Document Focus: {msg.attachedFileName}</span>
          </div>
        )}

        {/* Multi-step tool execution tracker in message */}
        {msg.executionSteps && msg.executionSteps.length > 0 && (
          <div className="mb-3 p-2.5 rounded-xl bg-slate-50 border border-border text-[11px] space-y-1.5">
            <div className="flex items-center justify-between text-muted-foreground font-700 uppercase tracking-wider text-[10px]">
              <span>⚡ Academic Processing</span>
              <span className="text-primary-dark font-mono">{msg.executionSteps.length} Step(s)</span>
            </div>
            {msg.executionSteps.map((step, sIdx) => (
              <div key={sIdx} className="flex items-center gap-2 text-foreground/90 font-500">
                <span className="text-primary font-bold">●</span>
                <span className="flex-1">{step.step}</span>
                {step.toolName && (
                  <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-brand-50 text-primary-dark border border-brand-100">
                    {step.toolName}
                  </span>
                )}
                <span className="text-primary font-700">✓</span>
              </div>
            ))}
          </div>
        )}

        {/* Rich Markdown Response */}
        {msg.role === 'assistant' ? (
          <MarkdownRenderer content={msg.content} />
        ) : (
          <div className="whitespace-pre-wrap">{msg.content}</div>
        )}

        {/* Retry Button if Failed */}
        {msg.canRetry && onRetry && (
          <div className="mt-3 pt-2 border-t border-border/40 flex items-center gap-2">
            <button
              onClick={() => onRetry(msg.content)}
              className="text-xs px-3 py-1.5 rounded-xl bg-accent/15 hover:bg-accent/25 text-accent border border-accent/30 font-700 transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <span>🔄</span>
              <span>Retry</span>
            </button>
          </div>
        )}

        {/* Write Action Confirmation Request */}
        {msg.action && msg.action.requiresConfirmation && (
          <div className="mt-3.5 p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-2">
            <div className="flex items-center gap-2 text-amber-400 text-xs font-700">
              <span>⚠️</span>
              <span>Confirmation Required (Write Action)</span>
            </div>
            <p className="text-xs text-foreground/90">
              {msg.action.confirmationMessage || `Are you sure you want to execute: "${msg.action.label}"?`}
            </p>
            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={() => {
                  toast.success(`Action confirmed: ${msg.action?.label}`);
                  if (msg.action?.route) onNavigate(msg.action.route);
                }}
                className="btn-primary text-xs py-1.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-600 font-700 cursor-pointer"
              >
                ✓ Confirm & Execute
              </button>
              <button
                onClick={() => {
                  toast.error('Action cancelled');
                }}
                className="text-xs py-1.5 px-3 rounded-xl bg-secondary/40 hover:bg-secondary/60 text-muted-foreground font-600 cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Direct Action Trigger Button */}
        {msg.action?.route && !msg.action?.requiresConfirmation && (
          <div className="mt-3.5 pt-3 border-t border-border/40 flex items-center justify-between gap-3">
            <span className="text-[11px] text-muted-foreground font-600">Action:</span>
            <button
              onClick={() => {
                if (msg.action?.route) onNavigate(msg.action.route);
              }}
              className="btn-primary text-xs py-1.5 px-4 rounded-xl shadow-glow cursor-pointer font-800"
            >
              🚀 {msg.action.label || 'Open View'} →
            </button>
          </div>
        )}

        {/* Debug Inspector */}
        {debugMode && msg.role === 'assistant' && (
          <div className="mt-3 pt-2 border-t border-dashed border-border/60 text-[10px] font-mono text-muted-foreground space-y-0.5">
            <div>
              Model: <span className="text-foreground">{msg.modelUsed || 'default'}</span>
            </div>
            <div>
              Provider: <span className="text-foreground">{msg.provider || 'Campus OS'}</span>
            </div>
            {msg.toolsUsed && msg.toolsUsed.length > 0 && (
              <div>
                Tools: <span className="text-accent">{msg.toolsUsed.join(', ')}</span>
              </div>
            )}
            {msg.durationMs && (
              <div>
                Latency: <span className="text-foreground">{msg.durationMs}ms</span>
              </div>
            )}
          </div>
        )}
      </div>
      <span className="text-[10px] text-muted-foreground mt-1 px-1 font-mono">{msg.timestamp}</span>
    </div>
  );
});

function CampusAIAssistantModalInner({ isOpen, onClose }: CampusAIAssistantModalProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentTab = searchParams ? searchParams.get('tab') || 'overview' : 'overview';
  const { profile } = useProfile();

  const userRole: Role = profile?.role || 'student';
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [aiStatus, setAiStatus] = useState<AIStatusData>({
    status: 'online',
    provider: 'Groq Cloud / Local Ollama',
    model: 'qwen2.5:7b',
    isFree: true,
    localAvailable: false,
    toolsRegistered: 16,
  });

  const [messages, setMessages] = useState<MessageWithMetadata[]>([
    {
      id: 'msg-init',
      role: 'assistant',
      content: `Hello **${profile?.fullName || 'Campus Member'}**! I am **Campus AI** ✨\n\nI provide **authentic document intelligence**, programming assistance, and academic mentoring.\n\nWhat would you like to explore?\n- 📄 **Document Intelligence** (*"Summarize attached PDF"*, *"Generate 10 MCQs from this document"*, *"Explain Question 3"*)\n- 💡 **General Computer Science** (*"Explain 3NF Normalization"*, *"How does Banker's Algorithm prevent deadlock?"*)\n- 💻 **Programming & Code Lab** (*"Write a Python script for Dijkstra's algorithm"*, *"Fix bug in C# code"*)\n- 📊 **Campus Records & Actions** (*"What is my attendance?"*, *"Open my timetable"*)\n\nHow can I help you today?`,
      timestamp: 'Just now',
    },
  ]);

  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeToolStatus, setActiveToolStatus] = useState<string | null>(null);
  const [debugMode, setDebugMode] = useState(false);
  const [activeDocument, setActiveDocument] = useState<ActiveDocumentContext | null>(null);

  // References for streaming lifecycle and non-blocking batching
  const abortControllerRef = useRef<AbortController | null>(null);
  const timeoutIdRef = useRef<NodeJS.Timeout | null>(null);
  const rafIdRef = useRef<number | null>(null);
  const accumulatedContentRef = useRef<string>('');
  const activeAiMsgIdRef = useRef<string | null>(null);
  const isLoadingRef = useRef<boolean>(false);
  const lastUserQueryRef = useRef<string>('');

  // Fetch real AI provider health status on mount
  useEffect(() => {
    fetch('/api/ai/health')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setAiStatus({
            status: data.status,
            provider: data.provider,
            model: data.model,
            baseUrl: data.baseUrl,
            isFree: data.isFree ?? true,
            localAvailable: data.localAvailable,
            availableModels: data.availableModels,
            toolsRegistered: data.toolsRegistered,
            hardware: data.hardware,
          });
        }
      })
      .catch(() => {});
  }, []);

  // Cleanup on unmount or close
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (timeoutIdRef.current) {
        clearTimeout(timeoutIdRef.current);
      }
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, []);

  // Listen for campusos:open-ai events (e.g. from notes reader, exams view, or assignments)
  useEffect(() => {
    const handleOpenAIEvent = (e: Event) => {
      const customEvent = e as CustomEvent;
      const { query, initialMessage, selectedDocument } = customEvent.detail || {};

      if (selectedDocument) {
        const text = selectedDocument.extractedText || selectedDocument.description || '';
        setActiveDocument({
          id: selectedDocument.id,
          title: selectedDocument.title || selectedDocument.name || 'Selected Document',
          subject: selectedDocument.subject,
          fileName: selectedDocument.fileName || selectedDocument.title,
          fileType: selectedDocument.fileType || 'pdf',
          fileSize: selectedDocument.fileSize,
          extractedText: text,
          pageCount: selectedDocument.pageCount,
          isScanned: selectedDocument.isScanned,
        });
      }

      const q = query || initialMessage;
      if (q) {
        setTimeout(() => {
          sendMessage(q);
        }, 200);
      }
    };

    window.addEventListener('campusos:open-ai', handleOpenAIEvent);
    return () => window.removeEventListener('campusos:open-ai', handleOpenAIEvent);
  }, []);

  // Non-blocking, layout-safe auto-scroll
  const scrollToBottom = useCallback((smooth = false) => {
    if (scrollContainerRef.current) {
      if (smooth) {
        scrollContainerRef.current.scrollTo({
          top: scrollContainerRef.current.scrollHeight,
          behavior: 'smooth',
        });
      } else {
        scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
      }
    }
  }, []);

  const handleNavigate = useCallback(
    (route: string) => {
      toast.success(`Navigating to ${route}`);
      router.push(route);
      onClose();
    },
    [router, onClose]
  );

  // Quick Action Prompts
  const getQuickActions = () => {
    if (activeDocument) {
      return [
        { label: '⚡ Summarize This File', query: `Summarize the core topics, key definitions, and exam points from "${activeDocument.title}".` },
        { label: '🎯 Generate 10 MCQs', query: `Generate 10 MCQs with 4 options and answers from "${activeDocument.title}".` },
        { label: '💡 Explain Key Concepts', query: `Explain the fundamental concepts and mechanisms in "${activeDocument.title}".` },
        { label: '📝 Practice Viva Questions', query: `Generate 5 high-yield viva questions with answers from "${activeDocument.title}".` },
      ];
    }

    if (userRole === 'student') {
      return [
        { label: '💡 What is Quantum Computing?', query: 'What is quantum computing?' },
        { label: '💻 Python CGPA Script', query: 'Write a Python program to calculate and sort student CGPA.' },
        { label: '🎓 DBMS Viva Tutor', query: 'Help me prepare for my DBMS viva. Quiz me step by step.' },
        { label: '📊 Check My Attendance', query: 'What is my attendance?' },
        { label: '📅 Open Timetable', query: 'Open my timetable' },
        { label: '📝 Explain Normalization', query: 'Explain DBMS normalization in simple terms with examples.' },
      ];
    }

    if (userRole === 'teacher') {
      return [
        { label: '👥 Show My Classes', query: 'Show my assigned classes and student counts' },
        { label: '⚠️ Attendance Risk (<75%)', query: 'Which students have low attendance below 75%?' },
        { label: '🚀 Start My Next Class', query: 'Start my next class session' },
        { label: '📝 Question Papers', query: 'Show official question papers' },
      ];
    }

    return [
      { label: '🏛️ Campus Stats', query: 'Show BCA institutional statistics' },
      { label: '🚨 Attendance Risk', query: 'Show students at academic risk' },
      { label: '📢 Create Notice', query: 'Broadcast an announcement about exam hall allotment' },
    ];
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 25 * 1024 * 1024) {
      toast.error('File size exceeds 25MB limit.');
      return;
    }

    const toastId = toast.loading(`Reading & extracting "${file.name}"...`);
    try {
      const { DocumentParserService } = await import('@/services/documentParserService');
      const parsed = await DocumentParserService.parseFile(file);
      toast.dismiss(toastId);

      if (parsed.success) {
        setActiveDocument({
          title: parsed.fileName,
          fileName: parsed.fileName,
          fileType: parsed.fileType,
          fileSize: `${(parsed.fileSize / 1024).toFixed(1)} KB`,
          extractedText: parsed.extractedText,
          pageCount: parsed.pageCount,
          isScanned: parsed.isScanned,
        });

        toast.success(`Attached "${file.name}" (${(file.size / 1024).toFixed(1)} KB) — Text extracted!`);
      } else {
        toast.error(parsed.error || 'Failed to extract text from document.');
      }
    } catch (err: any) {
      toast.dismiss(toastId);
      toast.error(`Error reading document: ${err?.message || err}`);
    }
  };

  const handleStopGeneration = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    if (timeoutIdRef.current) {
      clearTimeout(timeoutIdRef.current);
      timeoutIdRef.current = null;
    }
    if (rafIdRef.current) {
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    }

    const aiId = activeAiMsgIdRef.current;
    const finalBuffer = accumulatedContentRef.current;
    if (aiId && finalBuffer) {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === aiId
            ? {
                ...m,
                content: finalBuffer + (finalBuffer.endsWith('\n\n') ? '' : '\n\n') + '⏹ *[Generation stopped by user]*',
              }
            : m
        )
      );
    }

    isLoadingRef.current = false;
    setIsLoading(false);
    setActiveToolStatus(null);
    toast.info('Generation stopped.');
  }, []);

  const handleNewConversation = () => {
    handleStopGeneration();
    setMessages([
      {
        id: `msg-reset-${Date.now()}`,
        role: 'assistant',
        content: `**New conversation started.**\n\nI am ready to assist you with general knowledge, code, tutoring, math, documents, or Campus OS academic data. What is on your mind?`,
        timestamp: 'Just now',
      },
    ]);
    setActiveDocument(null);
    toast.success('Conversation history reset.');
  };

  const handleRetry = useCallback((failedQuery?: string) => {
    const queryToRetry = failedQuery || lastUserQueryRef.current;
    if (queryToRetry) {
      sendMessage(queryToRetry);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const sendMessage = async (textToSend?: string, toolHint?: string) => {
    const query = (textToSend || inputText).trim();
    if ((!query && !activeDocument) || isLoadingRef.current) return;

    lastUserQueryRef.current = query;

    // Attach active document context to query if not already embedded
    let finalQuery = query;
    if (
      activeDocument &&
      activeDocument.extractedText &&
      !query.includes(activeDocument.extractedText.slice(0, 60))
    ) {
      finalQuery = `${query}\n\n[Active Document: "${activeDocument.title}"]\n"""\n${activeDocument.extractedText.slice(0, 8000)}\n"""`;
    }

    const userMsg: MessageWithMetadata = {
      id: `usr-${Date.now()}`,
      role: 'user',
      content: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      attachedFileName: activeDocument?.title,
    };

    const aiMsgId = `ai-${Date.now()}`;
    activeAiMsgIdRef.current = aiMsgId;
    accumulatedContentRef.current = '';
    isLoadingRef.current = true;

    setMessages((prev) => [
      ...prev,
      userMsg,
      {
        id: aiMsgId,
        role: 'assistant',
        content: '',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);

    setInputText('');
    setIsLoading(true);
    setActiveToolStatus(toolHint || (activeDocument ? 'Reading & analyzing document...' : 'AI is typing...'));

    setTimeout(() => scrollToBottom(true), 50);

    const controller = new AbortController();
    abortControllerRef.current = controller;
    const startTime = Date.now();

    timeoutIdRef.current = setTimeout(() => {
      if (isLoadingRef.current) {
        controller.abort();
        toast.error('AI response timed out. Please try again.');
        setMessages((prev) =>
          prev.map((m) =>
            m.id === aiMsgId
              ? {
                  ...m,
                  content:
                    accumulatedContentRef.current.trim() ||
                    '⚠️ **Notice**: AI response timed out. Please click **Retry** below to generate again.',
                  isError: true,
                  canRetry: true,
                }
              : m
          )
        );
        isLoadingRef.current = false;
        setIsLoading(false);
        setActiveToolStatus(null);
      }
    }, REQUEST_TIMEOUT_MS);

    let isBatchUpdateScheduled = false;
    const scheduleBatchedUpdate = () => {
      if (isBatchUpdateScheduled) return;
      isBatchUpdateScheduled = true;

      rafIdRef.current = requestAnimationFrame(() => {
        isBatchUpdateScheduled = false;
        const currentContent = accumulatedContentRef.current;
        setMessages((prev) =>
          prev.map((m) => (m.id === aiMsgId ? { ...m, content: currentContent } : m))
        );
        scrollToBottom(false);
      });
    };

    try {
      const historyPayload = messages.slice(-8).map((m) => ({
        role: m.role,
        content: m.content.slice(-1500),
      }));

      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          message: finalQuery,
          userProfile: profile,
          currentPath: pathname,
          currentTab,
          sessionId: `session_${profile?.id || 'guest'}`,
          history: historyPayload,
          selectedEntity: activeDocument
            ? {
                id: activeDocument.id,
                title: activeDocument.title,
                fileName: activeDocument.fileName,
                subject: activeDocument.subject,
                extractedText: activeDocument.extractedText,
              }
            : undefined,
          stream: true,
        }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({ error: 'Request failed' }));
        throw new Error(errJson.error || `Server returned ${res.status}`);
      }

      if (res.headers.get('content-type')?.includes('text/event-stream') && res.body) {
        const reader = res.body.getReader();
        const decoder = new TextDecoder('utf-8');
        let buffer = '';
        let streamCompleted = false;

        const processSseLine = (line: string) => {
          const trimmed = line.trim();
          if (!trimmed || trimmed.startsWith(':')) return;
          if (trimmed === 'data: [DONE]') {
            streamCompleted = true;
            return;
          }
          if (!trimmed.startsWith('data:')) return;

          const jsonStr = trimmed.startsWith('data: ') ? trimmed.slice(6) : trimmed.slice(5).trim();
          if (!jsonStr) return;

          let event: any;
          try {
            event = JSON.parse(jsonStr);
          } catch {
            return;
          }

          if (event.type === 'token') {
            const token = event.content ?? event.token ?? event.text ?? '';
            if (token) {
              accumulatedContentRef.current += token;
              if (accumulatedContentRef.current.length > MAX_RESPONSE_LENGTH) {
                controller.abort();
              }
              scheduleBatchedUpdate();
            }
          } else if (event.type === 'step') {
            setActiveToolStatus(event.step);
          } else if (event.type === 'action') {
            setMessages((prev) =>
              prev.map((m) =>
                m.id === aiMsgId
                  ? {
                      ...m,
                      action: {
                        type: 'navigate',
                        label: event.action?.label || 'Navigate',
                        route: event.action?.route || pathname,
                      },
                    }
                  : m
              )
            );
          } else if (event.type === 'error') {
            accumulatedContentRef.current =
              event.content || 'CampusOS AI encountered a temporary issue. Please try again.';
            scheduleBatchedUpdate();
            streamCompleted = true;
          } else if (event.type === 'done') {
            streamCompleted = true;
          }
        };

        while (!streamCompleted) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            processSseLine(line);
          }
        }
      } else {
        const data = await res.json();
        accumulatedContentRef.current = data.answer || data.text || data.response || 'Response received.';
        scheduleBatchedUpdate();
      }

      // If streaming finished but zero tokens were received (e.g. proxy dropped SSE body)
      if (!accumulatedContentRef.current.trim()) {
        try {
          const fallbackRes = await fetch('/api/ai/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              message: finalQuery,
              userProfile: profile,
              currentPath: pathname,
              currentTab,
              sessionId: `session_${profile?.id || 'guest'}`,
              history: historyPayload,
              selectedEntity: activeDocument
                ? {
                    id: activeDocument.id,
                    title: activeDocument.title,
                    fileName: activeDocument.fileName,
                    subject: activeDocument.subject,
                    extractedText: activeDocument.extractedText,
                  }
                : undefined,
              stream: false,
            }),
          });
          if (fallbackRes.ok) {
            const fallbackData = await fallbackRes.json();
            accumulatedContentRef.current =
              fallbackData.answer || fallbackData.text || fallbackData.response || '';
          }
        } catch {
          // Keep whatever content or show retry notice below
        }
      }

      // Final state sync
      if (timeoutIdRef.current) clearTimeout(timeoutIdRef.current);
      if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);

      const finalContent =
        accumulatedContentRef.current.trim() ||
        'CampusOS AI is ready. Please click **Retry** below if your response was interrupted.';

      setMessages((prev) =>
        prev.map((m) =>
          m.id === aiMsgId
            ? {
                ...m,
                content: finalContent,
                durationMs: Date.now() - startTime,
                canRetry: !accumulatedContentRef.current.trim(),
              }
            : m
        )
      );

      isLoadingRef.current = false;
      setIsLoading(false);
      setActiveToolStatus(null);
      setTimeout(() => scrollToBottom(true), 50);
    } catch (err: any) {
      if (timeoutIdRef.current) clearTimeout(timeoutIdRef.current);
      if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);

      if (err.name === 'AbortError') return;

      setMessages((prev) =>
        prev.map((m) =>
          m.id === aiMsgId
            ? {
                ...m,
                content: `⚠️ **AI Service Notice**: ${err.message || 'The AI service encountered an error.'}\n\nPlease click **Retry** to try again.`,
                isError: true,
                canRetry: true,
              }
            : m
        )
      );

      isLoadingRef.current = false;
      setIsLoading(false);
      setActiveToolStatus(null);
    } finally {
      isLoadingRef.current = false;
      setIsLoading(false);
      setActiveToolStatus(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/30 backdrop-blur-md animate-fade-in">
      <div className="bg-white w-full max-w-3xl h-[90vh] sm:h-[84vh] rounded-[22px] border border-black/[0.08] shadow-modal flex flex-col overflow-hidden animate-modal-pop">
        {/* Header */}
        <div className="p-4 border-b border-black/[0.06] flex items-center justify-between bg-white">
          <div className="flex items-center gap-3">
            <AIOrb status={isLoading ? 'analyzing' : 'idle'} size="md" />
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-sm font-bold text-[#1D1D1F] tracking-tight flex items-center gap-1.5">
                  <span>CampusOS Copilot</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#DCFCE7] text-[#15803D] font-semibold">
                    Ready
                  </span>
                </h3>
              </div>
              <p className="text-[11px] text-[#6E6E73] font-normal">
                Academic Copilot · {currentTab.toUpperCase()}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleNewConversation}
              className="text-xs px-2.5 py-1.5 rounded-xl border border-black/[0.08] hover:bg-black/[0.03] text-[#1D1D1F] font-medium transition-colors cursor-pointer flex items-center gap-1"
              title="Start New Conversation"
            >
              <span>✨</span>
              <span className="hidden sm:inline">New Chat</span>
            </button>
            <button
              onClick={onClose}
              className="w-7 h-7 rounded-full bg-black/[0.04] hover:bg-black/[0.08] flex items-center justify-center text-[#8E8E93] hover:text-[#1D1D1F] transition-colors cursor-pointer"
              title="Close Assistant"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </div>

        {/* Quick Action Pills */}
        <div className="p-2 border-b border-black/[0.04] bg-[#FAFAFC] flex gap-2 overflow-x-auto text-xs no-scrollbar">
          {getQuickActions().map((qa, i) => (
            <button
              key={i}
              onClick={() => sendMessage(qa.query)}
              disabled={isLoading}
              className="whitespace-nowrap px-3 py-1.5 rounded-lg bg-white border border-black/[0.06] text-[#48484A] hover:text-[#1D1D1F] hover:bg-black/[0.02] transition-colors cursor-pointer font-medium text-[11px] flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed shadow-subtle"
            >
              {qa.label}
            </button>
          ))}
        </div>

        {/* Message Stream */}
        <div
          ref={scrollContainerRef}
          className="flex-1 p-4 overflow-y-auto space-y-4 text-xs sm:text-sm leading-relaxed bg-slate-50/30"
        >
          {messages.map((msg) => (
            <ChatMessageItem
              key={msg.id}
              msg={msg}
              debugMode={debugMode}
              onNavigate={handleNavigate}
              onRetry={handleRetry}
            />
          ))}

          {/* Active Tool / Thinking Indicator */}
          {isLoading && (
            <div className="max-w-[85%] animate-fade-in space-y-2">
              <AIThinkingIndicator statusText={activeToolStatus || 'Reasoning & formulating answer...'} />
              <button
                type="button"
                onClick={handleStopGeneration}
                className="text-[10px] px-2.5 py-1 rounded-lg border border-red-200 text-red-600 bg-red-50 hover:bg-red-100 transition-colors cursor-pointer font-600 flex items-center gap-1.5"
              >
                <span>⏹</span>
                <span>Stop Generation</span>
              </button>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* ─── ACTIVE DOCUMENT BANNER (PERSISTENT CONTEXT) ────────────────── */}
        {activeDocument && (
          <div className="px-4 py-2.5 bg-brand-50 border-t border-brand-100 flex items-center justify-between text-xs animate-fade-in">
            <div className="flex items-center gap-2 truncate pr-2">
              <span className="text-base flex-shrink-0">📑</span>
              <div className="truncate">
                <span className="font-700 text-primary-dark truncate block">
                  Active Document: "{activeDocument.title}"
                </span>
                <span className="text-[10px] text-slate-600 font-mono">
                  {activeDocument.fileSize || 'Attached'} {activeDocument.pageCount ? `· ${activeDocument.pageCount} Pages` : ''} · AI Document Mode
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={() => {
                  setActiveDocument(null);
                  toast.info('Document detached from AI chat.');
                }}
                className="text-xs px-2.5 py-1 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 transition-all font-600 cursor-pointer"
                title="Detach Document"
              >
                ✕ Detach
              </button>
            </div>
          </div>
        )}

        {/* Input Bar */}
        <div className="p-4 border-t border-border bg-white">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage();
            }}
            className="flex items-center gap-2"
          >
            {/* File Upload Trigger */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              className="hidden"
              accept=".txt,.md,.pdf,.docx,.doc,.json,.csv,.py,.java,.cpp,.c,.js,.ts,.html,.css,.sql,.jpg,.jpeg,.png,.webp"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-10 h-10 rounded-xl border border-border hover:border-primary hover:text-primary-dark hover:bg-brand-50 flex items-center justify-center text-slate-500 transition-colors cursor-pointer flex-shrink-0"
              title="Attach Document for Analysis / RAG"
            >
              📎
            </button>

            <input
              type="text"
              placeholder={
                activeDocument
                  ? `Ask about "${activeDocument.title}": "Generate 10 MCQs", "Summarize", "Explain question 3"...`
                  : `Ask anything: "Explain polymorphism", "What is my attendance?", "DBMS study plan"...`
              }
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="input-field py-2.5 text-xs sm:text-sm font-500 flex-1 bg-white border-border focus:border-primary"
              disabled={isLoading}
              autoFocus
            />

            {isLoading ? (
              <button
                type="button"
                onClick={handleStopGeneration}
                className="px-4 py-2.5 rounded-xl bg-red-50 text-red-600 border border-red-200 text-xs font-700 hover:bg-red-100 transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <span>⏹</span>
                <span>Stop</span>
              </button>
            ) : (
              <button
                type="submit"
                disabled={(!inputText.trim() && !activeDocument) || isLoading}
                className="btn-primary px-5 text-xs sm:text-sm font-700 shadow-sm"
              >
                Send
              </button>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}

export default function CampusAIAssistantModal(props: CampusAIAssistantModalProps) {
  if (!props.isOpen) return null;
  return (
    <Suspense fallback={null}>
      <CampusAIAssistantModalInner {...props} />
    </Suspense>
  );
}
