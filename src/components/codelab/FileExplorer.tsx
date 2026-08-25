'use client';

import React, { useState } from 'react';
import { CodeFile } from '@/types/codelab';
import { getLanguageById, detectLanguageFromFilename, SUPPORTED_LANGUAGES } from '@/lib/codelab/languages';
import {
  FileCode2,
  FilePlus,
  Trash2,
  Copy,
  Edit2,
  Check,
  X,
  ChevronRight,
  FolderOpen,
  Sparkles,
} from 'lucide-react';

interface FileExplorerProps {
  files: CodeFile[];
  activeFileId: string;
  onSelectFile: (fileId: string) => void;
  onCreateFile: (name: string, languageId: string) => void;
  onRenameFile: (fileId: string, newName: string) => void;
  onDeleteFile: (fileId: string) => void;
  onDuplicateFile: (fileId: string) => void;
}

export default function FileExplorer({
  files,
  activeFileId,
  onSelectFile,
  onCreateFile,
  onRenameFile,
  onDeleteFile,
  onDuplicateFile,
}: FileExplorerProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [newFileName, setNewFileName] = useState('');
  const [editingFileId, setEditingFileId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  const handleStartCreate = () => {
    setIsCreating(true);
    setNewFileName('solution.py');
  };

  const handleConfirmCreate = () => {
    if (!newFileName.trim()) {
      setIsCreating(false);
      return;
    }
    const detectedLang = detectLanguageFromFilename(newFileName.trim());
    onCreateFile(newFileName.trim(), detectedLang.id);
    setIsCreating(false);
    setNewFileName('');
  };

  const handleStartRename = (file: CodeFile) => {
    setEditingFileId(file.id);
    setEditingName(file.name);
  };

  const handleConfirmRename = (fileId: string) => {
    if (editingName.trim()) {
      onRenameFile(fileId, editingName.trim());
    }
    setEditingFileId(null);
    setEditingName('');
  };

  return (
    <div className="w-full h-full flex flex-col bg-[#070e22]/90 border-r border-border/70 select-none overflow-y-auto">
      {/* Header */}
      <div className="p-3 border-b border-border/60 flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">
          <FolderOpen className="w-3.5 h-3.5 text-primary" />
          <span>Explorer</span>
        </div>
        <button
          onClick={handleStartCreate}
          title="New File"
          className="p-1 rounded-lg bg-primary/10 hover:bg-primary/20 text-accent border border-primary/20 transition-all cursor-pointer"
        >
          <FilePlus className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* File List */}
      <div className="p-2 space-y-1 flex-1">
        {/* Creating new file input */}
        {isCreating && (
          <div className="flex items-center gap-1 p-1.5 rounded-xl bg-primary/10 border border-primary/40 animate-fade-in">
            <FileCode2 className="w-3.5 h-3.5 text-accent shrink-0" />
            <input
              type="text"
              autoFocus
              value={newFileName}
              onChange={(e) => setNewFileName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleConfirmCreate();
                if (e.key === 'Escape') setIsCreating(false);
              }}
              placeholder="e.g. main.cpp"
              className="bg-transparent text-xs text-foreground focus:outline-none w-full font-mono"
            />
            <button
              onClick={handleConfirmCreate}
              className="p-1 hover:text-accent cursor-pointer"
            >
              <Check className="w-3 h-3" />
            </button>
            <button
              onClick={() => setIsCreating(false)}
              className="p-1 hover:text-danger cursor-pointer"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        )}

        {files.map((file) => {
          const lang = getLanguageById(file.languageId);
          const isActive = file.id === activeFileId;
          const isEditing = editingFileId === file.id;

          return (
            <div
              key={file.id}
              onClick={() => onSelectFile(file.id)}
              className={`group flex items-center justify-between p-2 rounded-xl text-xs font-mono transition-all cursor-pointer border ${
                isActive
                  ? 'bg-primary/20 border-primary/50 text-accent font-semibold shadow-sm'
                  : 'border-transparent text-muted-foreground hover:bg-muted/40 hover:text-foreground'
              }`}
            >
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: lang.color || '#1e6bff' }}
                />
                {isEditing ? (
                  <div
                    className="flex items-center gap-1 w-full"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <input
                      type="text"
                      autoFocus
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleConfirmRename(file.id);
                        if (e.key === 'Escape') setEditingFileId(null);
                      }}
                      className="bg-[#060b18] text-xs text-foreground px-1.5 py-0.5 rounded border border-primary focus:outline-none w-full font-mono"
                    />
                    <button
                      onClick={() => handleConfirmRename(file.id)}
                      className="p-1 text-accent"
                    >
                      <Check className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <span className="truncate">{file.name}</span>
                )}
              </div>

              {/* Action Buttons on Hover */}
              {!isEditing && (
                <div
                  className="hidden group-hover:flex items-center gap-1 shrink-0 ml-1"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={() => handleStartRename(file)}
                    title="Rename"
                    className="p-1 hover:text-accent rounded hover:bg-black/20"
                  >
                    <Edit2 className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => onDuplicateFile(file.id)}
                    title="Duplicate"
                    className="p-1 hover:text-accent rounded hover:bg-black/20"
                  >
                    <Copy className="w-3 h-3" />
                  </button>
                  {files.length > 1 && (
                    <button
                      onClick={() => onDeleteFile(file.id)}
                      title="Delete"
                      className="p-1 hover:text-danger rounded hover:bg-black/20"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Language Quick Templates Section */}
      <div className="p-3 border-t border-border/60 bg-[#060b18]/60">
        <div className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider mb-2">
          Add Language Starter
        </div>
        <div className="grid grid-cols-2 gap-1.5">
          {SUPPORTED_LANGUAGES.slice(0, 6).map((lang) => (
            <button
              key={lang.id}
              onClick={() => {
                const ext = lang.fileExtension;
                const baseName = `starter_${lang.id}${ext}`;
                onCreateFile(baseName, lang.id);
              }}
              className="p-1.5 rounded-lg bg-secondary/40 hover:bg-primary/20 border border-border/50 hover:border-primary/40 text-[11px] font-mono text-muted-foreground hover:text-foreground text-left truncate transition-all cursor-pointer"
            >
              + {lang.displayName.split(' ')[0]}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
