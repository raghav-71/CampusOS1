/**
 * Campus OS Document Parser Service
 * Asynchronously extracts readable text, structured data, and context summaries
 * from PDF, DOCX, TXT, CSV, JSON, Code files, and Images.
 */

export interface ParsedDocumentResult {
  fileName: string;
  fileType: 'pdf' | 'docx' | 'txt' | 'csv' | 'json' | 'code' | 'image' | 'unknown';
  fileSize: number;
  extractedText: string;
  summary: string;
  charCount: number;
  lineCount: number;
  previewUrl?: string;
  success: boolean;
  error?: string;
}

export class DocumentParserService {
  private static MAX_EXTRACT_CHARS = 12000;

  /**
   * Main parsing entry point that handles different file types safely.
   */
  static async parseFile(file: File): Promise<ParsedDocumentResult> {
    const ext = file.name.split('.').pop()?.toLowerCase() || '';
    const size = file.size;
    const name = file.name;

    try {
      // 1. Plain Text, Markdown, JSON, Code files
      if (['txt', 'md', 'json', 'py', 'java', 'c', 'cpp', 'js', 'ts', 'tsx', 'html', 'css', 'sql'].includes(ext)) {
        const text = await file.text();
        const trimmed = text.slice(0, this.MAX_EXTRACT_CHARS);
        const lines = trimmed.split('\n');

        return {
          fileName: name,
          fileType: ext === 'json' ? 'json' : ['py', 'java', 'c', 'cpp', 'js', 'ts', 'sql'].includes(ext) ? 'code' : 'txt',
          fileSize: size,
          extractedText: trimmed,
          summary: `Document "${name}" contains ${lines.length} lines of text (${(size / 1024).toFixed(1)} KB).`,
          charCount: trimmed.length,
          lineCount: lines.length,
          success: true,
        };
      }

      // 2. CSV files -> Convert to structured Markdown preview
      if (ext === 'csv') {
        const text = await file.text();
        const lines = text.split('\n').filter((l) => l.trim().length > 0);
        const previewRows = lines.slice(0, 30);
        const markdownTable = previewRows.map((r) => `| ${r.split(',').join(' | ')} |`).join('\n');

        return {
          fileName: name,
          fileType: 'csv',
          fileSize: size,
          extractedText: `CSV Data (${lines.length} total rows):\n\n${markdownTable}`,
          summary: `Structured spreadsheet "${name}" with ${lines.length} rows.`,
          charCount: markdownTable.length,
          lineCount: lines.length,
          success: true,
        };
      }

      // 3. PDF files -> Text stream extraction
      if (ext === 'pdf') {
        const arrayBuffer = await file.arrayBuffer();
        const text = this.extractTextFromPdfBytes(new Uint8Array(arrayBuffer));
        const trimmed = (text || `[PDF Document: ${name} (${(size / 1024).toFixed(1)} KB)]`).slice(0, this.MAX_EXTRACT_CHARS);

        return {
          fileName: name,
          fileType: 'pdf',
          fileSize: size,
          extractedText: trimmed,
          summary: `PDF document "${name}" (${(size / 1024).toFixed(1)} KB).`,
          charCount: trimmed.length,
          lineCount: trimmed.split('\n').length,
          success: true,
        };
      }

      // 4. DOCX files -> Extract readable XML text tokens
      if (ext === 'docx' || ext === 'doc') {
        const arrayBuffer = await file.arrayBuffer();
        const text = this.extractTextFromDocxBytes(new Uint8Array(arrayBuffer));
        const trimmed = (text || `[Word Document: ${name} (${(size / 1024).toFixed(1)} KB)]`).slice(0, this.MAX_EXTRACT_CHARS);

        return {
          fileName: name,
          fileType: 'docx',
          fileSize: size,
          extractedText: trimmed,
          summary: `Word document "${name}" (${(size / 1024).toFixed(1)} KB).`,
          charCount: trimmed.length,
          lineCount: trimmed.split('\n').length,
          success: true,
        };
      }

      // 5. Image files -> Preview URL and metadata
      if (['png', 'jpg', 'jpeg', 'webp', 'gif'].includes(ext)) {
        const previewUrl = URL.createObjectURL(file);
        return {
          fileName: name,
          fileType: 'image',
          fileSize: size,
          extractedText: `[Image Document Attached: ${name}, Format: ${ext.toUpperCase()}, Size: ${(size / 1024).toFixed(1)} KB]`,
          summary: `Image "${name}" (${(size / 1024).toFixed(1)} KB).`,
          previewUrl,
          charCount: 100,
          lineCount: 1,
          success: true,
        };
      }

      // 6. Generic Fallback
      const text = await file.text().catch(() => `[Binary File: ${name}]`);
      return {
        fileName: name,
        fileType: 'unknown',
        fileSize: size,
        extractedText: text.slice(0, 3000),
        summary: `File "${name}" (${(size / 1024).toFixed(1)} KB).`,
        charCount: text.length,
        lineCount: text.split('\n').length,
        success: true,
      };
    } catch (err: any) {
      return {
        fileName: name,
        fileType: 'unknown',
        fileSize: size,
        extractedText: '',
        summary: `Failed to parse "${name}": ${err.message}`,
        charCount: 0,
        lineCount: 0,
        success: false,
        error: err.message,
      };
    }
  }

