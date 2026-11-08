import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  changePassword,
  getNotifications,
  getProfile,
  getUnreadCount,
  markAllRead,
  markRead,
  updateProfile,
} from "@/lib/account";
import type { NotificationsQuery, PasswordFormValues, ProfileFormValues } from "@/types/account";
import { AUTH_QUERY_KEY } from "./useAuth";

export function useNotifications(query: NotificationsQuery) {
  return useQuery({
    queryKey: ["notifications", query],
    queryFn: () => getNotifications(query),
    placeholderData: (sebelumnya) => sebelumnya,
  });
}

export function useUnreadCount(enabled = true) {
  return useQuery({
    queryKey: ["notifications", "unread-count"],
    queryFn: getUnreadCount,
    enabled,
    refetchInterval: 60_000,
    staleTime: 30_000,
  });
}

export function useMarkRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: markRead,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}

export function useMarkAllRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: markAllRead,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}

export function useProfile() {
  return useQuery({
    queryKey: ["profile"],
    queryFn: getProfile,
    retry: false,
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateProfile,
    onSuccess: (user) => {
      queryClient.setQueryData(AUTH_QUERY_KEY, user);
      void queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
  });
}

export function useChangePassword() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: PasswordFormValues) => changePassword(values),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
  });
}

export type { ProfileFormValues };
