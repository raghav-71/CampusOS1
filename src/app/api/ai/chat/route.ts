import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { AIService } from '@/lib/ai/AIService';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      message,
      userProfile,
      currentPath,
      currentTab,
      sessionId,
      selectedEntity,
      selectedContext,
      codeLabContext,
      history,
      stream = true,
    } = body;

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Valid message string is required.' }, { status: 400 });
    }

    const aiRequest = {
      message,
      userProfile,
      currentPath,
      currentTab,
      selectedEntity: selectedEntity || selectedContext,
      codeLabContext,
      history: Array.isArray(history) ? history : [],
      stream,
    };

    // If non-streaming requested
    if (stream === false) {
      const response = await AIService.handleRequest(aiRequest);
      return NextResponse.json({ success: true, ...response });
    }

    // Streaming SSE Response
    const encoder = new TextEncoder();
    const customReadable = new ReadableStream({
      async start(controller) {
        let isClosed = false;

        const safeEnqueue = (data: string) => {
          if (isClosed || request.signal.aborted) return;
          try {
            controller.enqueue(encoder.encode(data));
          } catch {
            isClosed = true;
          }
        };

        const safeClose = () => {
          if (isClosed) return;
          isClosed = true;
          try {
            controller.close();
          } catch {
            // Already closed
          }
        };

        try {
          await AIService.handleStreamRequest(
            aiRequest,
            (event) => {
              safeEnqueue(`data: ${JSON.stringify(event)}\n\n`);
            },
            request.signal
          );
          safeEnqueue('data: [DONE]\n\n');
        } catch (err: any) {
          console.error('[AI Chat Stream Error]', {
            name: err?.name,
            message: err?.message,
          });
          safeEnqueue(
            `data: ${JSON.stringify({ type: 'error', content: 'Sorry, the response was interrupted. Please try again.' })}\n\n`
          );
          safeEnqueue('data: [DONE]\n\n');
        } finally {
          safeClose();
        }
      },
    });

    return new Response(customReadable, {
      headers: {
        'Content-Type': 'text/event-stream; charset=utf-8',
        'Cache-Control': 'no-cache, no-transform',
        'Connection': 'keep-alive',
      },
    });
  } catch (err: any) {
    console.error('AI Chat Route Error:', err);
    return NextResponse.json(
      {
        success: false,
        error: 'AI service encountered an error processing your request.',
        details: process.env.NODE_ENV === 'development' ? err.message : undefined,
      },
      { status: 500 }
    );
  }
}
