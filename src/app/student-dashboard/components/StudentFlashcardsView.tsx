'use client';

import React, { useState } from 'react';
import { toast } from 'sonner';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';

interface Flashcard {
  id: string;
  subject: string;
  subjectCode: string;
  question: string;
  answer: string;
  hint?: string;
  tag: string;
}

const flashcardDecks: Record<string, Flashcard[]> = {
  all: [
    {
      id: 'fc-1',
      subject: 'Operating Systems',
      subjectCode: 'CS501',
      question: 'What is the primary difference between Paging and Segmentation?',
      answer: 'Paging divides memory into fixed-size blocks called frames/pages (invisible to programmer, prevents external fragmentation). Segmentation divides memory into variable-sized logical segments (visible to programmer, matches program modules).',
      hint: 'Think fixed-size physical vs variable-size logical units.',
      tag: 'Memory Management',
    },
    {
      id: 'fc-2',
      subject: 'Operating Systems',
      subjectCode: 'CS501',
      question: 'What are the four Coffman conditions necessary for a Deadlock to occur?',
      answer: '1. Mutual Exclusion\n2. Hold and Wait\n3. No Preemption\n4. Circular Wait\nAll four conditions must hold simultaneously.',
      hint: 'ME, HW, NP, CW',
      tag: 'Process Synchronization',
    },
    {
      id: 'fc-3',
      subject: 'Database Systems',
      subjectCode: 'CS502',
      question: 'What are the ACID properties in DBMS transactions?',
      answer: '• Atomicity: All or nothing execution.\n• Consistency: Database remains in valid state.\n• Isolation: Concurrent transactions do not interfere.\n• Durability: Committed changes survive system failures.',
      hint: 'Essential for relational transaction guarantees.',
      tag: 'Transactions & Recovery',
    },
    {
      id: 'fc-4',
      subject: 'Database Systems',
      subjectCode: 'CS502',
      question: 'What constitutes BCNF (Boyce-Codd Normal Form)?',
      answer: 'A relation is in BCNF if for every non-trivial functional dependency X → Y, X is a Super Key. It is a stricter version of 3NF eliminating all transitive anomalies.',
      hint: 'Left-hand side must always be a candidate/super key.',
      tag: 'Normalization',
    },
    {
      id: 'fc-5',
      subject: 'Computer Networks',
      subjectCode: 'CS503',
      question: 'Explain the 3-Way Handshake process in TCP connection establishment.',
      answer: '1. Client sends SYN (seq = x)\n2. Server responds with SYN-ACK (seq = y, ack = x+1)\n3. Client sends ACK (ack = y+1)\nConnection is now ESTABLISHED.',
      hint: 'SYN -> SYN-ACK -> ACK',
      tag: 'Transport Layer',
    },
    {
      id: 'fc-6',
      subject: 'Design & Analysis of Algorithms',
      subjectCode: 'CS504',
      question: 'What is the time complexity of Dijkstra’s Algorithm using a Min-Heap (Priority Queue)?',
      answer: 'O((V + E) log V), where V is the number of vertices and E is the number of edges. With Fibonacci Heap, it reduces to O(E + V log V).',
      hint: 'Heap extraction takes log V per vertex and edge decrease-key.',
      tag: 'Graph Algorithms',
    },
  ],
};

