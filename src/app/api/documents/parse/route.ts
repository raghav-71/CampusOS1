import { NextRequest, NextResponse } from 'next/server';
import { DocumentParserService } from '@/services/documentParserService';

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get('content-type') || '';

    // 1. JSON Payload with dataUrl or base64
    if (contentType.includes('application/json')) {
      const body = await req.json();
      const { dataUrl, fileName } = body;

      if (!dataUrl || !fileName) {
        return NextResponse.json(
          { success: false, error: 'Missing dataUrl or fileName parameter' },
          { status: 400 }
        );
      }

      const result = await DocumentParserService.parseDataUrl(dataUrl, fileName);
      return NextResponse.json(result);
    }

    // 2. FormData Multipart upload
    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      const file = formData.get('file') as File | null;

      if (!file) {
        return NextResponse.json(
          { success: false, error: 'No file provided in form data' },
          { status: 400 }
        );
      }

      const result = await DocumentParserService.parseFile(file);
      return NextResponse.json(result);
    }

    return NextResponse.json(
      { success: false, error: 'Unsupported Content-Type header' },
      { status: 415 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: `Document parsing error: ${err.message}` },
      { status: 500 }
    );
  }
}
