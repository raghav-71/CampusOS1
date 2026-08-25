/**
 * Campus OS — Code Lab Language Registry
 * Central configuration for all supported programming languages.
 */

import { LanguageDefinition } from '@/types/codelab';
import { CODE_TEMPLATES } from './templates';

export const SUPPORTED_LANGUAGES: LanguageDefinition[] = [
  {
    id: 'python',
    displayName: 'Python 3.12',
    version: '3.12.5',
    editorLanguage: 'python',
    fileExtension: '.py',
    compileRequired: false,
    runCommand: 'python3 script.py',
    defaultTemplate: CODE_TEMPLATES.python,
    judge0LanguageId: 100, // Python (3.12.5) or fallback 71 (Python 3.8.1)
    iconName: 'python',
    color: '#3572A5',
  },
  {
    id: 'cpp',
    displayName: 'C++ (GCC 14)',
    version: '14.1.0',
    editorLanguage: 'cpp',
    fileExtension: '.cpp',
    compileRequired: true,
    compilerCommand: 'g++ -O3 -std=c++20 main.cpp -o main',
    runCommand: './main',
    defaultTemplate: CODE_TEMPLATES.cpp,
    judge0LanguageId: 105, // C++ (GCC 14.1.0) or fallback 54 (GCC 9.2.0)
    iconName: 'cpp',
    color: '#f34b7d',
  },
  {
    id: 'c',
    displayName: 'C (GCC 14)',
    version: '14.1.0',
    editorLanguage: 'c',
    fileExtension: '.c',
    compileRequired: true,
    compilerCommand: 'gcc -O3 main.c -o main',
    runCommand: './main',
    defaultTemplate: CODE_TEMPLATES.c,
    judge0LanguageId: 103, // C (GCC 14.1.0) or fallback 50 (GCC 9.2.0)
    iconName: 'c',
    color: '#555555',
  },
  {
    id: 'java',
    displayName: 'Java (JDK 17)',
    version: '17.0.6',
    editorLanguage: 'java',
    fileExtension: '.java',
    compileRequired: true,
    compilerCommand: 'javac Main.java',
    runCommand: 'java Main',
    defaultTemplate: CODE_TEMPLATES.java,
    judge0LanguageId: 91, // Java (JDK 17.0.6) or fallback 62 (OpenJDK 13)
    iconName: 'java',
    color: '#b07219',
  },
  {
    id: 'javascript',
    displayName: 'JavaScript (Node.js 20)',
    version: '20.17.0',
    editorLanguage: 'javascript',
    fileExtension: '.js',
    compileRequired: false,
    runCommand: 'node index.js',
    defaultTemplate: CODE_TEMPLATES.javascript,
    judge0LanguageId: 97, // Node.js 20.17.0 or fallback 63 (Node.js 12)
    iconName: 'javascript',
    color: '#f1e05a',
  },
  {
    id: 'typescript',
    displayName: 'TypeScript 5.6',
    version: '5.6.2',
    editorLanguage: 'typescript',
    fileExtension: '.ts',
    compileRequired: true,
    compilerCommand: 'tsc index.ts',
    runCommand: 'node index.js',
    defaultTemplate: CODE_TEMPLATES.typescript,
    judge0LanguageId: 101, // TypeScript (5.6.2) or fallback 74 (3.7.4)
    iconName: 'typescript',
    color: '#3178c6',
  },
  {
    id: 'go',
    displayName: 'Go 1.23',
    version: '1.23.5',
    editorLanguage: 'go',
    fileExtension: '.go',
    compileRequired: true,
    compilerCommand: 'go build -o main main.go',
    runCommand: './main',
    defaultTemplate: CODE_TEMPLATES.go,
    judge0LanguageId: 107, // Go (1.23.5) or fallback 60 (1.13.5)
    iconName: 'go',
    color: '#00ADD8',
  },
  {
    id: 'rust',
    displayName: 'Rust 1.85',
    version: '1.85.0',
    editorLanguage: 'rust',
    fileExtension: '.rs',
    compileRequired: true,
    compilerCommand: 'rustc -O main.rs',
    runCommand: './main',
    defaultTemplate: CODE_TEMPLATES.rust,
    judge0LanguageId: 108, // Rust (1.85.0) or fallback 73 (1.40.0)
    iconName: 'rust',
    color: '#dea584',
  },
  {
    id: 'kotlin',
    displayName: 'Kotlin 2.1',
    version: '2.1.10',
    editorLanguage: 'kotlin',
    fileExtension: '.kt',
    compileRequired: true,
    compilerCommand: 'kotlinc main.kt -include-runtime -d main.jar',
    runCommand: 'java -jar main.jar',
    defaultTemplate: CODE_TEMPLATES.kotlin,
    judge0LanguageId: 111, // Kotlin (2.1.10) or fallback 78 (1.3.70)
    iconName: 'kotlin',
    color: '#A97BFF',
  },
  {
    id: 'csharp',
    displayName: 'C# (Mono 6.6)',
    version: '6.6.0',
    editorLanguage: 'csharp',
    fileExtension: '.cs',
    compileRequired: true,
    compilerCommand: 'mcs -out:main.exe main.cs',
    runCommand: 'mono main.exe',
    defaultTemplate: CODE_TEMPLATES.csharp,
    judge0LanguageId: 51, // C# (Mono 6.6.0.161)
    iconName: 'csharp',
    color: '#178600',
  },
  {
    id: 'php',
    displayName: 'PHP 8.3',
    version: '8.3.11',
    editorLanguage: 'php',
    fileExtension: '.php',
    compileRequired: false,
    runCommand: 'php main.php',
    defaultTemplate: CODE_TEMPLATES.php,
    judge0LanguageId: 98, // PHP (8.3.11) or fallback 68 (7.4.1)
    iconName: 'php',
    color: '#4F5D95',
  },
  {
    id: 'ruby',
    displayName: 'Ruby 2.7',
    version: '2.7.0',
    editorLanguage: 'ruby',
    fileExtension: '.rb',
    compileRequired: false,
    runCommand: 'ruby main.rb',
    defaultTemplate: CODE_TEMPLATES.ruby,
    judge0LanguageId: 72, // Ruby (2.7.0)
    iconName: 'ruby',
    color: '#701516',
  },
  {
    id: 'swift',
    displayName: 'Swift 5.2',
    version: '5.2.3',
    editorLanguage: 'swift',
    fileExtension: '.swift',
    compileRequired: true,
    compilerCommand: 'swiftc main.swift',
    runCommand: './main',
    defaultTemplate: CODE_TEMPLATES.swift,
    judge0LanguageId: 83, // Swift (5.2.3)
    iconName: 'swift',
    color: '#F05138',
  },
  {
    id: 'bash',
    displayName: 'Bash 5.0',
    version: '5.0.0',
    editorLanguage: 'shell',
    fileExtension: '.sh',
    compileRequired: false,
    runCommand: 'bash script.sh',
    defaultTemplate: CODE_TEMPLATES.bash,
    judge0LanguageId: 46, // Bash (5.0.0)
    iconName: 'terminal',
    color: '#89e051',
  },
];

export function getLanguageById(id: string): LanguageDefinition {
  const found = SUPPORTED_LANGUAGES.find((lang) => lang.id === id);
  if (found) return found;
  // Fallback to Python if invalid ID
  return SUPPORTED_LANGUAGES[0];
}

export function detectLanguageFromFilename(filename: string): LanguageDefinition {
  const ext = '.' + filename.split('.').pop()?.toLowerCase();
  const matched = SUPPORTED_LANGUAGES.find((l) => l.fileExtension === ext);
  return matched || SUPPORTED_LANGUAGES[0];
}
