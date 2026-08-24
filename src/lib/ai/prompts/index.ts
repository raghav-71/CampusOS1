import { AIContextData } from '../aiTypes';
import { SystemPromptBuilder } from './system';
import { StudentPromptBuilder } from './student';
import { FacultyPromptBuilder } from './faculty';
import { AdminPromptBuilder } from './admin';

export * from './system';
export * from './student';
export * from './faculty';
export * from './admin';

export class AIPromptsManager {
  static getSystemPrompt(context: AIContextData): string {
    const role = context.user.role || 'student';
    if (role === 'teacher') {
      return FacultyPromptBuilder.getPrompt(context);
    }
    if (role === 'admin') {
      return AdminPromptBuilder.getPrompt(context);
    }
    return StudentPromptBuilder.getPrompt(context);
  }
}
