import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

const useAdminCommunityPosts = vi.fn();
const useAdminReports = vi.fn();
const useRuangDiscord = vi.fn();

vi.mock("@/hooks/useCommunity", () => ({
  useAdminCommunityPosts: (...args: unknown[]) => useAdminCommunityPosts(...args),
  useSetCommunityHidden: () => ({ mutate: vi.fn(), isPending: false, error: null }),
}));

vi.mock("@/hooks/useReports", () => ({
  useAdminReports: () => useAdminReports(),
}));

vi.mock("@/pages/admin/AdminDiscordRoomsPage", () => ({
  AdminDiscordRoomsPage: () => {
    useRuangDiscord();
    return <p>Panel validasi ruang Discord</p>;
  },
}));

const { AdminCommunityPage } = await import("./AdminCommunityPage");

function renderHalaman(awal = "/admin/community") {
  return render(
    <MemoryRouter initialEntries={[awal]}>
      <AdminCommunityPage />
    </MemoryRouter>,
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  useAdminCommunityPosts.mockReturnValue({
    data: { items: [], total: 0, page: 1, limit: 10 },
    isPending: false,
    isError: false,
    error: null,
    refetch: vi.fn(),
  });
  useAdminReports.mockReturnValue({
    data: {
      content: { community: { posts: 3, comments: 2, likes: 2 }, discordRooms: { total: 3, approved: 2, pending: 1, rejected: 0 } },
    },
  });
});

describe("AdminCommunityPage - tab pengelolaan komunitas", () => {
  it("menampilkan dua tab: Postingan dan Ruang Discord", () => {
    renderHalaman();

    expect(screen.getByRole("tab", { name: /^Postingan/ })).toBeTruthy();
    expect(screen.getByRole("tab", { name: /^Ruang Discord/ })).toBeTruthy();
  });

  it("tab Postingan aktif secara bawaan", () => {
    renderHalaman();

    expect(screen.getByRole("tab", { name: /^Postingan/ }).getAttribute("aria-selected")).toBe(
      "true",
    );
    expect(screen.queryByText("Panel validasi ruang Discord")).toBeNull();
  });

  it("tab Ruang Discord merender panel validasi ruang Discord", () => {
    renderHalaman("/admin/community?tab=discord");

    expect(screen.getByText("Panel validasi ruang Discord")).toBeTruthy();
    expect(
      screen.getByRole("tab", { name: /^Ruang Discord/ }).getAttribute("aria-selected"),
    ).toBe("true");
  });

  it("mengabaikan nilai tab yang tidak dikenal", () => {
    renderHalaman("/admin/community?tab=ngawur");

    expect(screen.getByRole("tab", { name: /^Postingan/ }).getAttribute("aria-selected")).toBe(
      "true",
    );
  });
});
