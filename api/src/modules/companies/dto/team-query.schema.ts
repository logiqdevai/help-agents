import { z } from 'zod';
import { PaginationQuerySchema } from '@/shared/utils/pagination/pagination';

export const MembersQuerySchema = PaginationQuerySchema.extend({
  search: z.string().trim().optional(),
  role: z.enum(['OWNER', 'ADMIN', 'MEMBER', 'VIEWER']).optional(),
});
export type MembersQueryType = z.infer<typeof MembersQuerySchema>;

export const InvitationsQuerySchema = PaginationQuerySchema.extend({
  status: z.enum(['pending', 'accepted', 'revoked', 'expired', 'all']).optional().default('pending'),
});
export type InvitationsQueryType = z.infer<typeof InvitationsQuerySchema>;

export const InvitationPreviewQuerySchema = z.object({
  token: z.string().min(1),
});
export type InvitationPreviewQueryType = z.infer<typeof InvitationPreviewQuerySchema>;
