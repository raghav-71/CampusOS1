/**
 * Campus OS — Faculty Code Lab AI API Route
 * POST /api/code/faculty-ai
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { FacultyAIEngine } from '@/lib/codelab/ai/facultyAIEngine';
import { CodeAIContext } from '@/types/codelab';
import { FacultyAIMode } from '@/types/facultyCodelab';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      action = 'EXPLAIN_CODE',
      mode = 'developer',
      context,
      params,
      history = [],
      message,
    } = body;

    const codeContext: CodeAIContext = context || {
      language: 'python',
      fileName: 'main.py',
      sourceCode: '',
      aiMode: 'tutor',
    };

    const actionToExecute = action === 'FREE_CHAT' && message ? 'FREE_CHAT' : action;

    const result = await FacultyAIEngine.executeAction({
      action: actionToExecute,
      context: codeContext,
      mode: mode as FacultyAIMode,
      params,
      history,
      signal: request.signal,
    });

    return NextResponse.json({
      success: true,
      title: result.title,
      response: result.response,
      modelUsed: result.modelUsed,
      provider: result.provider,
    });
  } catch (err: any) {
    if (err.name === 'AbortError') {
      return NextResponse.json({ success: false, error: 'Request was cancelled' }, { status: 499 });
    }

    console.error('[Faculty Code AI Route] Error:', err);
    return NextResponse.json(
      {
        success: false,
        error: err?.message || 'Faculty AI service is temporarily unavailable. Please try again.',
      },
      { status: 500 }
    );
  }
}
