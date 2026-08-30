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

// Memoized individual message item to prevent historical messages from re-rendering during streaming
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
        className={`max-w-[94%] p-4 sm:p-5 rounded-2xl ${
          msg.role === 'user'
            ? 'bg-gradient-to-br from-primary to-blue-600 text-white rounded-tr-none shadow-glow font-500'
            : 'glass-card border border-border/80 text-foreground rounded-tl-none shadow-glass'
        }`}
      >
        {/* Attached document tag */}
        {msg.attachedFileName && (
          <div className="mb-2 px-2.5 py-1 rounded-lg bg-black/30 text-[11px] font-mono flex items-center gap-1.5 text-accent border border-accent/20">
            <span>📄</span>
            <span>Attached: {msg.attachedFileName}</span>
          </div>
        )}

        {/* Multi-step tool execution tracker in message */}
        {msg.executionSteps && msg.executionSteps.length > 0 && (
          <div className="mb-3 p-2.5 rounded-xl bg-muted/40 border border-primary/20 text-[11px] space-y-1.5">
            <div className="flex items-center justify-between text-muted-foreground font-700 uppercase tracking-wider text-[10px]">
              <span>⚡ Academic Superpower Execution</span>
              <span className="text-primary font-mono">{msg.executionSteps.length} Step(s)</span>
            </div>
            {msg.executionSteps.map((step, sIdx) => (
              <div key={sIdx} className="flex items-center gap-2 text-foreground/90 font-500">
                <span className="text-accent font-bold">●</span>
                <span className="flex-1">{step.step}</span>
                {step.toolName && (
                  <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-primary/20 text-primary border border-primary/30">
                    {step.toolName}
                  </span>
                )}
                <span className="text-emerald-400 font-700">✓</span>
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
      content: `Hello **${profile?.fullName || 'Campus Member'}**! I am **Campus AI** ✨\n\nI am a **general-purpose AI assistant** with integrated **Campus OS superpowers**.\n\nAsk me anything:\n- 💡 **General Knowledge & Concepts** (*"What is quantum computing?", "Explain Dijkstra's algorithm"*)\n- 💻 **Programming & Code** (*"Write a Python script to sort students", "Explain polymorphism in Java"*)\n- 🎓 **Academic Tutoring & Prep** (*"Help me prepare for my DBMS viva", "Explain normalization like I'm 10"*)\n- 📊 **Your Academic Records** (*"What is my attendance?", "Which subject am I weakest in?"*)\n- 📅 **Campus Actions & Navigation** (*"Open my timetable", "When is my next exam?"*)\n\nHow can I help you today?`,
      timestamp: 'Just now',
    },
  ]);

  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeToolStatus, setActiveToolStatus] = useState<string | null>(null);
  const [debugMode, setDebugMode] = useState(false);
  const [attachedFile, setAttachedFile] = useState<{ name: string; content: string } | null>(null);
  const [showHardwareInfo, setShowHardwareInfo] = useState(false);

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
    },
    [router]
  );

  // Role-specific Inspiration Prompts
  const getQuickActions = () => {
    if (userRole === 'student') {
      return [
        { label: '💡 What is Quantum Computing?', query: 'What is quantum computing?' },
        { label: '💻 Python CGPA Script', query: 'Write a Python program to calculate and sort student CGPA.' },
        { label: '🎓 DBMS Viva Tutor', query: 'Help me prepare for my DBMS viva. Quiz me step by step.' },
        { label: '📊 Check My Attendance', query: 'What is my attendance?' },
        { label: '🎯 Weakest Subject & Plan', query: 'Which subject am I weakest in? Formulate a prioritized study plan.' },
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
        { label: '💡 Generate Code Example', query: 'Write a Java multi-threading example for students.' },
      ];
    }
    // Admin
    return [
      { label: '🏛️ Campus Stats', query: 'Show BCA institutional statistics' },
      { label: '🚨 Attendance Risk', query: 'Show students at academic risk' },
      { label: '📢 Create Notice', query: 'Broadcast an announcement about exam hall allotment' },
      { label: '📈 Open Analytics', query: 'Open analytics dashboard' },
    ];
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setAttachedFile({ name: file.name, content });
      toast.success(`Attached document: ${file.name}`);
    };
    reader.readAsText(file);
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

    // Flush any remaining content in buffer
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
    setAttachedFile(null);
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
    if ((!query && !attachedFile) || isLoadingRef.current) return;

    lastUserQueryRef.current = query;
    const finalQuery = attachedFile
      ? `${query}\n\n[Attached Document: ${attachedFile.name}]\n\`\`\`\n${attachedFile.content.slice(0, 4000)}\n\`\`\``
      : query;

    const userMsg: MessageWithMetadata = {
      id: `usr-${Date.now()}`,
      role: 'user',
      content: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      attachedFileName: attachedFile?.name,
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
    setAttachedFile(null);
    setIsLoading(true);
    setActiveToolStatus(toolHint || 'AI is typing...');

    // Smooth scroll on sending new message
    setTimeout(() => scrollToBottom(true), 50);

    const controller = new AbortController();
    abortControllerRef.current = controller;
    const startTime = Date.now();

    // Set client-side timeout to avoid indefinite hanging
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

    // Schedule batched state update via requestAnimationFrame
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
        // Instant scroll during token streaming avoids layout thrashing
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
            return; // Ignore partial lines safely
          }

          if (event.type === 'token' && typeof event.content === 'string') {
            if (accumulatedContentRef.current.length < MAX_RESPONSE_LENGTH) {
              accumulatedContentRef.current += event.content;
              scheduleBatchedUpdate();
            } else if (!accumulatedContentRef.current.includes('[Response truncated]')) {
              accumulatedContentRef.current += '\n\n⚠️ *[Response truncated due to maximum length safety]*';
              scheduleBatchedUpdate();
            }
          } else if (event.type === 'step') {
            setActiveToolStatus(event.step || 'Executing tool...');
          } else if (event.type === 'action' && event.action) {
            setMessages((prev) =>
              prev.map((m) => (m.id === aiMsgId ? { ...m, action: event.action } : m))
            );
            const targetRoute = event.action.route || (event.action.payload?.tab ? `/student-dashboard?tab=${event.action.payload.tab}` : null);
            if (targetRoute) {
              toast.success(`Navigating to ${event.action.label || targetRoute}`);
              router.push(targetRoute);
            }
          } else if (event.type === 'done') {
            streamCompleted = true;
            const durationMs = Date.now() - startTime;
            setMessages((prev) =>
              prev.map((m) =>
                m.id === aiMsgId
                  ? {
                      ...m,
                      content: accumulatedContentRef.current,
                      modelUsed: event.modelUsed,
                      provider: event.provider,
                      durationMs,
                    }
                  : m
              )
            );
            setActiveToolStatus('Complete');
          } else if (event.type === 'error') {
            const errMsg = event.content || 'Sorry, the response was interrupted. Please try again.';
            accumulatedContentRef.current += `\n\n⚠️ *${errMsg}*`;
            setMessages((prev) =>
              prev.map((m) =>
                m.id === aiMsgId
                  ? {
                      ...m,
                      content: accumulatedContentRef.current,
                      isError: true,
                      canRetry: true,
                    }
                  : m
              )
            );
            toast.error(errMsg);
          }
        };

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split(/\r?\n/);
          buffer = lines.pop() ?? '';

          for (const line of lines) {
            processSseLine(line);
          }
        }

        if (buffer.trim()) {
          processSseLine(buffer);
        }

        // Cancel any pending animation frames and flush final text
        if (rafIdRef.current) {
          cancelAnimationFrame(rafIdRef.current);
          rafIdRef.current = null;
        }

        const finalContent = accumulatedContentRef.current;
        setMessages((prev) =>
          prev.map((m) => (m.id === aiMsgId ? { ...m, content: finalContent } : m))
        );

        if (!streamCompleted && !finalContent.trim()) {
          throw new Error('Sorry, the response was interrupted. Please try again.');
        }
      } else {
        const data = await res.json();
        const durationMs = Date.now() - startTime;
        setMessages((prev) =>
          prev.map((m) =>
            m.id === aiMsgId
              ? {
                  ...m,
                  content: data.answer || 'Response received.',
                  action: data.action,
                  modelUsed: data.modelUsed,
                  provider: data.provider,
                  durationMs,
                }
              : m
          )
        );
      }
    } catch (err: any) {
      if (err.name === 'AbortError') return;
      const errMsg = err.message || 'Sorry, the response was interrupted. Please try again.';
      toast.error(errMsg);
      setMessages((prev) =>
        prev.map((m) => {
          if (m.id !== aiMsgId) return m;
          const prevContent = m.content.trim() || accumulatedContentRef.current.trim();
          return {
            ...m,
            content: prevContent
              ? `${prevContent}\n\n⚠️ *Sorry, the response was interrupted. Please try again.*`
              : '⚠️ **Notice**: Sorry, the response was interrupted. Please click **Retry** below.',
            isError: true,
            canRetry: true,
          };
        })
      );
    } finally {
      if (timeoutIdRef.current) {
        clearTimeout(timeoutIdRef.current);
        timeoutIdRef.current = null;
      }
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
      isLoadingRef.current = false;
      setIsLoading(false);
      window.setTimeout(() => setActiveToolStatus(null), 1200);
      abortControllerRef.current = null;
    }
  };

  const handleRegenerate = () => {
    if (messages.length < 2 || isLoading) return;
    const lastUserMsg = [...messages].reverse().find((m) => m.role === 'user');
    if (lastUserMsg) {
      sendMessage(lastUserMsg.content);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-md animate-fade-in cursor-pointer"
        onClick={onClose}
      />

      {/* Slide-over 3D AI Intelligence Core Panel */}
      <div className="relative w-full sm:max-w-2xl bg-card/95 backdrop-blur-2xl border-l border-primary/40 h-full flex flex-col shadow-2xl animate-slide-right z-10 selection:bg-accent selection:text-black">
        {/* Header Bar */}
        <div className="p-4 sm:p-4.5 border-b border-border/80 flex items-center justify-between bg-card/80 relative overflow-hidden">
          <div className="absolute top-0 right-1/4 w-32 h-32 bg-primary/20 rounded-full blur-2xl pointer-events-none" />

          <div className="flex items-center gap-3">
            <AIOrb size="md" status={isLoading ? 'analyzing' : 'idle'} />
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-sm font-800 text-foreground tracking-tight flex items-center gap-1.5">
                  <span>Campus AI</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/20 text-primary border border-primary/30 font-mono">
                    GPT-Grade
                  </span>
                </h3>
                <button
                  onClick={() => setShowHardwareInfo(!showHardwareInfo)}
                  className="cursor-pointer hover:opacity-90 transition-opacity"
                >
                  <Badge variant={aiStatus.localAvailable ? 'success' : 'cyan'}>
                    {aiStatus.localAvailable ? '🟢 Ollama Local Active' : `⚡ ${aiStatus.provider.split(' ')[0]}`}
                  </Badge>
                </button>
              </div>
              <p className="text-[11px] text-muted-foreground font-500">
                Model: <span className="text-foreground font-mono">{aiStatus.model}</span> · Tab:{' '}
                <span className="text-accent font-700">{currentTab.toUpperCase()}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleNewConversation}
              className="text-[11px] px-2.5 py-1.5 rounded-xl border border-border/60 hover:border-accent hover:text-accent bg-muted/30 font-600 transition-colors cursor-pointer flex items-center gap-1"
              title="Start New Conversation"
            >
              <span>✨</span>
              <span className="hidden sm:inline">New Chat</span>
            </button>
            <button
              onClick={() => setDebugMode(!debugMode)}
              className={`text-[10px] px-2 py-1 rounded-lg border font-mono cursor-pointer transition-colors ${
                debugMode
                  ? 'border-accent text-accent bg-accent/10'
                  : 'border-border text-muted-foreground hover:text-foreground'
              }`}
              title="Toggle AI Tool Debug Inspector"
            >
              {debugMode ? '🛠️ Debug: ON' : '🛠️ Debug'}
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-xl hover:bg-muted/80 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors cursor-pointer border border-border/40"
              title="Close Assistant"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </div>

        {/* Hardware & Provider Info Popover */}
        {showHardwareInfo && aiStatus.hardware && (
          <div className="p-3 bg-muted/40 border-b border-border/80 text-xs space-y-1.5 animate-fade-in">
            <div className="flex items-center justify-between font-700 text-foreground">
              <span>🖥️ System Hardware & Recommended Model</span>
              <button
                onClick={() => setShowHardwareInfo(false)}
                className="text-muted-foreground hover:text-foreground cursor-pointer"
              >
                ✕
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[11px] text-muted-foreground">
              <div>
                System RAM: <span className="text-foreground font-600">{aiStatus.hardware.totalRamGb} GB</span> (
                {aiStatus.hardware.freeRamGb} GB free)
              </div>
              <div>
                CPU: <span className="text-foreground font-600">{aiStatus.hardware.cpuCores} Cores</span>
              </div>
              <div className="col-span-2">
                Recommended Local Ollama Model:{' '}
                <code className="text-accent font-mono px-1 bg-black/40 rounded">
                  {aiStatus.hardware.recommendedLocalModel}
                </code>
              </div>
            </div>
            <div className="text-[10px] text-muted-foreground pt-1 border-t border-border/40">
              Run locally:{' '}
              <code className="text-emerald-400 font-mono">
                ollama run {aiStatus.hardware.recommendedLocalModel}
              </code>
            </div>
          </div>
        )}

        {/* Quick Action Pills */}
        <div className="p-2.5 border-b border-border/50 bg-muted/20 flex gap-2 overflow-x-auto text-xs no-scrollbar">
          {getQuickActions().map((qa, i) => (
            <button
              key={i}
              onClick={() => sendMessage(qa.query)}
              disabled={isLoading}
              className="btn-press whitespace-nowrap px-3 py-1.5 rounded-xl glass-card border border-primary/30 text-foreground hover:border-accent hover:text-accent hover:bg-accent/10 transition-all cursor-pointer font-600 text-[11px] shadow-sm flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {qa.label}
            </button>
          ))}
        </div>

        {/* Message Stream */}
        <div
          ref={scrollContainerRef}
          className="flex-1 p-4 overflow-y-auto space-y-4 text-xs sm:text-sm leading-relaxed"
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
                className="text-[10px] px-2.5 py-1 rounded-lg border border-red-500/40 text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer font-600 flex items-center gap-1.5"
              >
                <span>⏹</span>
                <span>Stop Generation</span>
              </button>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Attached Document Bar */}
        {attachedFile && (
          <div className="px-4 py-2 bg-primary/10 border-t border-primary/30 flex items-center justify-between text-xs animate-fade-in">
            <span className="flex items-center gap-1.5 text-accent font-500">
              <span>📄</span>
              <span className="truncate max-w-[250px]">{attachedFile.name}</span>
            </span>
            <button
              onClick={() => setAttachedFile(null)}
              className="text-muted-foreground hover:text-foreground cursor-pointer font-bold"
            >
              ✕
            </button>
          </div>
        )}

        {/* Input Bar */}
        <div className="p-4 border-t border-border/80 bg-card/90">
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
              accept=".txt,.md,.pdf,.json,.csv,.py,.java,.js,.ts"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-10 h-10 rounded-xl border border-border/60 hover:border-accent hover:text-accent flex items-center justify-center text-muted-foreground transition-colors cursor-pointer flex-shrink-0"
              title="Attach Document for Analysis / RAG"
            >
              📎
            </button>

            <input
              type="text"
              placeholder={`Ask anything: "Explain polymorphism", "What is my attendance?", "DBMS study plan"...`}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="input-field py-2.5 text-xs sm:text-sm font-500 flex-1"
              disabled={isLoading}
              autoFocus
            />

            {isLoading ? (
              <button
                type="button"
                onClick={handleStopGeneration}
                className="px-4 py-2.5 rounded-xl bg-red-500/20 text-red-400 border border-red-500/40 text-xs font-700 hover:bg-red-500/30 transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <span>⏹</span>
                <span>Stop</span>
              </button>
            ) : (
              <MagneticButton
                type="submit"
                variant="primary"
                size="md"
                disabled={(!inputText.trim() && !attachedFile) || isLoading}
                className="px-5 shadow-glow font-800"
              >
                Send
              </MagneticButton>
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

