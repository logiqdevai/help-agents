import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import {
  changePassword,
  forgotPassword,
  getProfile,
  login,
  logout,
  register,
  resendVerification,
  resetPassword,
  updateProfile,
  verifyEmail,
} from "@/features/auth/services/auth.services";
import { notify } from "@/lib/notify";
import { Routes } from "@/routes/routes";
import { useAuthStore } from "@/stores/auth";

const PROFILE_KEY = "profile";

export const useGetProfile = () => {
  const accessToken = useAuthStore((state) => state.accessToken);
  return useQuery({
    queryKey: [PROFILE_KEY],
    queryFn: getProfile,
    enabled: !!accessToken,
  });
};

export const useLogin = () => {
  const setSession = useAuthStore((state) => state.setSession);
  const router = useRouter();
  return useMutation({
    mutationFn: login,
    onSuccess: (session) => {
      setSession(session);
      router.replace(Routes.dashboard);
    },
    onError: (error) => notify.error("Could not log in", error.message),
  });
};

export const useRegister = () => {
  const setSession = useAuthStore((state) => state.setSession);
  const router = useRouter();
  return useMutation({
    mutationFn: register,
    onSuccess: (session) => {
      setSession(session);
      notify.success("Account created", "Check your inbox to verify your email address.");
      router.replace(Routes.dashboard);
    },
    onError: (error) => notify.error("Could not create account", error.message),
  });
};

export const useLogout = () => {
  const clear = useAuthStore((state) => state.clear);
  const queryClient = useQueryClient();
  const router = useRouter();
  return useMutation({
    mutationFn: logout,
    onSettled: () => {
      clear();
      queryClient.clear();
      router.replace(Routes.auth.login);
    },
  });
};

export const useForgotPassword = () =>
  useMutation({
    mutationFn: forgotPassword,
    onError: (error) => notify.error("Could not send reset link", error.message),
  });

export const useResetPassword = () =>
  useMutation({
    mutationFn: resetPassword,
    onSuccess: () => notify.success("Password updated", "You can now log in with your new password."),
    onError: (error) => notify.error("Could not reset password", error.message),
  });

export const useVerifyEmail = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: verifyEmail,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [PROFILE_KEY] }),
  });
};

export const useResendVerification = () =>
  useMutation({
    mutationFn: resendVerification,
    onSuccess: () => notify.success("Verification email sent", "Check your inbox."),
    onError: (error) => notify.error("Could not send email", error.message),
  });

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  const setProfile = useAuthStore((state) => state.setProfile);
  return useMutation({
    mutationFn: updateProfile,
    onSuccess: ({ user }) => {
      setProfile({ user });
      queryClient.invalidateQueries({ queryKey: [PROFILE_KEY] });
      notify.success("Profile updated");
    },
    onError: (error) => notify.error("Could not update profile", error.message),
  });
};

export const useChangePassword = () =>
  useMutation({
    mutationFn: changePassword,
    onSuccess: () => notify.success("Password changed"),
    onError: (error) => notify.error("Could not change password", error.message),
  });
