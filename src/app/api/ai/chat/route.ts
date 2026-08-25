import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { CampusEngine } from '@/lib/ai/agent/campusEngine';
import { CampusAgent } from '@/lib/ai/agent/campusAgent';
import { UserProfile } from '@/types/campus';

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
      history,
      stream = true,
    } = body;

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Valid message string is required.' }, { status: 400 });
    }

    const profile: UserProfile = userProfile || {
      id: 'usr-001',
      name: 'Arjun Sharma',
      fullName: 'Arjun Sharma',
      email: 'arjun.sharma@campusos.edu',
      role: 'student',
      department: 'BCA',
      semester: 'Sem 5',
      rollNumber: 'BCA2401',
      initials: 'AS',
      subjects: ['Operating Systems', 'DBMS', 'Computer Networks', 'Java Programming', 'DAA'],
    };

    const context = {
      userId: profile.id || 'usr-001',
      userName: profile.fullName || profile.name || 'Student',
      userRole: profile.role || 'student',
      department: profile.department || 'BCA',
      semester: profile.semester ? Number(profile.semester.replace(/[^0-9]/g, '')) || 5 : 5,
      currentPath: currentPath || '/student-dashboard',
      currentTab: currentTab || 'overview',
      selectedEntity: selectedEntity || selectedContext,
    };

    const chatHistory = Array.isArray(history) ? history : [];

    // If non-streaming requested
    if (stream === false) {
      const response = await CampusEngine.process(message, context, chatHistory);
      return NextResponse.json({ success: true, ...response });
    }

    // Streaming SSE Response
    const encoder = new TextEncoder();
    const customReadable = new ReadableStream({
      async start(controller) {
        try {
          await CampusEngine.processStream(
            message,
            context,
            chatHistory,
            (event) => {
              controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
            },
            request.signal
          );
          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          controller.close();
        } catch (err: any) {
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ type: 'error', content: err?.message || 'Streaming error' })}\n\n`
            )
          );
          controller.close();
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
