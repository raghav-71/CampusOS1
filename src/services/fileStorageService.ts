/**
 * Campus OS File Storage Service
 * Modular abstraction layer for academic document storage.
 * Defaults to MockFileStorageService with full frontend validation,
 * preview generation, sanitization, replacement, and deletion.
 * Can be swapped with SupabaseFileStorageService or S3 in production.
 */

export interface StoredFileMetadata {
  fileId: string;
  fileName: string;
  originalName: string;
  fileSize: string;
  sizeBytes: number;
  mimeType: string;
  fileType: 'pdf' | 'doc' | 'sheet' | 'slide' | 'image' | 'text' | 'archive' | 'other';
  category: 'marks-card' | 'notes' | 'question-paper' | 'assignment' | 'submission';
  uploadedAt: string;
  previewUrl?: string;
  downloadUrl?: string;
  dataUrl?: string;
  extractedText?: string;
}

export interface FileValidationOptions {
  maxSizeBytes?: number;
  allowedExtensions?: string[];
  allowedMimeTypes?: string[];
  category?: 'marks-card' | 'notes' | 'question-paper' | 'assignment' | 'submission';
}

export interface IFileStorageService {
  uploadFile(
    file: File,
    category: 'marks-card' | 'notes' | 'question-paper' | 'assignment' | 'submission',
    options?: FileValidationOptions,
    onProgress?: (percent: number) => void
  ): Promise<StoredFileMetadata>;

  validateFile(file: File, options?: FileValidationOptions): { valid: boolean; error?: string };

  deleteFile(fileId: string): Promise<boolean>;

  getFileMetadata(fileId: string): StoredFileMetadata | null;
}

// Strictly disallowed executable and script extensions
const DANGEROUS_EXTENSIONS = new Set([
  'exe', 'bat', 'cmd', 'sh', 'ps1', 'dll', 'msi', 'vbs', 'js', 'jsx', 'ts',
  'tsx', 'py', 'php', 'com', 'scr', 'bin', 'pif', 'application', 'gadget',
  'jar', 'apk', 'app', 'vb', 'ws', 'wsf'
]);

// Common accepted academic file types
export const ACCEPTED_ACADEMIC_EXTENSIONS = [
  'pdf',
  'doc',
  'docx',
  'ppt',
  'pptx',
  'xls',
  'xlsx',
  'csv',
  'txt',
  'jpg',
  'jpeg',
  'png',
  'webp'
];

export const ACCEPTED_MIME_TYPES = new Set([
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/csv',
  'text/plain',
  'image/jpeg',
  'image/png',
  'image/webp',
]);

/** Format byte size to readable string */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/** Sanitize file name to avoid path traversal and invalid characters */
export function sanitizeFileName(name: string): string {
  const base = name.replace(/^.*[\\/]/, '');
  return base.replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 100);
}

/** Classify document type based on extension */
export function classifyFileType(ext: string): StoredFileMetadata['fileType'] {
  const cleanExt = ext.toLowerCase().replace('.', '');
  if (cleanExt === 'pdf') return 'pdf';
  if (['doc', 'docx'].includes(cleanExt)) return 'doc';
  if (['xls', 'xlsx', 'csv'].includes(cleanExt)) return 'sheet';
  if (['ppt', 'pptx'].includes(cleanExt)) return 'slide';
  if (['jpg', 'jpeg', 'png', 'webp'].includes(cleanExt)) return 'image';
  if (cleanExt === 'txt') return 'text';
  return 'other';
}

export class MockFileStorageService implements IFileStorageService {
  private fileRegistry = new Map<string, StoredFileMetadata>();

