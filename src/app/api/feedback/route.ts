/**
 * Campus OS — Anonymous Feedback API Route
 * POST /api/feedback (Submit Anonymous Feedback)
 * GET /api/feedback (Admin View — STRICT ANONYMITY)
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { campusRepository } from '@/repositories/campusRepository';
import { FeedbackCategory } from '@/types/campus';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = (searchParams.get('category') as FeedbackCategory) || undefined;

    const feedbacks = await campusRepository.getFeedback(category);

    // STRICT PRIVACY GUARANTEE: Never include any identity markers
    const sanitizedFeedbacks = feedbacks.map((f) => ({
      id: f.id,
      category: f.category,
      rating: f.rating,
      message: f.message,
      submittedRole: f.submittedRole,
      submittedAt: f.submittedAt,
      status: f.status,
    }));

    return NextResponse.json({
      success: true,
      feedbacks: sanitizedFeedbacks,
      total: sanitizedFeedbacks.length,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || 'Failed to fetch feedback' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, category = 'Other', rating = 5, role = 'student' } = body;

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Feedback message is required.' },
        { status: 400 }
      );
    }

    // Save anonymously - No user profile metadata attached
    const created = await campusRepository.submitFeedback({
      category: category as FeedbackCategory,
      rating: Math.max(1, Math.min(5, Number(rating) || 5)),
      message: message.trim(),
      submittedRole: role === 'teacher' ? 'teacher' : 'student',
    });

    return NextResponse.json({
      success: true,
      feedback: created,
      message: 'Your anonymous feedback has been recorded safely.',
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || 'Failed to submit feedback' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, status } = body;

    if (!id || !['pending', 'reviewed', 'addressed'].includes(status)) {
      return NextResponse.json(
        { success: false, error: 'Valid feedback ID and status are required.' },
        { status: 400 }
      );
    }

    const updated = await campusRepository.updateFeedbackStatus(id, status);
    return NextResponse.json({ success: updated });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || 'Failed to update feedback status' },
      { status: 500 }
    );
  }
}
