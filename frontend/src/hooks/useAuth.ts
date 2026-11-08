import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getCurrentUser, loginAccount, logoutAccount, registerAccount } from "@/lib/auth";
import type { AuthUser } from "@/types/api";

export const AUTH_QUERY_KEY = ["auth", "me"] as const;

export function useAuth() {
  return useQuery({
    queryKey: AUTH_QUERY_KEY,
    queryFn: getCurrentUser,
    retry: false,
    staleTime: 60_000,
  });
}

export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: loginAccount,
    onSuccess: (user: AuthUser) => {
      queryClient.setQueryData(AUTH_QUERY_KEY, user);
    },
  });
}

export function useRegister() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: registerAccount,
    onSuccess: (user: AuthUser) => {
      queryClient.setQueryData(AUTH_QUERY_KEY, user);
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: logoutAccount,
    onSuccess: () => {
      queryClient.setQueryData(AUTH_QUERY_KEY, null);
      void queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEY });
    },
  });
}
