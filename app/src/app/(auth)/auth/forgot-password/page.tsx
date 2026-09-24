import type { Metadata } from "next";
import ForgotPasswordPage from "@/views/auth/forgot-password";

export const metadata: Metadata = { title: "Forgot password" };

export default function Page() {
  return <ForgotPasswordPage />;
}
