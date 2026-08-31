/**
 * Campus OS Document Parser Service
 * Robust, universal document parsing pipeline for PDF, DOCX, TXT, CSV, JSON, Code, and Images.
 * Uses `unpdf` for multi-page PDF text extraction, page preservation, and scanned PDF detection.
 */

import { DocumentChunk, DocumentChunker } from '@/lib/ai/documents/DocumentChunker';

export interface ParsedDocumentResult {
  fileName: string;
  fileType: 'pdf' | 'docx' | 'txt' | 'csv' | 'json' | 'code' | 'image' | 'unknown';
  fileSize: number;
  pageCount?: number;
  isScanned?: boolean;
  extractedText: string;
  chunks?: DocumentChunk[];
  summary: string;
  charCount: number;
  lineCount: number;
  previewUrl?: string;
  success: boolean;
  error?: string;
}

export class DocumentParserService {
  private static MAX_EXTRACT_CHARS = 100000;

  /**
   * Main parsing entry point from File object
   */
  static async parseFile(file: File): Promise<ParsedDocumentResult> {
    const ext = file.name.split('.').pop()?.toLowerCase() || '';
    const size = file.size;
    const name = file.name;

    try {
      // 1. Plain Text, Markdown, JSON, Code files
      if (['txt', 'md', 'json', 'py', 'java', 'c', 'cpp', 'cs', 'js', 'ts', 'tsx', 'html', 'css', 'sql'].includes(ext)) {
        const text = await file.text();
        const trimmed = text.slice(0, this.MAX_EXTRACT_CHARS);
        const lines = trimmed.split('\n');
        const chunks = DocumentChunker.chunkText(trimmed);

        return {
          fileName: name,
          fileType: ext === 'json' ? 'json' : ['py', 'java', 'c', 'cpp', 'cs', 'js', 'ts', 'sql'].includes(ext) ? 'code' : 'txt',
          fileSize: size,
          pageCount: 1,
          isScanned: false,
          extractedText: trimmed,
          chunks,
          summary: DocumentChunker.generateAcademicSummary(name, trimmed),
          charCount: trimmed.length,
          lineCount: lines.length,
          success: true,
        };
      }

      // 2. CSV files -> Convert to structured Markdown preview
      if (ext === 'csv') {
        const text = await file.text();
        const lines = text.split('\n').filter((l) => l.trim().length > 0);
        const previewRows = lines.slice(0, 50);
        const markdownTable = previewRows.map((r) => `| ${r.split(',').join(' | ')} |`).join('\n');
        const chunks = DocumentChunker.chunkText(markdownTable);

        return {
          fileName: name,
          fileType: 'csv',
          fileSize: size,
          pageCount: 1,
          isScanned: false,
          extractedText: `CSV Data (${lines.length} total rows):\n\n${markdownTable}`,
          chunks,
          summary: `Structured spreadsheet "${name}" with ${lines.length} rows.`,
          charCount: markdownTable.length,
          lineCount: lines.length,
          success: true,
        };
      }

      // 3. PDF files -> Parse with unpdf (Universal PDF.js Engine)
      if (ext === 'pdf') {
        const arrayBuffer = await file.arrayBuffer();
        return await this.parsePdfBuffer(new Uint8Array(arrayBuffer), name, size);
      }

      // 4. DOCX files -> Extract readable XML text nodes
      if (ext === 'docx' || ext === 'doc') {
        const arrayBuffer = await file.arrayBuffer();
        const text = this.extractTextFromDocxBytes(new Uint8Array(arrayBuffer));
        const trimmed = text || `[Word Document: ${name} (${(size / 1024).toFixed(1)} KB)]`;
        const chunks = DocumentChunker.chunkText(trimmed);

        return {
          fileName: name,
          fileType: 'docx',
          fileSize: size,
          pageCount: 1,
          isScanned: false,
          extractedText: trimmed,
          chunks,
          summary: DocumentChunker.generateAcademicSummary(name, trimmed),
          charCount: trimmed.length,
          lineCount: trimmed.split('\n').length,
          success: true,
        };
      }

      // 5. Image files -> Preview metadata
      if (['png', 'jpg', 'jpeg', 'webp', 'gif'].includes(ext)) {
        let previewUrl: string | undefined = undefined;
        if (typeof window !== 'undefined') {
          try {
            previewUrl = URL.createObjectURL(file);
          } catch {}
        }

        return {
          fileName: name,
          fileType: 'image',
          fileSize: size,
          pageCount: 1,
          isScanned: true,
          extractedText: `[Image Document Attached: ${name}, Format: ${ext.toUpperCase()}, Size: ${(size / 1024).toFixed(1)} KB]`,
          summary: `Image "${name}" (${(size / 1024).toFixed(1)} KB). Visual scan attached.`,
          previewUrl,
          charCount: 100,
          lineCount: 1,
          success: true,
        };
      }

      // 6. Generic Fallback
      const text = await file.text().catch(() => `[Binary File: ${name}]`);
      const chunks = DocumentChunker.chunkText(text);
      return {
        fileName: name,
        fileType: 'unknown',
        fileSize: size,
        pageCount: 1,
        isScanned: false,
        extractedText: text.slice(0, 10000),
        chunks,
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
        pageCount: 0,
        isScanned: false,
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
   * Parse PDF bytes with unpdf, maintaining multi-page structure and scanned detection
   */
  static async parsePdfBuffer(
    buffer: Uint8Array,
    fileName: string,
    fileSize = buffer.length
  ): Promise<ParsedDocumentResult> {
    try {
      const { extractText } = await import('unpdf');
      const result = await extractText(buffer, { mergePages: false });

      const totalPages = result.totalPages || (Array.isArray(result.text) ? result.text.length : 1);
      const rawPages: string[] = Array.isArray(result.text) ? result.text : [result.text || ''];

      // Format page by page
      const formattedPages: string[] = [];
      let totalLetters = 0;

      rawPages.forEach((pageText, idx) => {
        const clean = (pageText || '').trim();
        const lettersOnly = clean.replace(/[^a-zA-Z0-9]/g, '');
        totalLetters += lettersOnly.length;

        if (clean.length > 0) {
          formattedPages.push(`--- PAGE ${idx + 1} ---\n${clean}`);
        } else {
          formattedPages.push(`--- PAGE ${idx + 1} ---\n[Empty page or image scan]`);
        }
      });

      const combinedText = formattedPages.join('\n\n');
      const isScanned = totalPages > 0 && totalLetters < 40;

      let summary = '';
      if (isScanned) {
        summary = `⚠️ **Notice**: This PDF appears to be scanned or image-based (${totalPages} page${totalPages > 1 ? 's' : ''}). Text extraction found little or no selectable text.`;
      } else {
        summary = DocumentChunker.generateAcademicSummary(fileName, combinedText);
      }

      const chunks = DocumentChunker.chunkText(combinedText);

      return {
        fileName,
        fileType: 'pdf',
        fileSize,
        pageCount: totalPages,
        isScanned,
        extractedText: combinedText,
        chunks,
        summary,
        charCount: combinedText.length,
        lineCount: combinedText.split('\n').length,
        success: true,
      };
    } catch (err: any) {
      // If unpdf fails, provide graceful diagnostics without falsely claiming corruption
      return {
        fileName,
        fileType: 'pdf',
        fileSize,
        pageCount: 1,
        isScanned: false,
        extractedText: `[PDF Document: ${fileName} (${(fileSize / 1024).toFixed(1)} KB)]`,
        summary: `PDF document "${fileName}" (${(fileSize / 1024).toFixed(1)} KB). You can view and download the original file directly.`,
        charCount: 0,
        lineCount: 1,
        success: true,
        error: `PDF reader warning: ${err.message}`,
      };
    }
  }

  /**
   * Parse Data URL (Base64) into extracted document result
   */
  static async parseDataUrl(dataUrl: string, fileName: string): Promise<ParsedDocumentResult> {
    if (!dataUrl) {
      return {
        fileName,
        fileType: 'unknown',
        fileSize: 0,
        extractedText: '',
        summary: 'No document data found.',
        charCount: 0,
        lineCount: 0,
        success: false,
      };
    }

    try {
      const base64Index = dataUrl.indexOf('base64,');
      if (base64Index !== -1) {
        const base64 = dataUrl.slice(base64Index + 7);
        const binaryString = typeof window !== 'undefined' ? atob(base64) : Buffer.from(base64, 'base64').toString('binary');
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }

        const ext = fileName.split('.').pop()?.toLowerCase() || '';
        if (ext === 'pdf' || dataUrl.includes('application/pdf')) {
          return await this.parsePdfBuffer(bytes, fileName, len);
        }

        const decoder = new TextDecoder('utf-8');
        const text = decoder.decode(bytes);
        const chunks = DocumentChunker.chunkText(text);

        return {
          fileName,
          fileType: 'txt',
          fileSize: len,
          pageCount: 1,
          isScanned: false,
          extractedText: text,
          chunks,
          summary: DocumentChunker.generateAcademicSummary(fileName, text),
          charCount: text.length,
          lineCount: text.split('\n').length,
          success: true,
        };
      }

      return {
        fileName,
        fileType: 'unknown',
        fileSize: dataUrl.length,
        extractedText: dataUrl.slice(0, 1000),
        summary: `Document "${fileName}"`,
        charCount: dataUrl.length,
        lineCount: 1,
        success: true,
      };
    } catch (err: any) {
      return {
        fileName,
        fileType: 'unknown',
        fileSize: 0,
        extractedText: '',
        summary: `Failed to decode "${fileName}": ${err.message}`,
        charCount: 0,
        lineCount: 0,
        success: false,
        error: err.message,
      };
    }
  }

  /**
   * Text extraction from DOCX byte streams
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
