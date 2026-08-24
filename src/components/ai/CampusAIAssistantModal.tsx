'use client';

import React, { useState, useRef, useEffect, Suspense } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { useProfile } from '@/hooks/useProfile';
import { Role } from '@/types/campus';
import { AIChatMessage, AIStudyPlan } from '@/lib/ai/aiTypes';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';

interface CampusAIAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface AIStatusData {
  status: 'online' | 'offline' | 'degraded';
  provider: string;
  model: string;
  isFree: boolean;
  message: string;
  apiKeyConfigured?: boolean;
}

function CampusAIAssistantModalInner({ isOpen, onClose }: CampusAIAssistantModalProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentTab = searchParams ? searchParams.get('tab') || 'overview' : 'overview';
  const { profile } = useProfile();

  const userRole: Role = profile?.role || 'student';

  const [aiStatus, setAiStatus] = useState<AIStatusData>({
    status: 'offline',
    provider: 'Campus Intelligence (Local)',
    model: 'openrouter/free',
    isFree: true,
    message: 'Local campus mode active',
    apiKeyConfigured: false,
  });

  const [messages, setMessages] = useState<AIChatMessage[]>([
    {
      id: 'msg-init',
      role: 'assistant',
      content: `Hello **${profile?.fullName || 'Campus Member'}**! I am the **Campus OS AI Intelligence Layer** ✨\n\nI am deeply integrated into your **${userRole.toUpperCase()}** workspace. I understand what page you are currently viewing, your attendance, timetable, and study notes. What can I do for you today?`,
      timestamp: 'Just now',
    },
  ]);

  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeToolStatus, setActiveToolStatus] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

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
            isFree: data.isFree ?? true,
            message: data.message,
            apiKeyConfigured: data.apiKeyConfigured,
          });
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading, activeToolStatus]);

  if (!isOpen) return null;

  // Role-specific Quick Actions
  const getQuickActions = () => {
    if (userRole === 'student') {
      return [
        {
          label: '📅 Open Timetable',
          query: 'Open my timetable',
          toolHint: 'Opening timetable...',
        },
        {
          label: '📊 Check Attendance',
          query: 'What is my attendance?',
          toolHint: 'Auditing attendance...',
        },
        {
          label: '📝 Next Exam',
          query: 'What is my next exam?',
          toolHint: 'Checking exam schedule...',
        },
        {
          label: '📋 Pending Assignments',
          query: 'What assignments do I have pending?',
          toolHint: 'Checking assignments...',
        },
        {
          label: '📚 Find DBMS Notes',
          query: 'Find my DBMS notes',
          toolHint: 'Searching notes library...',
        },
        {
          label: '🗓️ What to study today?',
          query: 'What should I study today?',
          toolHint: 'Synthesizing revision recommendations...',
        },
        {
          label: '🧠 Teach me Dijkstra',
          query: 'Explain Dijkstra',
          toolHint: 'Explaining algorithm...',
        },
        {
          label: '🎯 10-Question DAA Quiz',
          query: 'Give me a 10-question DAA quiz',
          toolHint: 'Generating quiz...',
        },
      ];
    }
    if (userRole === 'teacher') {
      return [
        {
          label: '👥 Show My Classes',
          query: 'Show my classes',
          toolHint: 'Loading class rosters...',
        },
        {
          label: '⚠️ Low Attendance (<75%)',
          query: 'Which students have low attendance?',
          toolHint: 'Scanning attendance logs...',
        },
        {
          label: '📝 Generate DBMS Paper',
          query: 'Generate a DBMS question paper',
          toolHint: 'Drafting examination paper...',
        },
        {
          label: '📋 Summarize Submissions',
          query: 'Summarize my submissions',
          toolHint: 'Checking submissions...',
        },
        {
          label: '➕ Create Assignment',
          query: 'Create an assignment about normalization',
          toolHint: 'Drafting assignment structure...',
        },
      ];
    }
    // Admin
    return [
      {
        label: '🏛️ Campus Overview',
        query: 'Give me an overview of campus performance',
        toolHint: 'Compiling institutional analytics...',
      },
      {
        label: '🚨 Lowest Attendance Dept',
        query: 'Which department has the lowest attendance?',
        toolHint: 'Comparing department stats...',
      },
      {
        label: '📢 Recent Announcements',
        query: 'Show recent announcements',
        toolHint: 'Fetching circulars...',
      },
      {
        label: '📈 Analyze Attendance Trends',
        query: 'Analyze attendance trends',
        toolHint: 'Scanning student compliance...',
      },
    ];
  };

  const determineToolHint = (q: string): string => {
    const lower = q.toLowerCase();
    if (lower.includes('timetable') || lower.includes('class')) return 'Opening timetable...';
    if (lower.includes('attendance')) return 'Reading attendance records...';
    if (lower.includes('exam')) return 'Checking exam schedule...';
    if (lower.includes('assignment')) return 'Checking assignments...';
    if (lower.includes('note') || lower.includes('find') || lower.includes('search')) return 'Searching Campus OS...';
    if (lower.includes('quiz')) return 'Generating quiz...';
    if (lower.includes('paper')) return 'Generating question paper...';
    if (lower.includes('study plan') || lower.includes('study today')) return 'Synthesizing revision plan...';
    if (lower.includes('explain') || lower.includes('teach')) return 'Formulating explanation...';
    return 'Reasoning & querying Campus OS...';
  };

  const sendMessage = async (textToSend?: string, toolHint?: string) => {
    const query = textToSend || inputText;
    if (!query.trim() || isLoading) return;

    const userMsg: AIChatMessage = {
      id: `usr-${Date.now()}`,
      role: 'user',
      content: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);
    setActiveToolStatus(toolHint || determineToolHint(query));

    try {
      const res = await fetch('/api/ai/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query,
          userProfile: profile,
          currentPath: pathname,
          currentTab,
          sessionId: `session_${profile?.id || 'guest'}`,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to get response from Campus OS AI');
      }

      const aiMsg: AIChatMessage = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: data.answer || 'I have processed your request.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        quiz: data.quizData,
        studyPlan: data.studyPlan,
        action: data.action,
      };

      setMessages((prev) => [...prev, aiMsg]);

      // If response includes direct navigation action, execute navigation
      if (data.action?.type === 'navigate' && data.action.route) {
        toast.success(`Navigating to ${data.action.label || data.action.route}`);
        router.push(data.action.route);
      }
    } catch (err: any) {
      toast.error('AI Assistant: ' + err.message);
      setMessages((prev) => [
        ...prev,
        {
          id: `ai-err-${Date.now()}`,
          role: 'assistant',
          content:
            '⚠️ I encountered a temporary connection issue. You can ask for timetable, attendance, or notes which will be handled seamlessly via deterministic campus intelligence.',
          timestamp: 'Just now',
        },
      ]);
    } finally {
      setIsLoading(false);
      setActiveToolStatus(null);
    }
  };

  const handleQuizAnswer = (msgId: string, optIndex: number) => {
    setMessages((prev) =>
      prev.map((msg) => {
        if (msg.id === msgId && msg.quiz) {
          return {
            ...msg,
            quiz: { ...msg.quiz, selectedOption: optIndex },
          };
        }
        return msg;
      })
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/75 backdrop-blur-md animate-fade-in cursor-pointer"
        onClick={onClose}
      />

      {/* Slide-over 3D Futuristic AI Panel */}
      <div className="relative w-full max-w-xl bg-card/95 backdrop-blur-2xl border-l border-primary/30 h-full flex flex-col shadow-2xl animate-slide-in-right z-10">
        {/* Header */}
        <div className="p-4.5 border-b border-border/80 flex items-center justify-between bg-card/70 relative overflow-hidden">
          <div className="absolute top-0 right-1/4 w-32 h-32 bg-primary/20 rounded-full blur-2xl pointer-events-none" />

          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10 rounded-2xl bg-gradient-to-br from-primary via-blue-600 to-accent flex items-center justify-center text-white shadow-glow animate-pulse-glow">
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="12" cy="12" r="3" fill="#00D8F6" />
                <path d="M12 1v3M12 20v3M4.22 4.22l2.12 2.12M17.66 17.66l2.12 2.12M1 12h3M20 12h3M4.22 19.78l2.12-2.12M17.66 6.34l2.12-2.12" />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-800 text-foreground tracking-tight">
                  Campus OS AI Intelligence
                </h3>
                <Badge variant={aiStatus.status === 'online' ? 'success' : 'cyan'}>
                  {aiStatus.status === 'online'
                    ? '🟢 AI Online (Free)'
                    : '🔵 Campus Intelligence Mode'}
                </Badge>
              </div>
              <p className="text-[11px] text-muted-foreground">
                {aiStatus.provider} · Viewing:{' '}
                <span className="text-accent">{currentTab.toUpperCase()}</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl hover:bg-muted/80 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors cursor-pointer border border-border/40"
            title="Close Assistant"
          >
            <svg
              width="16"
              height="16"
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

        {/* Dynamic Quick Action Pills */}
        <div className="p-3 border-b border-border/50 bg-muted/25 flex gap-2 overflow-x-auto text-xs no-scrollbar">
          {getQuickActions().map((qa, i) => (
            <button
              key={i}
              onClick={() => sendMessage(qa.query, qa.toolHint)}
              className="whitespace-nowrap px-3.5 py-1.5 rounded-xl glass-card border border-primary/30 text-foreground hover:border-accent hover:text-accent hover:bg-accent/10 transition-all cursor-pointer font-600 text-[11px] shadow-sm flex-shrink-0"
            >
              {qa.label}
            </button>
          ))}
        </div>

        {/* Message Stream */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4 text-xs sm:text-sm leading-relaxed">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} animate-fade-in`}
            >
              <div
                className={`max-w-[90%] p-4 rounded-2xl ${
                  msg.role === 'user'
                    ? 'bg-gradient-to-br from-primary to-blue-600 text-white rounded-tr-none shadow-glow font-500'
                    : 'glass-card border border-border/80 text-foreground rounded-tl-none shadow-glass'
                }`}
              >
                <div className="whitespace-pre-line leading-relaxed">{msg.content}</div>

                {/* Direct Action Trigger Pill */}
                {msg.action?.route && (
                  <div className="mt-3 pt-3 border-t border-border/40 flex items-center justify-between gap-3">
                    <span className="text-[11px] text-muted-foreground">Action Available:</span>
                    <button
                      onClick={() => {
                        if (msg.action?.route) router.push(msg.action.route);
                      }}
                      className="btn-primary text-xs py-1.5 px-3.5 rounded-lg shadow-glow cursor-pointer"
                    >
                      🚀 {msg.action.label || 'Open View'} →
                    </button>
                  </div>
                )}

                {/* Interactive Study Plan Component */}
                {msg.studyPlan && (
                  <div className="mt-4 p-4 rounded-2xl bg-card/85 border border-primary/40 space-y-3 text-xs shadow-glow">
                    <div className="flex items-center justify-between border-b border-border/60 pb-2">
                      <h4 className="font-800 text-foreground text-sm">
                        🗓️ {msg.studyPlan.subject} Revision Plan
                      </h4>
                      <span className="badge-cyan text-[10px] px-2 py-0.5 rounded-md font-700">
                        {msg.studyPlan.totalDays} Days
                      </span>
                    </div>

                    <div className="space-y-2">
                      {msg.studyPlan.schedule.map((day) => (
                        <div key={day.day} className="p-2.5 rounded-xl bg-muted/30 border border-border/60">
                          <div className="flex justify-between items-center mb-1">
                            <span className="font-700 text-primary">Day {day.day}: {day.title}</span>
                            <span className="text-[10px] text-muted-foreground">{day.duration}</span>
                          </div>
                          <p className="text-muted-foreground text-[11px]">{day.topics.join(' · ')}</p>
                        </div>
                      ))}
                    </div>

                    <div className="flex gap-2 pt-2">
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => router.push('/student-dashboard?tab=notes')}
                        className="text-xs"
                      >
                        Open Notes
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => sendMessage(`Generate a 5-question quiz on ${msg.studyPlan?.subject}`)}
                        className="text-xs"
                      >
                        Create Quiz
                      </Button>
                    </div>
                  </div>
                )}

                {/* Interactive Practice Quiz Component */}
                {msg.quiz && (
                  <div className="mt-4 p-4 rounded-2xl bg-card/85 border border-border/80 space-y-2.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="badge-cyan text-[10px] px-2 py-0.5 rounded-md font-700">
                        {msg.quiz.subject || 'Interactive Quiz'}
                      </span>
                    </div>
                    <p className="font-800 text-foreground text-sm leading-snug">
                      {msg.quiz.question}
                    </p>
                    <div className="space-y-2 pt-1">
                      {msg.quiz.options.map((opt, optIdx) => {
                        const isSelected = msg.quiz?.selectedOption === optIdx;
                        const isCorrect = optIdx === msg.quiz?.correctIndex;
                        let btnStyle =
                          'border-border/70 bg-muted/30 hover:border-primary/50 text-foreground';

                        if (msg.quiz?.selectedOption !== undefined) {
                          if (isCorrect)
                            btnStyle = 'border-success bg-success/20 text-success font-700';
                          else if (isSelected)
                            btnStyle = 'border-danger bg-danger/20 text-danger font-700';
                        }

                        return (
                          <button
                            key={opt}
                            disabled={msg.quiz?.selectedOption !== undefined}
                            onClick={() => handleQuizAnswer(msg.id, optIdx)}
                            className={`w-full text-left p-2.5 rounded-xl border transition-all cursor-pointer ${btnStyle}`}
                          >
                            <span className="font-700 mr-1.5">
                              {String.fromCharCode(65 + optIdx)}.
                            </span>{' '}
                            {opt}
                          </button>
                        );
                      })}
                    </div>

                    {msg.quiz.selectedOption !== undefined && (
                      <div className="pt-2.5 mt-2 border-t border-border/50 text-xs">
                        <p className="font-700 text-success mb-1">
                          {msg.quiz.selectedOption === msg.quiz.correctIndex
                            ? '✓ Correct Answer!'
                            : '✗ Incorrect'}
                        </p>
                        <p className="text-muted-foreground leading-relaxed">
                          {msg.quiz.explanation}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
              <span className="text-[10px] text-muted-foreground mt-1 px-1">{msg.timestamp}</span>
            </div>
          ))}

          {/* Active Tool / Thinking Indicator */}
          {isLoading && (
            <div className="flex items-center gap-3 p-3.5 glass-card rounded-2xl border border-accent/40 max-w-[75%] animate-fade-in shadow-glow-accent">
              <div className="flex items-end gap-1 h-5">
                <span className="w-1 bg-accent rounded-full animate-bounce [animation-delay:0.1s] h-3" />
                <span className="w-1 bg-primary rounded-full animate-bounce [animation-delay:0.3s] h-5" />
                <span className="w-1 bg-accent rounded-full animate-bounce [animation-delay:0.2s] h-4" />
                <span className="w-1 bg-primary rounded-full animate-bounce [animation-delay:0.4s] h-2" />
              </div>
              <span className="text-xs font-600 text-foreground">{activeToolStatus}</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-4 border-t border-border/80 bg-card/80">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              placeholder={`Ask naturally: "Open my timetable", "What's my attendance?", "Explain Dijkstra"...`}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="input-field py-2.5 text-xs sm:text-sm"
              disabled={isLoading}
              autoFocus
            />
            <Button
              type="submit"
              variant="primary"
              size="md"
              disabled={!inputText.trim() || isLoading}
              className="px-5 shadow-glow font-700"
            >
              Ask AI
            </Button>
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
