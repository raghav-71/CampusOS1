import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
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
      mode,
    } = body;

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'A valid query message string is required.' }, { status: 400 });
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

    const aiResponse = await CampusAgent.handleRequest({
      message,
      userProfile: profile,
      currentPath: currentPath || '/student-dashboard',
      currentTab: currentTab || 'overview',
      sessionId: sessionId || `sess_${profile.id}`,
      selectedEntity: selectedEntity || selectedContext,
      mode,
    });

    return NextResponse.json({
      success: true,
      ...aiResponse,
    });
  } catch (err: any) {
    console.error('CampusAgent Route Error:', err);
    return NextResponse.json(
      {
        success: false,
        error: 'Campus OS AI encountered an error processing your request.',
        details: process.env.NODE_ENV === 'development' ? err.message : undefined,
      },
      { status: 500 }
    );
  }
}
