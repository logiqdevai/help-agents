import { z } from "zod";
import { CompanyRoles } from "@/features/auth/interfaces/auth.interfaces";

const roleField = z.enum([CompanyRoles.OWNER, CompanyRoles.ADMIN, CompanyRoles.MEMBER, CompanyRoles.VIEWER]);

export const createInvitationSchema = z.object({
  email: z.string().trim().min(1, "Email is required").email("Enter a valid email address"),
  role: roleField,
});
export type CreateInvitationFormData = z.infer<typeof createInvitationSchema>;

export const updateMemberRoleSchema = z.object({
  role: roleField,
});
export type UpdateMemberRoleFormData = z.infer<typeof updateMemberRoleSchema>;
