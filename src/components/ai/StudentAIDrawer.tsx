'use client';

import React, { useState, useRef, useEffect } from 'react';
import { toast } from 'sonner';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';

interface StudentAIDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  quiz?: {
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
    selectedOption?: number;
  };
}

const initialMessages: ChatMessage[] = [
  {
    id: 'msg-1',
    sender: 'ai',
    text: `Hello Arjun! I'm your **CampusOS AI Study Assistant** ✨\n\nI can help you understand tough CS concepts, debug algorithms, or generate quick practice quizzes for your upcoming exams. How can I help you today?`,
    timestamp: 'Just now',
  },
];

export default function StudentAIDrawer({ isOpen, onClose }: StudentAIDrawerProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!isOpen) return null;

  const sendMessage = async (textToSend?: string, mode?: string) => {
    const query = textToSend || inputText;
    if (!query.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: 'Just now',
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: query, mode, subject: 'Operating Systems' }),
      });
      const data = await res.json();

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: data.answer || 'I am processing your query.',
        timestamp: 'Just now',
        quiz: data.quizData,
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err: any) {
      toast.error('AI response error: ' + err.message);
    } finally {
      setIsLoading(false);
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
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={onClose} />

      {/* Slide-over Drawer */}
      <div className="relative w-full max-w-lg bg-card/95 backdrop-blur-xl border-l border-primary/30 h-full flex flex-col shadow-2xl animate-slide-in-right z-10">
        {/* Header */}
        <div className="p-4 border-b border-border/80 flex items-center justify-between bg-card/50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white shadow-glow">
              ✨
            </div>
            <div>
              <h3 className="text-sm font-700 text-foreground">AI Study Assistant & Tutor</h3>
              <p className="text-[11px] text-muted-foreground">Trained on Semester 5 CS Curriculum</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            title="Close Assistant"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Quick Prompt Pills */}
        <div className="p-3 border-b border-border/50 bg-muted/20 flex gap-2 overflow-x-auto text-xs no-scrollbar">
          <button
            onClick={() => sendMessage('Explain Virtual Memory and Paging in Operating Systems', 'explanation')}
            className="whitespace-nowrap px-3 py-1 rounded-lg glass-card border border-primary/30 text-primary hover:bg-primary/10 transition-colors cursor-pointer font-500"
          >
            🧠 Explain Virtual Memory
          </button>
          <button
            onClick={() => sendMessage('Generate a quick 1-question quiz on Operating Systems', 'quiz')}
            className="whitespace-nowrap px-3 py-1 rounded-lg glass-card border border-accent/30 text-accent hover:bg-accent/10 transition-colors cursor-pointer font-500"
          >
            📝 Practice Quiz
          </button>
          <button
            onClick={() => sendMessage('Debug this C code for array reversal and calculate complexity', 'code')}
            className="whitespace-nowrap px-3 py-1 rounded-lg glass-card border border-success/30 text-success hover:bg-success/10 transition-colors cursor-pointer font-500"
          >
            💻 Debug Code
          </button>
        </div>

        {/* Message Stream */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4 text-xs sm:text-sm">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'} animate-fade-in`}
            >
              <div
                className={`max-w-[88%] p-4 rounded-2xl leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-primary text-white rounded-tr-none shadow-glow font-500'
                    : 'glass-card border border-border/80 text-foreground rounded-tl-none shadow-sm'
                }`}
              >
                <div className="whitespace-pre-line">{msg.text}</div>

                {/* Interactive Quiz Component inside AI message */}
                {msg.quiz && (
                  <div className="mt-4 p-3.5 rounded-xl bg-card/80 border border-border/60 space-y-2 text-xs">
                    <p className="font-700 text-foreground mb-2">{msg.quiz.question}</p>
                    <div className="space-y-1.5">
                      {msg.quiz.options.map((opt, optIdx) => {
                        const isSelected = msg.quiz?.selectedOption === optIdx;
                        const isCorrect = optIdx === msg.quiz?.correctIndex;
                        let btnStyle = 'border-border/60 bg-muted/20 hover:border-primary/40';

                        if (msg.quiz?.selectedOption !== undefined) {
                          if (isCorrect) btnStyle = 'border-success bg-success/20 text-success font-700';
                          else if (isSelected) btnStyle = 'border-danger bg-danger/20 text-danger font-700';
                        }

                        return (
                          <button
                            key={opt}
                            disabled={msg.quiz?.selectedOption !== undefined}
                            onClick={() => handleQuizAnswer(msg.id, optIdx)}
                            className={`w-full text-left p-2 rounded-lg border transition-all cursor-pointer ${btnStyle}`}
                          >
                            {String.fromCharCode(65 + optIdx)}. {opt}
                          </button>
                        );
                      })}
                    </div>

                    {msg.quiz.selectedOption !== undefined && (
                      <div className="pt-2 mt-2 border-t border-border/40 text-[11px]">
                        <p className="font-600 text-success mb-0.5">
                          {msg.quiz.selectedOption === msg.quiz.correctIndex ? '✓ Correct Answer!' : '✗ Incorrect'}
                        </p>
                        <p className="text-muted-foreground">{msg.quiz.explanation}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
              <span className="text-[10px] text-muted-foreground mt-1 px-1">{msg.timestamp}</span>
            </div>
          ))}

          {isLoading && (
            <div className="flex items-center gap-2 p-3 glass-card rounded-2xl border border-border max-w-[50%] animate-pulse">
              <span className="w-2 h-2 rounded-full bg-primary animate-bounce" />
              <span className="w-2 h-2 rounded-full bg-accent animate-bounce [animation-delay:0.2s]" />
              <span className="w-2 h-2 rounded-full bg-success animate-bounce [animation-delay:0.4s]" />
              <span className="text-xs text-muted-foreground ml-1">Analyzing curriculum...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-4 border-t border-border/80 bg-card/60">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              placeholder="Ask anything about OS, DBMS, Algorithms..."
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
              className="px-4"
            >
              Send
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
