/**
 * Campus OS Document Parser Service
 * Robust, universal document parsing pipeline for PDF, DOCX, TXT, CSV, JSON, Code, and Images.
 * Uses `unpdf` for multi-page PDF text extraction and `mammoth` for Word (.docx) document parsing.
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

      // 4. DOCX files -> Extract readable text with mammoth
      if (ext === 'docx' || ext === 'doc') {
        const arrayBuffer = await file.arrayBuffer();
        return await this.parseDocxBuffer(arrayBuffer, name, size);
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
    buffer: Uint8Array | ArrayBuffer | Buffer,
    fileName: string,
    fileSize = (buffer as any).byteLength || (buffer as any).length || 0
  ): Promise<ParsedDocumentResult> {
    try {
      const { extractText } = await import('unpdf');
      const uint8 = buffer instanceof Uint8Array && buffer.constructor.name === 'Uint8Array'
        ? buffer
        : new Uint8Array(
            buffer instanceof ArrayBuffer
              ? buffer
              : (buffer as any).buffer || buffer,
            (buffer as any).byteOffset || 0,
            (buffer as any).byteLength || (buffer as any).length
          );

      const result = await extractText(uint8, { mergePages: false });

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

      const summaryText = isScanned
        ? `⚠️ **Notice**: This PDF appears to be scanned or image-based (${totalPages} page${totalPages > 1 ? 's' : ''}). Text extraction found little or no selectable text.`
        : DocumentChunker.generateAcademicSummary(fileName, combinedText);

      const chunks = DocumentChunker.chunkText(combinedText);

      return {
        fileName,
        fileType: 'pdf',
        fileSize,
        pageCount: totalPages,
        isScanned,
        extractedText: combinedText,
        chunks,
        summary: summaryText,
        charCount: combinedText.length,
        lineCount: combinedText.split('\n').length,
        success: true,
      };
    } catch (err: any) {
      return {
        fileName,
        fileType: 'pdf',
        fileSize,
        pageCount: 0,
        isScanned: false,
        extractedText: `[PDF Parsing Error: ${err.message}]`,
        summary: `Error extracting text from PDF "${fileName}": ${err.message}`,
        charCount: 0,
        lineCount: 0,
        success: false,
        error: err.message,
      };
    }
  }

  /**
   * Parse DOCX ArrayBuffer with mammoth
   */
  static async parseDocxBuffer(
    buffer: ArrayBuffer | Uint8Array,
    fileName: string,
    fileSize = buffer.byteLength
  ): Promise<ParsedDocumentResult> {
    try {
      const uint8 = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
      const arrayBuffer = uint8.buffer.slice(uint8.byteOffset, uint8.byteOffset + uint8.byteLength) as ArrayBuffer;
      const mammoth = await import('mammoth');
      const result = await mammoth.extractRawText({ arrayBuffer });
      const text = (result.value || '').trim();

      const trimmed = text || `[Word Document: ${fileName} (${(fileSize / 1024).toFixed(1)} KB)]`;
      const chunks = DocumentChunker.chunkText(trimmed);

      return {
        fileName,
        fileType: 'docx',
        fileSize,
        pageCount: 1,
        isScanned: false,
        extractedText: trimmed,
        chunks,
        summary: DocumentChunker.generateAcademicSummary(fileName, trimmed),
        charCount: trimmed.length,
        lineCount: trimmed.split('\n').length,
        success: true,
      };
    } catch (err: any) {
      return {
        fileName,
        fileType: 'docx',
        fileSize,
        pageCount: 0,
        isScanned: false,
        extractedText: `[DOCX Parsing Error: ${err.message}]`,
        summary: `Failed to extract DOCX: ${err.message}`,
        charCount: 0,
        lineCount: 0,
        success: false,
        error: err.message,
      };
    }
  }

  /**
   * Parse Base64 Data URL
   */
  static async parseDataUrl(dataUrl: string, fileName: string): Promise<ParsedDocumentResult> {
    try {
      const base64Index = dataUrl.indexOf(';base64,');
      if (base64Index !== -1) {
        const base64 = dataUrl.slice(base64Index + 8);
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

        if (ext === 'docx' || ext === 'doc' || dataUrl.includes('wordprocessingml')) {
          return await this.parseDocxBuffer(bytes.buffer, fileName, len);
        }

        const decoder = new TextDecoder('utf-8', { fatal: false });
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
}
