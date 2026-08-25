'use client';

import React, { useState } from 'react';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export default function MarkdownRenderer({ content, className = '' }: MarkdownRendererProps) {
  if (!content) return null;

  // Pre-process content into blocks (code blocks, tables, headings, paragraphs, lists)
  const blocks = parseMarkdownBlocks(content);

  return (
    <div className={`markdown-body space-y-3 text-xs sm:text-sm leading-relaxed text-foreground ${className}`}>
      {blocks.map((block, idx) => (
        <React.Fragment key={idx}>{renderBlock(block, idx)}</React.Fragment>
      ))}
    </div>
  );
}

interface BlockData {
  type: 'code' | 'table' | 'heading' | 'blockquote' | 'list' | 'paragraph';
  language?: string;
  code?: string;
  level?: number;
  text?: string;
  items?: string[];
  ordered?: boolean;
  tableData?: { headers: string[]; rows: string[][] };
}

function parseMarkdownBlocks(markdown: string): BlockData[] {
  const blocks: BlockData[] = [];
  const lines = markdown.split('\n');
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // 1. Fenced Code Blocks (```lang ... ```)
    if (line.trim().startsWith('```')) {
      const language = line.trim().replace(/^```/, '').trim() || 'text';
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith('```')) {
        codeLines.push(lines[i]);
        i++;
      }
      i++; // Skip closing ```
      blocks.push({
        type: 'code',
        language,
        code: codeLines.join('\n'),
      });
      continue;
    }

    // 2. Markdown Tables (| header | header |)
    if (line.includes('|') && lines[i + 1] && lines[i + 1].includes('|') && lines[i + 1].includes('-')) {
      const headers = line
        .split('|')
        .map((h) => h.trim())
        .filter((h, idx, arr) => (idx === 0 && h === '' ? false : idx === arr.length - 1 && h === '' ? false : true));

      i += 2; // skip header and delimiter row
      const rows: string[][] = [];
      while (i < lines.length && lines[i].includes('|') && lines[i].trim().length > 0) {
        const rowCells = lines[i]
          .split('|')
          .map((c) => c.trim())
          .filter((c, idx, arr) => (idx === 0 && c === '' ? false : idx === arr.length - 1 && c === '' ? false : true));
        if (rowCells.length > 0) {
          rows.push(rowCells);
        }
        i++;
      }
      blocks.push({
        type: 'table',
        tableData: { headers, rows },
      });
      continue;
    }

    // 3. Headings (#, ##, ###)
    if (line.startsWith('#')) {
      const match = line.match(/^(#{1,6})\s+(.*)$/);
      if (match) {
        blocks.push({
          type: 'heading',
          level: match[1].length,
          text: match[2],
        });
        i++;
        continue;
      }
    }

    // 4. Blockquotes / Callouts (> quote)
    if (line.startsWith('>')) {
      const quoteLines: string[] = [];
      while (i < lines.length && lines[i].startsWith('>')) {
        quoteLines.push(lines[i].replace(/^>\s?/, ''));
        i++;
      }
      blocks.push({
        type: 'blockquote',
        text: quoteLines.join('\n'),
      });
      continue;
    }

    // 5. Lists (unordered: - or *, ordered: 1. 2.)
    if (line.trim().match(/^[-*•]\s+/) || line.trim().match(/^\d+\.\s+/)) {
      const ordered = Boolean(line.trim().match(/^\d+\.\s+/));
      const items: string[] = [];

      while (
        i < lines.length &&
        (lines[i].trim().match(/^[-*•]\s+/) ||
          lines[i].trim().match(/^\d+\.\s+/) ||
          (items.length > 0 && lines[i].startsWith('   ') && lines[i].trim().length > 0))
      ) {
        if (lines[i].trim().match(/^[-*•]\s+/) || lines[i].trim().match(/^\d+\.\s+/)) {
          const itemText = lines[i].trim().replace(/^[-*•]\s+/, '').replace(/^\d+\.\s+/, '');
          items.push(itemText);
        } else if (items.length > 0) {
          items[items.length - 1] += ' ' + lines[i].trim();
        }
        i++;
      }

      blocks.push({
        type: 'list',
        ordered,
        items,
      });
      continue;
    }

    // 6. Regular Paragraphs
    if (line.trim().length === 0) {
      i++;
      continue;
    }

    const paragraphLines: string[] = [];
    while (
      i < lines.length &&
      lines[i].trim().length > 0 &&
      !lines[i].trim().startsWith('```') &&
      !lines[i].startsWith('#') &&
      !lines[i].startsWith('>') &&
      !lines[i].trim().match(/^[-*•]\s+/) &&
      !lines[i].trim().match(/^\d+\.\s+/)
    ) {
      paragraphLines.push(lines[i]);
      i++;
    }

    blocks.push({
      type: 'paragraph',
      text: paragraphLines.join('\n'),
    });
  }

  return blocks;
}

function renderBlock(block: BlockData, key: number) {
  switch (block.type) {
    case 'code':
      return <CodeBlock code={block.code || ''} language={block.language || 'text'} key={key} />;

    case 'table':
      if (!block.tableData) return null;
      return (
        <div key={key} className="overflow-x-auto my-3 rounded-xl border border-border/80 bg-muted/20">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-border/80 bg-muted/40 text-accent font-700">
                {block.tableData.headers.map((h, hIdx) => (
                  <th key={hIdx} className="p-2.5 sm:p-3 font-semibold">
                    {renderInline(h)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {block.tableData.rows.map((row, rIdx) => (
                <tr key={rIdx} className="hover:bg-primary/5 transition-colors">
                  {row.map((cell, cIdx) => (
                    <td key={cIdx} className="p-2.5 sm:p-3 font-500">
                      {renderInline(cell)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );

    case 'heading': {
      const level = block.level || 3;
      const text = renderInline(block.text || '');
      if (level === 1) {
        return (
          <h1 key={key} className="text-base sm:text-lg font-800 text-foreground mt-3 mb-1.5 tracking-tight">
            {text}
          </h1>
        );
      }
      if (level === 2) {
        return (
          <h2 key={key} className="text-sm sm:text-base font-700 text-foreground mt-2.5 mb-1 text-accent tracking-tight">
            {text}
          </h2>
        );
      }
      if (level === 3) {
        return (
          <h3 key={key} className="text-xs sm:text-sm font-700 text-foreground mt-2 mb-1 tracking-tight">
            {text}
          </h3>
        );
      }
      return (
        <h4 key={key} className="text-xs font-700 text-foreground mt-1.5 mb-1 tracking-tight">
          {text}
        </h4>
      );
    }

    case 'blockquote':
      return (
        <div
          key={key}
          className="my-2.5 p-3 rounded-xl bg-primary/10 border-l-4 border-primary text-foreground/90 text-xs sm:text-sm italic"
        >
          {renderInline(block.text || '')}
        </div>
      );

    case 'list':
      if (block.ordered) {
        return (
          <ol key={key} className="list-decimal list-inside space-y-1.5 my-2 pl-1">
            {block.items?.map((item, iIdx) => (
              <li key={iIdx} className="text-foreground/90">
                {renderInline(item)}
              </li>
            ))}
          </ol>
        );
      }
      return (
        <ul key={key} className="space-y-1.5 my-2 pl-1">
          {block.items?.map((item, iIdx) => (
            <li key={iIdx} className="flex items-start gap-2 text-foreground/90">
              <span className="text-accent font-bold mt-0.5">●</span>
              <span className="flex-1">{renderInline(item)}</span>
            </li>
          ))}
        </ul>
      );

    case 'paragraph':
    default:
      return (
        <p key={key} className="leading-relaxed">
          {renderInline(block.text || '')}
        </p>
      );
  }
}

function renderInline(text: string): React.ReactNode {
  if (!text) return null;

  // Split by inline code (`code`), bold (**bold**), italic (*italic*), and links ([text](url))
  const parts: React.ReactNode[] = [];
  let keyIdx = 0;

  // Match markdown tokens
  const tokenRegex = /(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*|\[[^\]]+\]\([^)]+\))/g;
  let match: RegExpExecArray | null;
  let lastIndex = 0;

  while ((match = tokenRegex.exec(text)) !== null) {
    // Add text before match
    if (match.index > lastIndex) {
      parts.push(
        <span key={keyIdx++} className="whitespace-pre-wrap">
          {text.substring(lastIndex, match.index)}
        </span>
      );
    }

    const token = match[0];
    if (token.startsWith('`') && token.endsWith('`')) {
      // Inline code
      parts.push(
        <code
          key={keyIdx++}
          className="font-mono text-[11px] sm:text-xs px-1.5 py-0.5 rounded-md bg-muted/80 text-accent font-600 border border-border/60"
        >
          {token.slice(1, -1)}
        </code>
      );
    } else if (token.startsWith('**') && token.endsWith('**')) {
      // Bold
      parts.push(
        <strong key={keyIdx++} className="font-700 text-foreground">
          {token.slice(2, -2)}
        </strong>
      );
    } else if (token.startsWith('*') && token.endsWith('*')) {
      // Italic
      parts.push(
        <em key={keyIdx++} className="italic text-foreground/90">
          {token.slice(1, -1)}
        </em>
      );
    } else if (token.startsWith('[') && token.includes('](')) {
      // Link
      const linkText = token.substring(1, token.indexOf(']('));
      const linkUrl = token.substring(token.indexOf('](') + 2, token.length - 1);
      parts.push(
        <a
          key={keyIdx++}
          href={linkUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:text-accent underline font-600 transition-colors"
        >
          {linkText}
        </a>
      );
    }

    lastIndex = match.index + token.length;
  }

  if (lastIndex < text.length) {
    parts.push(
      <span key={keyIdx++} className="whitespace-pre-wrap">
        {text.substring(lastIndex)}
      </span>
    );
  }

  return <>{parts}</>;
}

function CodeBlock({ code, language }: { code: string; language: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative my-3 rounded-2xl overflow-hidden border border-border/80 bg-zinc-950/90 shadow-xl font-mono">
      {/* Code Header Bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-zinc-900/90 border-b border-zinc-800 text-[11px] text-zinc-400">
        <span className="font-bold uppercase tracking-wider text-accent">{language}</span>
        <button
          onClick={handleCopy}
          className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-[10px] font-600 transition-colors flex items-center gap-1.5 cursor-pointer"
        >
          {copied ? (
            <>
              <span className="text-emerald-400">✓</span>
              <span>Copied!</span>
            </>
          ) : (
            <>
              <span>📋</span>
              <span>Copy Code</span>
            </>
          )}
        </button>
      </div>

      {/* Code Content */}
      <pre className="p-4 overflow-x-auto text-[11px] sm:text-xs text-zinc-100 font-mono leading-relaxed selection:bg-accent selection:text-black">
        <code>{code}</code>
      </pre>
    </div>
  );
}