  constructor() {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('campusos_file_registry');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            parsed.forEach((item: StoredFileMetadata) => {
              if (item.fileId) this.fileRegistry.set(item.fileId, item);
            });
          }
        }
      } catch {}
    }
  }

  private persist() {
    if (typeof window !== 'undefined') {
      try {
        const items = Array.from(this.fileRegistry.values());
        localStorage.setItem('campusos_file_registry', JSON.stringify(items));
      } catch {}
    }
  }

  validateFile(file: File, options?: FileValidationOptions): { valid: boolean; error?: string } {
    if (!file) {
      return { valid: false, error: 'No file was provided.' };
    }

    const ext = file.name.split('.').pop()?.toLowerCase() || '';

    // 1. Security Check: Disallow executable scripts
    if (DANGEROUS_EXTENSIONS.has(ext)) {
      return {
        valid: false,
        error: `Security Alert: Executable script files (.${ext}) are strictly forbidden.`,
      };
    }

    // 2. Allowed Extensions check
    const allowedExts = options?.allowedExtensions || ACCEPTED_ACADEMIC_EXTENSIONS;
    if (!allowedExts.includes(ext)) {
      return {
        valid: false,
        error: `Unsupported file type (.${ext}). Accepted formats: ${allowedExts.map((e) => `.${e}`).join(', ')}`,
      };
    }

    // 3. Max Size check (Default 25MB, or custom)
    const maxSizeBytes = options?.maxSizeBytes || 25 * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      return {
        valid: false,
        error: `File size exceeds the limit of ${formatFileSize(maxSizeBytes)}. Please select a smaller file.`,
      };
    }

    if (file.size === 0) {
      return { valid: false, error: 'The selected file is empty (0 bytes).' };
    }

    return { valid: true };
  }

  async uploadFile(
    file: File,
    category: 'marks-card' | 'notes' | 'question-paper' | 'assignment' | 'submission',
    options?: FileValidationOptions,
    onProgress?: (percent: number) => void
  ): Promise<StoredFileMetadata> {
    const validation = this.validateFile(file, options);
    if (!validation.valid) {
      throw new Error(validation.error || 'File validation failed');
    }

    // Simulate async progress
    if (onProgress) {
      onProgress(20);
      await new Promise((r) => setTimeout(r, 60));
      onProgress(60);
      await new Promise((r) => setTimeout(r, 80));
      onProgress(100);
    }

    const fileId = `file-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const sanitized = sanitizeFileName(file.name);
    const ext = sanitized.split('.').pop()?.toLowerCase() || '';

    let dataUrl: string | undefined = undefined;
    let previewUrl: string | undefined = undefined;

    if (typeof window !== 'undefined') {
      try {
        previewUrl = URL.createObjectURL(file);
      } catch {}

      // Convert small/medium files to data URL for persistent browser downloads
      if (file.size < 12 * 1024 * 1024) {
        try {
          dataUrl = await new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.onerror = () => resolve('');
            reader.readAsDataURL(file);
          });
        } catch {}
      }
    }

    const metadata: StoredFileMetadata = {
      fileId,
      fileName: sanitized,
      originalName: file.name,
      fileSize: formatFileSize(file.size),
      sizeBytes: file.size,
      mimeType: file.type || 'application/octet-stream',
      fileType: classifyFileType(ext),
      category,
      uploadedAt: new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
      previewUrl: dataUrl || previewUrl,
      downloadUrl: dataUrl || previewUrl,
      dataUrl,
    };

    this.fileRegistry.set(fileId, metadata);
    this.persist();
    return metadata;
  }

  async deleteFile(fileId: string): Promise<boolean> {
    const meta = this.fileRegistry.get(fileId);
    if (meta?.previewUrl && typeof window !== 'undefined' && meta.previewUrl.startsWith('blob:')) {
      try {
        URL.revokeObjectURL(meta.previewUrl);
      } catch {}
    }
    const res = this.fileRegistry.delete(fileId);
    this.persist();
    return res;
  }

  getFileMetadata(fileId: string): StoredFileMetadata | null {
    return this.fileRegistry.get(fileId) || null;
  }
}

export const fileStorageService = new MockFileStorageService();
