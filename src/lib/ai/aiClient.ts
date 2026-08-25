import { ProviderChain } from './providers/ProviderChain';

export * from './providers/types';
export * from './providers/ProviderChain';
export * from './providers/LocalAIProvider';
export * from './providers/DeterministicEngine';

export class AIClientFactory {
  static getProvider() {
    return ProviderChain;
  }
}