export default function StudentFlashcardsView() {
  const [selectedDeck, setSelectedDeck] = useState<string>('all');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [masteredCount, setMasteredCount] = useState(0);
  const [reviewCount, setReviewCount] = useState(0);

  const cards = flashcardDecks.all.filter((c) =>
    selectedDeck === 'all' ? true : c.subject.toLowerCase().includes(selectedDeck.toLowerCase())
  );

  const currentCard = cards[currentIndex] || cards[0];

  const handleNext = (mastery: 'hard' | 'good' | 'easy') => {
    if (mastery === 'easy' || mastery === 'good') {
      setMasteredCount((prev) => prev + 1);
      toast.success(mastery === 'easy' ? 'Marked as Easy (+1 Mastered)' : 'Marked as Good');
    } else {
      setReviewCount((prev) => prev + 1);
      toast.warning('Marked for Review');
    }

    setIsFlipped(false);
    setShowHint(false);
    setCurrentIndex((prev) => (prev + 1) % cards.length);
  };

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleReset = () => {
    setCurrentIndex(0);
    setIsFlipped(false);
    setShowHint(false);
    setMasteredCount(0);
    setReviewCount(0);
    toast.info('Flashcard session reset');
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-fade-in">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-700 text-foreground">Interactive Flashcard Revision</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Spaced repetition flashcards with interactive 3D flip
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedDeck}
            onChange={(e) => {
              setSelectedDeck(e.target.value);
              setCurrentIndex(0);
              setIsFlipped(false);
            }}
            className="bg-muted/50 border border-border rounded-xl px-3 py-2 text-xs text-foreground outline-none cursor-pointer"
          >
            <option value="all">All Subjects ({flashcardDecks.all.length} Cards)</option>
            <option value="Operating Systems">Operating Systems</option>
            <option value="Database">Database Systems (DBMS)</option>
            <option value="Computer Networks">Computer Networks</option>
            <option value="Algorithms">Algorithms (DAA)</option>
          </select>

          <button onClick={handleReset} className="btn-ghost text-xs px-3 py-2 cursor-pointer">
            Reset
          </button>
        </div>
      </div>

      {/* Progress & Stats Bar */}
      <div className="glass-card rounded-2xl p-4 border border-border grid grid-cols-3 gap-4 text-center">
        <div>
          <p className="text-xs text-muted-foreground">Card</p>
          <p className="text-base font-700 text-foreground metric-value">
            {currentIndex + 1} <span className="text-xs font-normal text-muted-foreground">/ {cards.length}</span>
          </p>
        </div>
        <div className="border-x border-border/60">
          <p className="text-xs text-muted-foreground">Mastered</p>
          <p className="text-base font-700 text-success metric-value">{masteredCount}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Needs Review</p>
          <p className="text-base font-700 text-warning metric-value">{reviewCount}</p>
        </div>
      </div>

      {/* Flashcard 3D Stage */}
      {currentCard && (
        <div className="perspective-1000 w-full min-h-[320px] sm:min-h-[360px] cursor-pointer" onClick={handleFlip}>
          <div
            className={`w-full h-full min-h-[320px] sm:min-h-[360px] relative transition-transform duration-500 transform-style-3d rounded-3xl p-8 border flex flex-col justify-between ${
              isFlipped
                ? 'bg-gradient-to-br from-card/95 via-primary/5 to-accent/5 border-accent/40 shadow-glow'
                : 'glass-card border-border hover:border-primary/40 shadow-lg'
            }`}
          >
            {/* Top metadata */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Badge variant="cyan">{currentCard.subjectCode}</Badge>
                <span className="text-xs text-muted-foreground font-500">{currentCard.subject}</span>
              </div>
              <span className="badge-violet text-[10px] px-2 py-0.5 rounded-full font-600">
                {currentCard.tag}
              </span>
            </div>

            {/* Middle Question / Answer Body */}
            <div className="my-auto py-6">
              {!isFlipped ? (
                <div>
                  <span className="text-[11px] font-700 uppercase tracking-widest text-primary mb-2 block">
                    Question · Click card to flip
                  </span>
                  <h3 className="text-lg sm:text-xl font-700 text-foreground leading-snug">
                    {currentCard.question}
                  </h3>
                </div>
              ) : (
                <div className="animate-fade-in">
                  <span className="text-[11px] font-700 uppercase tracking-widest text-accent mb-2 block">
                    Answer Explanation
                  </span>
                  <p className="text-sm sm:text-base text-foreground/95 leading-relaxed whitespace-pre-line font-400">
                    {currentCard.answer}
                  </p>
                </div>
              )}
            </div>

            {/* Bottom Actions inside card */}
            <div className="flex items-center justify-between pt-4 border-t border-border/40 text-xs text-muted-foreground">
              <span>{isFlipped ? 'Answer revealed' : 'Tap anywhere to reveal answer'}</span>
              {currentCard.hint && !isFlipped && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowHint(!showHint);
                  }}
                  className="text-primary hover:underline font-500 cursor-pointer"
                >
                  {showHint ? `Hint: ${currentCard.hint}` : '💡 Show Hint'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Spaced Repetition Response Controls */}
      <div className="flex items-center justify-center gap-3 pt-2">
        <button
          onClick={() => handleNext('hard')}
          className="btn-danger text-xs sm:text-sm px-5 py-2.5 flex items-center gap-2 cursor-pointer"
        >
          <span>❌</span>
          <span>Hard (Review)</span>
        </button>

        <button
          onClick={() => handleNext('good')}
          className="btn-secondary text-xs sm:text-sm px-5 py-2.5 flex items-center gap-2 cursor-pointer"
        >
          <span>👍</span>
          <span>Good</span>
        </button>

        <button
          onClick={() => handleNext('easy')}
          className="bg-gradient-to-r from-success to-emerald-400 text-black font-700 text-xs sm:text-sm px-5 py-2.5 rounded-xl hover:shadow-glow transition-all cursor-pointer flex items-center gap-2"
        >
          <span>⚡</span>
          <span>Easy (Mastered)</span>
        </button>
      </div>
    </div>
  );
}
