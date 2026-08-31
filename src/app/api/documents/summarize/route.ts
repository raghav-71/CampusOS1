import { NextRequest, NextResponse } from 'next/server';
import { DocumentChunker } from '@/lib/ai/documents/DocumentChunker';
import { DocumentParserService } from '@/services/documentParserService';
import { AIService } from '@/lib/ai/AIService';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, subject, fileName, dataUrl, userProfile } = body;
    let extractedText = body.extractedText || '';

    // If text was not pre-extracted, parse from dataUrl
    if (!extractedText && dataUrl && fileName) {
      const parsed = await DocumentParserService.parseDataUrl(dataUrl, fileName);
      if (parsed.success && parsed.extractedText) {
        extractedText = parsed.extractedText;
      }
    }

    const docTitle = title || fileName || 'Course Document';

    // If still no extracted text, generate high-level syllabus summary
    if (!extractedText || extractedText.length < 20) {
      const fallbackSummary = DocumentChunker.generateAcademicSummary(
        docTitle,
        `Academic lecture and coursework resource for ${docTitle}.\nSubject: ${subject || 'BCA Curriculum'}`,
        subject
      );
      return NextResponse.json({
        success: true,
        title: docTitle,
        summary: fallbackSummary,
      });
    }

    // Call AIService with authentic document context
    try {
      const aiResponse = await AIService.handleRequest({
        message: `Provide a comprehensive academic revision summary of this document: "${docTitle}". Include Executive Summary, Key Concepts, Important Topics & Experiments, Important Definitions, Important Programs / Code (if applicable), Exam-Relevant Points, and Quick Revision Checklist.`,
        userProfile: userProfile || undefined,
        stream: false,
        selectedEntity: {
          id: `doc-${Date.now()}`,
          title: docTitle,
          subject: subject || 'Computer Applications',
          extractedText: extractedText.slice(0, 15000),
        },
      });

      if (aiResponse && aiResponse.answer && aiResponse.answer.length > 80) {
        return NextResponse.json({
          success: true,
          title: docTitle,
          summary: aiResponse.answer,
          modelUsed: aiResponse.modelUsed,
          provider: aiResponse.provider,
        });
      }
    } catch {
      // Fall through to deterministic structured academic summary
    }

    const structuredSummary = DocumentChunker.generateAcademicSummary(docTitle, extractedText, subject);
    return NextResponse.json({
      success: true,
      title: docTitle,
      summary: structuredSummary,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: `Summarization error: ${err.message}` },
      { status: 500 }
    );
  }
}
