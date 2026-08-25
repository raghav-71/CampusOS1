'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { CodeAIContext } from '@/types/codelab';
import { FacultyAIMode } from '@/types/facultyCodelab';
import MarkdownRenderer from '@/components/ai/MarkdownRenderer';
import AITutorErrorBoundary from '../AITutorErrorBoundary';
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
  BookOpen,
  GraduationCap,
  ListOrdered,
  FileQuestion,
  FileText,
  Clock,
  RefreshCw,
  Award,
  Code2,
} from 'lucide-react';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  title?: string;
  content: string;
  timestamp: number;
}

interface FacultyAIPanelProps {
  codeContext: CodeAIContext;
  facultyMode: FacultyAIMode;
  onModeChange: (mode: FacultyAIMode) => void;
  onOpenAssignmentBuilder: () => void;
  onOpenQuestionBuilder: () => void;
  onOpenEvaluator: () => void;
}

const AI_TIMEOUT_MS = 25000;

export default function FacultyAIPanel(props: FacultyAIPanelProps) {
  return (
    <AITutorErrorBoundary fallbackTitle="Faculty AI Assistant encountered an error">
      <FacultyAIPanelInner {...props} />
    </AITutorErrorBoundary>
  );
}

function FacultyAIPanelInner({
  codeContext,
  facultyMode,
  onModeChange,
  onOpenAssignmentBuilder,
  onOpenQuestionBuilder,
  onOpenEvaluator,
}: FacultyAIPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-faculty-welcome',
      role: 'assistant',
      title: 'Faculty AI Assistant',
      content: `### 🎓 Faculty Coding Assistant Active

Welcome Professor. I can assist you with:
- **Assignment & Question Authoring**: Formulate structured problems with hidden test cases
- **Reference Solution Generation**: Write optimal $O(N)$ solutions in any supported language
- **Oral Viva Questions**: Generate viva questions with answer keys
- **Evaluation & Rubrics**: Analyze student code and design rubric criteria
- **Lab & Exam Session Prep**: 2-hour lab exercises and practical exam papers

*Select an action below or ask any academic/programming question!*`,
      timestamp: Date.now(),
    },
  ]);

  const [inputMessage, setInputMessage] = useState('');
  const [requestState, setRequestState] = useState<'idle' | 'loading' | 'success' | 'error' | 'timeout'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [currentActionTitle, setCurrentActionTitle] = useState('');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const timeoutIdRef = useRef<NodeJS.Timeout | null>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, requestState, scrollToBottom]);

  useEffect(() => {
    return () => {
      if (abortControllerRef.current) abortControllerRef.current.abort();
      if (timeoutIdRef.current) clearTimeout(timeoutIdRef.current);
    };
  }, []);

  const executeFacultyAI = async (actionKey: string, promptText: string, displayTitle?: string) => {
    if (requestState === 'loading') return;

    if (abortControllerRef.current) abortControllerRef.current.abort();
    if (timeoutIdRef.current) clearTimeout(timeoutIdRef.current);

    const controller = new AbortController();
    abortControllerRef.current = controller;

    setRequestState('loading');
    setErrorMessage('');
    setCurrentActionTitle(displayTitle || 'Faculty AI generating...');

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: promptText,
      timestamp: Date.now(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');

    timeoutIdRef.current = setTimeout(() => {
      controller.abort();
      setRequestState('timeout');
      setErrorMessage('AI request timed out after 25s.');
    }, AI_TIMEOUT_MS);

    try {
      const response = await fetch('/api/code/faculty-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: actionKey,
          mode: facultyMode,
          context: codeContext,
          history: messages.slice(-4).map((m) => ({ role: m.role, content: m.content })),
        }),
        signal: controller.signal,
      });

      if (timeoutIdRef.current) clearTimeout(timeoutIdRef.current);

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || `Faculty AI error HTTP ${response.status}`);
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
        throw new Error(data.error || 'Failed to generate response.');
      }
    } catch (err: any) {
      if (err.name === 'AbortError') {
        if (requestState !== 'timeout') {
          setRequestState('error');
          setErrorMessage('Request was cancelled.');
        }
      } else {
        setRequestState('error');
        setErrorMessage(err.message || 'Faculty AI service is temporarily unavailable.');
      }
    } finally {
      abortControllerRef.current = null;
      if (timeoutIdRef.current) clearTimeout(timeoutIdRef.current);
    }
  };

  const facultyActions = [
    {
      key: 'GENERATE_ASSIGNMENT',
      label: 'Generate Assignment',
      icon: <BookOpen className="w-3.5 h-3.5 text-primary" />,
      title: 'Programming Assignment Draft',
      prompt: 'Generate a structured programming assignment based on this code concept.',
      highlight: true,
    },
    {
      key: 'GENERATE_QUESTION',
      label: 'Generate Question',
      icon: <FileQuestion className="w-3.5 h-3.5 text-accent" />,
      title: 'Exam Coding Question',
      prompt: 'Formulate an examination question with input/output constraints and test cases.',
      highlight: true,
    },
    {
      key: 'GENERATE_SOLUTION',
      label: 'Generate Solution',
      icon: <Code2 className="w-3.5 h-3.5 text-emerald-400" />,
      title: 'Optimal Reference Solution',
      prompt: 'Generate a production reference solution with complexity analysis.',
    },
    {
      key: 'GENERATE_TESTS',
      label: 'Generate Test Suite',
      icon: <TestTube className="w-3.5 h-3.5 text-purple-400" />,
      title: 'Visible & Hidden Test Cases',
      prompt: 'Generate visible, hidden edge-case, and stress test suites for this code.',
    },
    {
      key: 'GENERATE_VIVA',
      label: 'Viva Questions',
      icon: <GraduationCap className="w-3.5 h-3.5 text-amber-400" />,
      title: 'Oral Viva Exam Questions',
      prompt: 'Generate 6-8 oral viva questions with faculty answer keys.',
    },
    {
      key: 'CREATE_RUBRIC',
      label: 'Create Rubric',
      icon: <Award className="w-3.5 h-3.5 text-rose-400" />,
      title: 'Evaluation Rubric',
      prompt: 'Create a 20-mark evaluation rubric with deduction guidelines.',
    },
    {
      key: 'GENERATE_LAB_EXERCISE',
      label: 'Lab Exercise (2h)',
      icon: <ListOrdered className="w-3.5 h-3.5 text-cyan-400" />,
      title: '2-Hour Lab Plan',
      prompt: 'Design a 2-hour practical lab session with warmup and challenge tasks.',
    },
    {
      key: 'GENERATE_HINTS',
      label: 'Tiered Hints',
      icon: <Lightbulb className="w-3.5 h-3.5 text-yellow-400" />,
      title: 'Progressive Hints',
      prompt: 'Create 3 tiered Socratic hints for students.',
    },
    {
      key: 'EXPLAIN_CODE',
      label: 'Explain Code',
      icon: <FileCode2 className="w-3.5 h-3.5 text-primary" />,
      title: 'Lecture Code Explanation',
      prompt: 'Provide a comprehensive lecture breakdown of this code.',
    },
    {
      key: 'FIND_BUGS',
      label: 'Audit Code',
      icon: <Bug className="w-3.5 h-3.5 text-rose-400" />,
      title: 'Faculty Code Audit',
      prompt: 'Audit this code for edge-case bugs and security issues.',
    },
  ];

  return (
    <div className="w-full h-full min-w-0 flex flex-col bg-[#070e22]/95 border-l border-border/70 select-none overflow-hidden font-sans">
      {/* Header */}
      <div className="p-3 bg-[#0a142f] border-b border-border/60 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-purple-600 to-accent flex items-center justify-center text-white shadow-glow">
            <GraduationCap className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-800 text-foreground flex items-center gap-1.5">
              <span>Faculty AI</span>
              <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
            </div>
            <div className="text-[10px] text-muted-foreground capitalize">
              {facultyMode} Mode Active
            </div>
          </div>
        </div>

        <select
          value={facultyMode}
          onChange={(e) => onModeChange(e.target.value as FacultyAIMode)}
          className="text-[11px] bg-secondary border border-border rounded-lg px-2 py-1 text-foreground font-semibold cursor-pointer focus:outline-none"
        >
          <option value="developer">Developer</option>
          <option value="teaching">Teaching</option>
          <option value="assessment">Assessment</option>
          <option value="exam">Exam Prep</option>
        </select>
      </div>

      {/* Quick Action Chips */}
      <div className="p-2 border-b border-border/50 bg-[#060b18]/60 overflow-x-auto shrink-0">
        <div className="flex items-center gap-1.5 flex-nowrap min-w-max">
          {facultyActions.map((action) => (
            <button
              key={action.key}
              disabled={requestState === 'loading'}
              onClick={() => executeFacultyAI(action.key, action.prompt, action.title)}
              className={`px-2.5 py-1 rounded-xl text-[11px] font-semibold flex items-center gap-1.5 border transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                action.highlight
                  ? 'bg-purple-500/20 border-purple-500/50 text-purple-300 hover:bg-purple-500/30 shadow-glow'
                  : 'bg-secondary/60 border-border hover:border-primary/40 text-muted-foreground hover:text-foreground'
              }`}
            >
              {action.icon}
              <span>{action.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Messages Area */}
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
                  ? 'bg-purple-600 text-white rounded-br-none shadow-glow font-medium'
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

        {requestState === 'loading' && (
          <div className="p-3 rounded-2xl bg-[#0a142f]/80 border border-purple-500/40 flex items-center gap-3 text-xs text-foreground animate-pulse">
            <div className="w-5 h-5 rounded-full border-2 border-purple-400 border-t-transparent animate-spin shrink-0" />
            <div>
              <div className="font-bold text-purple-300">{currentActionTitle || 'Synthesizing...'}</div>
              <div className="text-[11px] text-muted-foreground">Formulating academic materials...</div>
            </div>
          </div>
        )}

        {(requestState === 'error' || requestState === 'timeout') && (
          <div className="p-3 rounded-2xl bg-danger/10 border border-danger/40 text-xs space-y-2 animate-fade-in">
            <div className="flex items-center gap-1.5 text-danger font-bold">
              <AlertCircle className="w-4 h-4" />
              <span>{requestState === 'timeout' ? 'Request Timed Out' : 'Action Failed'}</span>
            </div>
            <p className="text-rose-200 text-[11px] leading-relaxed">{errorMessage}</p>
            <button
              onClick={() => setRequestState('idle')}
              className="px-3 py-1 bg-danger/20 text-rose-200 border border-danger/40 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Dismiss</span>
            </button>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-3 bg-[#0a142f] border-t border-border/70 shrink-0">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!inputMessage.trim() || requestState === 'loading') return;
            executeFacultyAI('FREE_CHAT', inputMessage.trim(), 'Faculty AI Assistant');
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Ask Faculty AI (e.g. 'Create 5 Viva questions on DFS')"
            disabled={requestState === 'loading'}
            className="flex-1 bg-[#060b18] text-xs text-foreground px-3.5 py-2.5 rounded-xl border border-border focus:outline-none focus:border-purple-500 placeholder:text-muted-foreground/50 transition-all font-sans disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={requestState === 'loading' || !inputMessage.trim()}
            className="p-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-accent text-white shadow-glow hover:shadow-glow-cyan disabled:opacity-40 transition-all cursor-pointer shrink-0"
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
