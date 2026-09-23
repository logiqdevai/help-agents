import { Injectable, NotImplementedException } from '@nestjs/common';
import { KnowledgeSourceType } from 'generated/prisma';
import { KnowledgeConnector } from './knowledge-connector.interface';

export const INTERNAL_SOURCE_TYPES: KnowledgeSourceType[] = [KnowledgeSourceType.TEXT, KnowledgeSourceType.FILE];

@Injectable()
export class KnowledgeConnectorRegistry {
  private readonly connectors = new Map<KnowledgeSourceType, KnowledgeConnector>();

  register(connector: KnowledgeConnector): void {
    this.connectors.set(connector.type, connector);
  }

  /** Throws 501 until a connector for the source type is registered. */
  get(type: KnowledgeSourceType): KnowledgeConnector {
    const connector = this.connectors.get(type);
    if (!connector) {
      throw new NotImplementedException(`Knowledge sources of type ${type} are not supported yet`);
    }
    return connector;
  }
}
