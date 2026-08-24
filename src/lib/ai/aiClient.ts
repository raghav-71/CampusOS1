import { providerChain } from './providers/ProviderChain';

export * from './providers';

export class AIClientFactory {
  static getProvider() {
    return providerChain;
  }
}
