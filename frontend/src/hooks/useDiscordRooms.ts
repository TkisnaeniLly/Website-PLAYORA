import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createDiscordRoom,
  getAdminDiscordRooms,
  getDiscordRooms,
  getMyDiscordRooms,
  reviewDiscordRoom,
  updateDiscordRoom,
} from "@/lib/discord";
import type {
  DiscordRoomFormValues,
  DiscordRoomListQuery,
  DiscordRoomStatus,
  DiscordRoomUpdateValues,
} from "@/types/discord";

const KUNCI = ["discord-rooms"] as const;

function invalidasi(queryClient: ReturnType<typeof useQueryClient>) {
  void queryClient.invalidateQueries({ queryKey: KUNCI });
  void queryClient.invalidateQueries({ queryKey: ["admin", "discord-rooms"] });
}

export function useDiscordRooms(query: DiscordRoomListQuery, aktif: boolean) {
  return useQuery({
    queryKey: [...KUNCI, "recommended", query],
    queryFn: () => getDiscordRooms(query),
    enabled: aktif,
    placeholderData: (sebelumnya) => sebelumnya,
    retry: false,
  });
}

export function useMyDiscordRooms(aktif: boolean) {
  return useQuery({
    queryKey: [...KUNCI, "mine"],
    queryFn: getMyDiscordRooms,
    enabled: aktif,
    retry: false,
  });
}

export function useCreateDiscordRoom() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (values: DiscordRoomFormValues) => createDiscordRoom(values),
    onSuccess: () => invalidasi(queryClient),
  });
}

export function useUpdateDiscordRoom() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { id: string; values: DiscordRoomUpdateValues }) =>
      updateDiscordRoom(input.id, input.values),
    onSuccess: () => invalidasi(queryClient),
  });
}

export function useAdminDiscordRooms(
  query: DiscordRoomListQuery & { status?: DiscordRoomStatus | "" },
) {
  return useQuery({
    queryKey: ["admin", "discord-rooms", query],
    queryFn: () => getAdminDiscordRooms(query),
    placeholderData: (sebelumnya) => sebelumnya,
    retry: false,
  });
}

export function useReviewDiscordRoom() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: {
      id: string;
      decision: "APPROVED" | "REJECTED";
      note?: string;
    }) => reviewDiscordRoom(input.id, input.decision, input.note),
    onSuccess: () => invalidasi(queryClient),
  });
}
