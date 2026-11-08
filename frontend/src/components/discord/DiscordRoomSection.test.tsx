import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const useAuth = vi.fn();
const useDiscordRooms = vi.fn();
const useMyDiscordRooms = vi.fn();
const useGames = vi.fn();

vi.mock("@/hooks/useAuth", () => ({ useAuth: () => useAuth() }));
vi.mock("@/hooks/useDiscordRooms", () => ({
  useDiscordRooms: (...args: unknown[]) => useDiscordRooms(...args),
  useMyDiscordRooms: (...args: unknown[]) => useMyDiscordRooms(...args),
  useCreateDiscordRoom: () => ({ mutate: vi.fn(), isPending: false, error: null }),
  useUpdateDiscordRoom: () => ({ mutate: vi.fn(), isPending: false, error: null }),
}));
vi.mock("@/hooks/useGames", () => ({
  useGames: (...args: unknown[]) => useGames(...args),
}));

const { DiscordRoomSection } = await import("./DiscordRoomSection");

function renderSeksi() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <DiscordRoomSection />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

const ruang = {
  id: "r1",
  name: "Valorant Indonesia",
  inviteUrl: "https://discord.gg/valorant",
  description: "Ruang mabar Valorant untuk anggota PLAYORA.",
  memberCount: 120,
  createdAt: new Date().toISOString(),
  game: { id: "g1", title: "Valorant", slug: "valorant" },
};

beforeEach(() => {
  vi.clearAllMocks();
  useDiscordRooms.mockReturnValue({
    data: { items: [ruang], total: 1, page: 1, limit: 9 },
    isPending: false,
    isError: false,
    error: null,
    refetch: vi.fn(),
  });
  useMyDiscordRooms.mockReturnValue({ data: [] });
  useGames.mockReturnValue({ data: { items: [], total: 0, page: 1, limit: 48 } });
});

describe("DiscordRoomSection - akses tamu", () => {
  it("tamu melihat ajakan masuk, bukan daftar ruang", () => {
    useAuth.mockReturnValue({ data: undefined });

    renderSeksi();

    expect(screen.getByTestId("gerbang-ruang-discord")).toBeTruthy();
    expect(screen.queryByTestId("daftar-ruang-discord")).toBeNull();
    expect(screen.getByTestId("masuk-ruang-discord").getAttribute("href")).toBe("/login");
    expect(screen.getByTestId("daftar-akun-ruang-discord").getAttribute("href")).toBe("/register");
    expect(screen.queryByTestId("kartu-ruang-discord")).toBeNull();
    expect(screen.queryByTestId("cari-ruang-discord")).toBeNull();
    expect(screen.getByTestId("jumlah-ruang-discord").textContent).toContain("Khusus anggota");
  });

  it("tamu tidak memicu permintaan daftar ruang", () => {
    useAuth.mockReturnValue({ data: undefined });

    renderSeksi();

    expect(useDiscordRooms).toHaveBeenCalledWith(expect.anything(), false);
  });

  it("anggota yang masuk melihat daftar ruang dan tanpa gerbang", () => {
    useAuth.mockReturnValue({ data: { id: "u1", name: "Tika", username: "tika", role: "USER" } });

    renderSeksi();

    expect(screen.queryByTestId("gerbang-ruang-discord")).toBeNull();
    expect(screen.getByTestId("kartu-ruang-discord")).toBeTruthy();
    expect(useDiscordRooms).toHaveBeenCalledWith(expect.anything(), true);
  });
});
