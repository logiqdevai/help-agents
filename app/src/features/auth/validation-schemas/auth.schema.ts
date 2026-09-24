import { z } from "zod";

const passwordField = z
  .string()
  .min(8, "Use at least 8 characters")
  .max(128, "Use at most 128 characters");

export const loginSchema = z.object({
  email: z.string().min(1, "Email is required").email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});
export type LoginFormData = z.infer<typeof loginSchema>;

export const signupSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(120),
  email: z.string().min(1, "Email is required").email("Enter a valid email address"),
  password: passwordField,
  company_name: z.string().trim().min(1, "Company name is required").max(160),
  phone: z.string().max(32).optional(),
});
export type SignupFormData = z.infer<typeof signupSchema>;

// Joining through an invitation: the company already exists, so no company name.
export const inviteSignupSchema = signupSchema.omit({ company_name: true });
export type InviteSignupFormData = z.infer<typeof inviteSignupSchema>;

export const forgotPasswordSchema = z.object({
  email: z.string().min(1, "Email is required").email("Enter a valid email address"),
});
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z
  .object({
    password: passwordField,
    confirm_password: z.string().min(1, "Confirm your new password"),
  })
  .refine((data) => data.password === data.confirm_password, {
    path: ["confirm_password"],
    message: "Passwords do not match",
  });
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

export const changePasswordSchema = z
  .object({
    current_password: z.string().min(1, "Enter your current password"),
    new_password: passwordField,
    confirm_password: z.string().min(1, "Confirm your new password"),
  })
  .refine((data) => data.new_password === data.confirm_password, {
    path: ["confirm_password"],
    message: "Passwords do not match",
  });
export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;

export const updateProfileSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(120),
  phone: z.string().max(32).optional(),
  timezone: z.string().min(1, "Choose a timezone"),
  language: z.string().min(1, "Choose a language"),
});
export type UpdateProfileFormData = z.infer<typeof updateProfileSchema>;