  /**
   * Light-weight text extraction from raw PDF byte streams.
   */
  private static extractTextFromPdfBytes(bytes: Uint8Array): string {
    try {
      const decoder = new TextDecoder('utf-8', { fatal: false });
      const raw = decoder.decode(bytes);

      // Extract string literals in parenthesis e.g. (Hello World) Tj or [(Hello) -10 (World)] TJ
      const textMatches: string[] = [];
      const regex = /\(([^)]+)\)\s*(?:Tj|'|")/g;
      let match: RegExpExecArray | null;

      while ((match = regex.exec(raw)) !== null) {
        if (match[1] && match[1].trim().length > 0) {
          // Clean escaped characters
          const clean = match[1]
            .replace(/\\n/g, '\n')
            .replace(/\\r/g, '')
            .replace(/\\t/g, ' ')
            .replace(/\\\(/g, '(')
            .replace(/\\\)/g, ')')
            .replace(/\\\\/g, '\\');
          textMatches.push(clean);
        }
      }

      if (textMatches.length > 5) {
        return textMatches.join(' ');
      }

      // Secondary stream filter for raw text chunks
      const streamText: string[] = [];
      const streamBlocks = raw.split('stream');
      for (const block of streamBlocks.slice(1)) {
        const endIdx = block.indexOf('endstream');
        if (endIdx > 0) {
          const content = block.slice(0, endIdx);
          const words = content.match(/[A-Za-z0-9,.:;'"!?-]{3,}/g);
          if (words && words.length > 10) {
            streamText.push(words.join(' '));
          }
        }
      }

      if (streamText.length > 0) {
        return streamText.join('\n\n');
      }

      return '';
    } catch {
      return '';
    }
  }

  /**
   * Light-weight text extraction from DOCX byte streams.
   */
  private static extractTextFromDocxBytes(bytes: Uint8Array): string {
    try {
      const decoder = new TextDecoder('utf-8', { fatal: false });
      const raw = decoder.decode(bytes);

      // Match XML text nodes <w:t>Text</w:t>
      const textMatches: string[] = [];
      const regex = /<w:t(?:\s+[^>]*)?>([^<]+)<\/w:t>/g;
      let match: RegExpExecArray | null;

      while ((match = regex.exec(raw)) !== null) {
        if (match[1]) {
          textMatches.push(match[1]);
        }
      }

      if (textMatches.length > 0) {
        return textMatches.join(' ');
      }

      return '';
    } catch {
      return '';
    }
  }
}
