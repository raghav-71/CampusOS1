/**
 * Campus OS — Code Workspace Repository
 * Repository pattern providing persistence for student code files, custom inputs,
 * execution history, and preferences across sessions.
 */

import { CodeWorkspaceState, CodeFile, CodeExecutionResult, TestCase, AIMode } from '@/types/codelab';
import { SUPPORTED_LANGUAGES, getLanguageById } from '@/lib/codelab/languages';
import { CODE_TEMPLATES } from '@/lib/codelab/templates';

const STORAGE_KEY = 'campusos_code_workspace_v1';
const HISTORY_KEY = 'campusos_code_history_v1';

export interface ICodeWorkspaceRepository {
  getWorkspace(): Promise<CodeWorkspaceState>;
  saveWorkspace(state: Partial<CodeWorkspaceState>): Promise<CodeWorkspaceState>;
  createFile(name: string, languageId: string, initialContent?: string): Promise<CodeFile>;
  updateFile(fileId: string, updates: Partial<CodeFile>): Promise<CodeFile>;
  deleteFile(fileId: string): Promise<boolean>;
  duplicateFile(fileId: string, newName: string): Promise<CodeFile>;
  getRunHistory(): Promise<CodeExecutionResult[]>;
  recordRun(result: CodeExecutionResult): Promise<void>;
  resetWorkspace(): Promise<CodeWorkspaceState>;
}

export class LocalStorageWorkspaceRepository implements ICodeWorkspaceRepository {
  private inMemoryFallback: CodeWorkspaceState | null = null;

  private getDefaultState(): CodeWorkspaceState {
    const defaultLang = SUPPORTED_LANGUAGES[0]; // Python
    const initialFiles: CodeFile[] = [
      {
        id: 'file-main-py',
        name: 'main.py',
        content: CODE_TEMPLATES.python,
        languageId: 'python',
        isEntry: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
      {
        id: 'file-solution-cpp',
        name: 'solution.cpp',
        content: CODE_TEMPLATES.cpp,
        languageId: 'cpp',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
      {
        id: 'file-app-js',
        name: 'app.js',
        content: CODE_TEMPLATES.javascript,
        languageId: 'javascript',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
    ];

    return {
      id: 'workspace-default',
      name: 'My Workspace',
      activeFileId: initialFiles[0].id,
      files: initialFiles,
      stdin: '',
      expectedOutput: '',
      currentProblemId: null,
      aiMode: 'tutor',
      lastExecutionResult: null,
      testCases: [],
      fontSize: 14,
      minimap: false,
      wordWrap: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
  }

  async getWorkspace(): Promise<CodeWorkspaceState> {
    if (typeof window === 'undefined') {
      return this.getDefaultState();
    }

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as CodeWorkspaceState;
        // Verify active file exists
        if (parsed.files && parsed.files.length > 0) {
          const activeExists = parsed.files.some((f) => f.id === parsed.activeFileId);
          if (!activeExists) {
            parsed.activeFileId = parsed.files[0].id;
          }
          return parsed;
        }
      }
    } catch (err) {
      console.warn('[WorkspaceRepo] Failed to read localStorage, using default:', err);
    }

    const defaultState = this.getDefaultState();
    this.saveWorkspace(defaultState);
    return defaultState;
  }

  async saveWorkspace(updates: Partial<CodeWorkspaceState>): Promise<CodeWorkspaceState> {
    let current = await this.getWorkspace();
    current = {
      ...current,
      ...updates,
      updatedAt: Date.now(),
    };

    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
      } catch (err) {
        console.warn('[WorkspaceRepo] Failed to write localStorage:', err);
      }
    } else {
      this.inMemoryFallback = current;
    }

    return current;
  }

  async createFile(name: string, languageId: string, initialContent?: string): Promise<CodeFile> {
    const ws = await this.getWorkspace();
    const lang = getLanguageById(languageId);
    const content = initialContent ?? lang.defaultTemplate;

    const newFile: CodeFile = {
      id: `file-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      name,
      content,
      languageId,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    const updatedFiles = [...ws.files, newFile];
    await this.saveWorkspace({
      files: updatedFiles,
      activeFileId: newFile.id,
    });

    return newFile;
  }

  async updateFile(fileId: string, updates: Partial<CodeFile>): Promise<CodeFile> {
    const ws = await this.getWorkspace();
    const fileIdx = ws.files.findIndex((f) => f.id === fileId);

    if (fileIdx === -1) {
      throw new Error(`File ${fileId} not found`);
    }

    const updatedFile: CodeFile = {
      ...ws.files[fileIdx],
      ...updates,
      updatedAt: Date.now(),
    };

    const updatedFiles = [...ws.files];
    updatedFiles[fileIdx] = updatedFile;

    await this.saveWorkspace({ files: updatedFiles });
    return updatedFile;
  }

  async deleteFile(fileId: string): Promise<boolean> {
    const ws = await this.getWorkspace();
    if (ws.files.length <= 1) {
      return false; // Preserve at least one file
    }

    const remainingFiles = ws.files.filter((f) => f.id !== fileId);
    const nextActive = ws.activeFileId === fileId ? remainingFiles[0].id : ws.activeFileId;

    await this.saveWorkspace({
      files: remainingFiles,
      activeFileId: nextActive,
    });

    return true;
  }

  async duplicateFile(fileId: string, newName: string): Promise<CodeFile> {
    const ws = await this.getWorkspace();
    const orig = ws.files.find((f) => f.id === fileId);
    if (!orig) throw new Error('Original file not found');

    return this.createFile(newName, orig.languageId, orig.content);
  }

  async getRunHistory(): Promise<CodeExecutionResult[]> {
    if (typeof window === 'undefined') return [];
    try {
      const hist = localStorage.getItem(HISTORY_KEY);
      return hist ? JSON.parse(hist) : [];
    } catch {
      return [];
    }
  }

  async recordRun(result: CodeExecutionResult): Promise<void> {
    if (typeof window === 'undefined') return;
    try {
      const history = await this.getRunHistory();
      const updated = [result, ...history.slice(0, 29)]; // keep latest 30 runs
      localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
    } catch (err) {
      console.warn('[WorkspaceRepo] Failed to record run history:', err);
    }
  }

  async resetWorkspace(): Promise<CodeWorkspaceState> {
    const def = this.getDefaultState();
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(def));
    }
    return def;
  }
}

// Export singleton instance
export const codeWorkspaceRepo = new LocalStorageWorkspaceRepository();
