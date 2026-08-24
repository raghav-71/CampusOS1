'use client';

import React, { useState, useRef, useEffect, Suspense } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { useProfile } from '@/hooks/useProfile';
import { Role } from '@/types/campus';
import { AIChatMessage, AIQuizData, AIStudyPlan, AIActionPayload } from '@/lib/ai/aiTypes';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';

interface CampusAIAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
}

function CampusAIAssistantModalInner({ isOpen, onClose }: CampusAIAssistantModalProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentTab = searchParams ? searchParams.get('tab') || 'overview' : 'overview';
  const { profile } = useProfile();

  const userRole: Role = profile?.role || 'student';

  const [messages, setMessages] = useState<AIChatMessage[]>([
    {
      id: 'msg-init',
      role: 'assistant',
      content: `Hello **${profile?.fullName || 'Campus Member'}**! I am the **Campus OS AI Intelligence Layer** ✨\n\nI am deeply integrated into your **${userRole.toUpperCase()}** environment. I can answer academic questions, navigate you across the platform, search lecture notes, check your attendance, generate exam study plans, or create practice quizzes. What can I do for you today?`,
      timestamp: 'Just now',
    },
  ]);

  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeToolStatus, setActiveToolStatus] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading, activeToolStatus]);

  if (!isOpen) return null;

  // Role-specific Quick Actions
  const getQuickActions = () => {
    if (userRole === 'student') {
      return [
        { label: '📅 Open Timetable', query: 'Open my class timetable', toolHint: 'Opening timetable...' },
        { label: '📊 Check Attendance', query: 'What is my attendance rate across subjects?', toolHint: 'Auditing attendance...' },
        { label: '🗓️ 5-Day DAA Study Plan', query: 'Create a 5-day study plan for my DAA exam', toolHint: 'Generating study plan...' },
        { label: '🎯 Practice Quiz (OS)', query: 'Generate a practice quiz question on Operating Systems', toolHint: 'Generating quiz...' },
        { label: '🧠 Explain Dijkstra', query: 'Explain Dijkstra Algorithm with step-by-step intuition', toolHint: 'Analyzing algorithm...' },
        { label: '📚 Find OS Notes', query: 'Find notes on Virtual Memory and Paging', toolHint: 'Searching notes...' },
      ];
    }
    if (userRole === 'teacher') {
      return [
        { label: '👥 My Classes', query: 'Show my teaching classes and enrolled batches', toolHint: 'Loading class rosters...' },
        { label: '⚠️ Low Attendance (<75%)', query: 'Which students in my classes are below 75% attendance?', toolHint: 'Scanning attendance logs...' },
        { label: '📝 Generate Question Paper', query: 'Generate a 100-mark exam paper for Operating Systems', toolHint: 'Generating exam blueprint...' },
        { label: '📋 Open Attendance Register', query: 'Open the attendance register', toolHint: 'Opening attendance...' },
        { label: '📥 Review Submissions', query: 'Show recent assignment submissions for grading', toolHint: 'Loading submissions...' },
      ];
    }
    // Admin
    return [
      { label: '🏛️ Campus Overview', query: 'Give me an institutional overview of campus attendance and departments', toolHint: 'Compiling analytics...' },
      { label: '🚨 Attendance Anomalies', query: 'Which students are at-risk with attendance below 75%?', toolHint: 'Scanning student compliance...' },
      { label: '⚡ Syllabus Velocity Warnings', query: 'Identify subjects with low syllabus coverage', toolHint: 'Analyzing curriculum pacing...' },
      { label: '👤 Open User Management', query: 'Open student directory', toolHint: 'Navigating to directory...' },
      { label: '📄 Security Audit Logs', query: 'Show recent campus activity and login audit logs', toolHint: 'Fetching audit logs...' },
    ];
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
    setActiveToolStatus(toolHint || 'Thinking & querying Campus OS...');

    try {
      const res = await fetch('/api/ai/chat', {
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
        throw new Error(data.error || 'Failed to get response from AI');
      }

      const aiMsg: AIChatMessage = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: data.answer || 'I have processed your request.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        quiz: data.quizData,
        action: data.action,
      };

      setMessages((prev) => [...prev, aiMsg]);

      // If response includes automatic navigation action, execute smoothly
      if (data.action?.type === 'navigate' && data.action.route) {
        toast.success(`Navigating to ${data.action.label || data.action.route}`);
        router.push(data.action.route);
      }
    } catch (err: any) {
      toast.error('AI Assistant Error: ' + err.message);
      setMessages((prev) => [
        ...prev,
        {
          id: `ai-err-${Date.now()}`,
          role: 'assistant',
          content: '⚠️ I encountered a temporary connection issue while querying Campus OS. Please feel free to try again.',
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
        {/* Header with Visualizer */}
        <div className="p-4.5 border-b border-border/80 flex items-center justify-between bg-card/70 relative overflow-hidden">
          {/* Subtle Ambient Light Orb in Header */}
          <div className="absolute top-0 right-1/4 w-32 h-32 bg-primary/20 rounded-full blur-2xl pointer-events-none" />

          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10 rounded-2xl bg-gradient-to-br from-primary via-blue-600 to-accent flex items-center justify-center text-white shadow-glow">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="3" fill="#00D8F6" />
                <path d="M12 1v3M12 20v3M4.22 4.22l2.12 2.12M17.66 17.66l2.12 2.12M1 12h3M20 12h3M4.22 19.78l2.12-2.12M17.66 6.34l2.12-2.12" />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-800 text-foreground tracking-tight">Campus OS AI Intelligence</h3>
                <Badge variant={userRole === 'admin' ? 'warning' : userRole === 'teacher' ? 'cyan' : 'blue'}>
                  {userRole.toUpperCase()} COPILOT
                </Badge>
              </div>
              <p className="text-[11px] text-muted-foreground">Connected to Campus OS Repository & LLM Engine</p>
            </div>
          </div>

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
                      className="btn-primary text-xs py-1.5 px-3.5 rounded-lg shadow-glow"
                    >
                      🚀 {msg.action.label || 'Open View'} →
                    </button>
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
                    <p className="font-800 text-foreground text-sm leading-snug">{msg.quiz.question}</p>
                    <div className="space-y-2 pt-1">
                      {msg.quiz.options.map((opt, optIdx) => {
                        const isSelected = msg.quiz?.selectedOption === optIdx;
                        const isCorrect = optIdx === msg.quiz?.correctIndex;
                        let btnStyle = 'border-border/70 bg-muted/30 hover:border-primary/50 text-foreground';

                        if (msg.quiz?.selectedOption !== undefined) {
                          if (isCorrect) btnStyle = 'border-success bg-success/20 text-success font-700';
                          else if (isSelected) btnStyle = 'border-danger bg-danger/20 text-danger font-700';
                        }

                        return (
                          <button
                            key={opt}
                            disabled={msg.quiz?.selectedOption !== undefined}
                            onClick={() => handleQuizAnswer(msg.id, optIdx)}
                            className={`w-full text-left p-2.5 rounded-xl border transition-all cursor-pointer ${btnStyle}`}
                          >
                            <span className="font-700 mr-1.5">{String.fromCharCode(65 + optIdx)}.</span> {opt}
                          </button>
                        );
                      })}
                    </div>

                    {msg.quiz.selectedOption !== undefined && (
                      <div className="pt-2.5 mt-2 border-t border-border/50 text-xs">
                        <p className="font-700 text-success mb-1">
                          {msg.quiz.selectedOption === msg.quiz.correctIndex ? '✓ Correct Answer!' : '✗ Incorrect'}
                        </p>
                        <p className="text-muted-foreground leading-relaxed">{msg.quiz.explanation}</p>
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
              {/* Voice-like Visualizer Bars */}
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
              placeholder={`Ask Campus OS about timetable, notes, exams, algorithms...`}
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
