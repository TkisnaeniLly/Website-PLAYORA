import axios from "axios";
import { api } from "./api";
import type { ApiSuccess, AuthUser } from "@/types/api";

export interface RegisterPayload {
  name: string;
  username: string;
  email: string;
  password: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  try {
    const response = await api.get<ApiSuccess<{ user: AuthUser }>>("/auth/me");
    return response.data.data.user;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      return null;
    }
    throw error;
  }
}

export async function registerAccount(payload: RegisterPayload): Promise<AuthUser> {
  const response = await api.post<ApiSuccess<{ user: AuthUser }>>("/auth/register", payload);
  return response.data.data.user;
}

export async function loginAccount(payload: LoginPayload): Promise<AuthUser> {
  const response = await api.post<ApiSuccess<{ user: AuthUser }>>("/auth/login", payload);
  return response.data.data.user;
}

export async function logoutAccount(): Promise<void> {
  await api.post<ApiSuccess<{ message: string }>>("/auth/logout");
}
