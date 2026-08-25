import React from 'react';
import { Metadata } from 'next';
import CodeLabWorkspace from '@/components/codelab/CodeLabWorkspace';

export const metadata: Metadata = {
  title: 'Code Lab — Campus OS',
  description:
    'Full-featured online IDE, sandboxed compiler & runner, and AI coding tutor for students in Campus OS.',
};

export default function CodeLabPage() {
  return (
    <main className="w-full h-[100dvh] max-w-full min-w-0 overflow-hidden bg-[#060b18]">
      <CodeLabWorkspace />
    </main>
  );
}
