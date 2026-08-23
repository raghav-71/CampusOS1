import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { campusRepository } from '@/repositories/campusRepository';
import { Role, UserProfile } from '@/types/campus';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const role = (searchParams.get('role') as Role) || undefined;
    const department = searchParams.get('department') || undefined;

    const users = await campusRepository.getUsers(role, department);
    return NextResponse.json({ users, total: users.length });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (!body.email || !body.role) {
      return NextResponse.json({ error: 'Email and role are required' }, { status: 400 });
    }

    const newUser: UserProfile = {
      id: body.id || `usr-${Date.now()}`,
      email: body.email,
      fullName: body.fullName || body.name || body.email.split('@')[0],
      role: body.role,
      initials: body.fullName
        ? body.fullName
            .split(' ')
            .map((s: string) => s[0])
            .join('')
            .slice(0, 2)
            .toUpperCase()
        : 'US',
      department: body.department || 'BCA',
      semester: body.semester || 'Sem 1',
      rollNumber: body.rollNumber,
      status: body.status || 'active',
      joinedAt: 'Aug 2026',
    };

    const saved = await campusRepository.saveUser(newUser);
    return NextResponse.json({ user: saved, success: true }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const removed = await campusRepository.deleteUser(id);
    return NextResponse.json({ success: removed });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
