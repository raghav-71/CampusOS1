/**
 * Campus OS — Code Execution API Route
 * POST /api/code/execute
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { CodeExecutionService } from '@/lib/codelab/executionService';
import { CodeExecutionRequest } from '@/types/codelab';

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as CodeExecutionRequest;

    if (!body || !body.language) {
      return NextResponse.json(
        { error: 'Language specification is required.' },
        { status: 400 }
      );
    }

    const sourceCode = typeof body.sourceCode === 'string' ? body.sourceCode : typeof (body as any).code === 'string' ? (body as any).code : null;

    if (sourceCode === null) {
      return NextResponse.json(
        { error: 'sourceCode string is required.' },
        { status: 400 }
      );
    }

    const result = await CodeExecutionService.executeCode({
      language: body.language,
      sourceCode: sourceCode,
      stdin: body.stdin,
      timeoutMs: body.timeoutMs || 10000,
      memoryLimitMb: body.memoryLimitMb || 128,
      fileName: body.fileName,
      files: body.files,
    });

    return NextResponse.json({
      success: true,
      result,
    });
  } catch (err: any) {
    console.error('Code Execution Route Error:', err);
    return NextResponse.json(
      {
        success: false,
        error: 'Execution failed due to internal server error',
        details: process.env.NODE_ENV === 'development' ? err.message : undefined,
      },
      { status: 500 }
    );
  }
}
