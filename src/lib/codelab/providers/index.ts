/**
 * Campus OS — Execution Provider Registry
 */

import { ICodeExecutionProvider } from './types';
import { Judge0Provider } from './Judge0Provider';
import { PistonProvider } from './PistonProvider';

export class ExecutionProviderRegistry {
  private static providers: ICodeExecutionProvider[] = [
    new Judge0Provider(),
    new PistonProvider(),
  ];

  static getAllProviders(): ICodeExecutionProvider[] {
    return this.providers;
  }

  static async getActiveProvider(): Promise<ICodeExecutionProvider> {
    const forced = process.env.CODE_EXECUTION_PROVIDER?.toLowerCase();

    if (forced === 'piston') {
      const p = this.providers.find((prov) => prov instanceof PistonProvider);
      if (p) return p;
    }

    if (forced === 'judge0') {
      const j = this.providers.find((prov) => prov instanceof Judge0Provider);
      if (j) return j;
    }

    // Default: Judge0Provider
    return this.providers[0];
  }

  static getProviderByName(name: string): ICodeExecutionProvider | undefined {
    return this.providers.find((p) => p.name.toLowerCase().includes(name.toLowerCase()));
  }
}
