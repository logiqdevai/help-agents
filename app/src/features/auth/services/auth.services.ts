import axiosInstance, { getApiErrorMessage } from "@/config/api/axios";
import { ApiRoutes } from "@/config/api/routes";
import type { MessageResponse } from "@/interfaces/common.interfaces";
import type {
  AuthProfile,
  AuthSession,
  AuthUser,
  ChangePasswordDto,
  ForgotPasswordDto,
  LoginDto,
  RegisterDto,
  ResetPasswordDto,
  UpdateProfileDto,
  VerifyEmailDto,
} from "@/features/auth/interfaces/auth.interfaces";

export const login = async (dto: LoginDto): Promise<AuthSession> => {
  try {
    const response = await axiosInstance.post(ApiRoutes.auth.login, dto);
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Could not log in. Please try again."));
  }
};

export const register = async (dto: RegisterDto): Promise<AuthSession> => {
  try {
    const response = await axiosInstance.post(ApiRoutes.auth.register, dto);
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Could not create your account. Please try again."));
  }
};

export const forgotPassword = async (dto: ForgotPasswordDto): Promise<MessageResponse> => {
  try {
    const response = await axiosInstance.post(ApiRoutes.auth.forgotPassword, dto);
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Could not send the reset link. Please try again."));
  }
};

export const resetPassword = async (dto: ResetPasswordDto): Promise<MessageResponse> => {
  try {
    const response = await axiosInstance.post(ApiRoutes.auth.resetPassword, dto);
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "This reset link is invalid or has expired."));
  }
};

export const verifyEmail = async (dto: VerifyEmailDto): Promise<MessageResponse> => {
  try {
    const response = await axiosInstance.post(ApiRoutes.auth.verifyEmail, dto);
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "This verification link is invalid or has expired."));
  }
};

export const resendVerification = async (): Promise<MessageResponse> => {
  try {
    const response = await axiosInstance.post(ApiRoutes.auth.resendVerification);
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Could not resend the verification email."));
  }
};

export const getProfile = async (): Promise<AuthProfile> => {
  try {
    const response = await axiosInstance.get(ApiRoutes.auth.me);
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Could not load your profile."));
  }
};

export const updateProfile = async (dto: UpdateProfileDto): Promise<{ user: AuthUser }> => {
  try {
    const response = await axiosInstance.patch(ApiRoutes.auth.me, dto);
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Could not update your profile."));
  }
};

export const changePassword = async (dto: ChangePasswordDto): Promise<MessageResponse> => {
  try {
    const response = await axiosInstance.post(ApiRoutes.auth.changePassword, dto);
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Could not change your password."));
  }
};

export const logout = async (): Promise<void> => {
  try {
    await axiosInstance.post(ApiRoutes.auth.logout);
  } catch {
    // Tokens are stateless; the client discarding its token is what actually logs out.
  }
};
