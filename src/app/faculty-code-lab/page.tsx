import React from 'react';
import { Metadata } from 'next';
import FacultyCodeLabWorkspace from '@/components/codelab/faculty/FacultyCodeLabWorkspace';

export const metadata: Metadata = {
  title: 'Faculty Code Lab — Campus OS',
  description:
    'Faculty programming workspace for assignment creation, test generation, reference solutions, and student submission evaluation in Campus OS.',
};

export default function FacultyCodeLabPage() {
  return (
    <main className="w-full h-[100dvh] max-w-full min-w-0 overflow-hidden bg-[#060b18]">
      <FacultyCodeLabWorkspace />
    </main>
  );
}
