import { AIRouterRequest, AIResponsePayload } from './aiTypes';
import { CampusAgent } from './agent/campusAgent';

export * from './agent';

export class AIRouter {
  static async handleRequest(req: AIRouterRequest): Promise<AIResponsePayload> {
    return CampusAgent.handleRequest(req);
  }
}
