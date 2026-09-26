import { EmailAgentProduct } from "./email-agent";
import { MessagingAgentProduct } from "./messaging-agent";
import type { ProductContent } from "./product.types";
import { VoiceAgentProduct } from "./voice-agent";

export * from "./product.types";

export const Products: ProductContent[] = [VoiceAgentProduct, EmailAgentProduct, MessagingAgentProduct];
