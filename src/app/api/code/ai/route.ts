/**
 * Campus OS — Code AI Tutor & Assistant API Route
 * POST /api/code/ai
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { CodeAIEngine } from '@/lib/codelab/ai/codeAIEngine';
import { CodeAIContext } from '@/types/codelab';
import { AIActionType } from '@/lib/codelab/ai/codePrompts';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    let {
      mode = 'action', // 'action' | 'fix' | 'chat' | 'explain' | 'optimize'
      action = 'EXPLAIN_CODE',
      message,
      context,
      history = [],
    } = body;

    if (mode === 'explain') {
      mode = 'action';
      action = 'EXPLAIN_CODE';
    } else if (mode === 'optimize') {
      mode = 'action';
      action = 'OPTIMIZE_CODE';
    }

    const codeContext: CodeAIContext = context || {
      language: body.language || 'python',
      fileName: body.fileName || (body.language === 'javascript' ? 'index.js' : 'main.py'),
      sourceCode: body.sourceCode || body.code || '',
      aiMode: 'tutor',
    };

    // 1. One-click Fix Generation
    if (mode === 'fix') {
      const patch = await CodeAIEngine.generateFixPatch(codeContext, request.signal);
      return NextResponse.json({ success: true, patch });
    }

    // 2. Controlled Action Execution
    if (mode === 'action') {
      const actionType = (action || 'EXPLAIN_CODE').toUpperCase() as AIActionType;
      const result = await CodeAIEngine.executeQuickAction(actionType, codeContext, request.signal);
      return NextResponse.json({ success: true, ...result });
    }

    // 3. Interactive Conversational Chat
    if (mode === 'chat') {
      const result = await CodeAIEngine.chat(
        message || 'Help me analyze this code',
        codeContext,
        history,
        request.signal
      );
      return NextResponse.json({
        success: true,
        title: 'AI Response',
        response: result.response,
        modelUsed: result.modelUsed,
        provider: result.provider,
      });
    }

    return NextResponse.json({ success: false, error: 'Invalid mode specified' }, { status: 400 });
  } catch (err: any) {
    if (err.name === 'AbortError') {
      return NextResponse.json({ success: false, error: 'Request was cancelled' }, { status: 499 });
    }

    console.error('[Code AI Route] Error:', err);
    return NextResponse.json(
      {
        success: false,
        error: err?.message || 'AI service is temporarily unavailable. Please try again.',
      },
      { status: 500 }
    );
  }
}
