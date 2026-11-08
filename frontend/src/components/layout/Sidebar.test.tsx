import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

const useAuth = vi.fn();
const useUnreadCount = vi.fn();

vi.mock("@/hooks/useAuth", () => ({ useAuth: () => useAuth() }));
vi.mock("@/hooks/useAccount", () => ({
  useUnreadCount: (...args: unknown[]) => useUnreadCount(...args),
}));

const { Sidebar } = await import("./Sidebar");

function renderSidebar() {
  return render(
    <MemoryRouter>
      <Sidebar terbuka onTutup={() => {}} />
    </MemoryRouter>,
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  useAuth.mockReturnValue({
    data: {
      id: "u1",
      name: "Tika Gamer",
      username: "tika",
      email: "tika@playora.id",
      role: "USER",
      avatarUrl: null,
    },
  });
  useUnreadCount.mockReturnValue({ data: 4 });
});

describe("Sidebar pengguna login", () => {
  it("hanya menampilkan menu utama dan ajakan Discord", () => {
    renderSidebar();

    const navigasiUtama = screen.getByRole("navigation", { name: "Navigasi utama" });
    const label = Array.from(navigasiUtama.querySelectorAll("a")).map((tautan) =>
      tautan.textContent?.trim(),
    );

    expect(label).toEqual([
      "Beranda",
      "Jelajahi Game",
      "Berita",
      "Panduan",
      "Turnamen",
      "Komunitas",
    ]);
    expect(screen.getByTestId("ajakan-discord")).toBeTruthy();
  });

  it("tidak lagi memuat blok Akun saya di sidebar", () => {
    renderSidebar();

    expect(screen.queryByText("Akun saya")).toBeNull();
    expect(screen.queryByRole("navigation", { name: "Menu akun" })).toBeNull();

    for (const label of ["Favorit saya", "Artikel tersimpan", "Notifikasi", "Pengaturan akun"]) {
      expect(screen.queryByRole("link", { name: label })).toBeNull();
    }
  });

  it("tidak menampilkan badge notifikasi di sidebar", () => {
    renderSidebar();

    expect(within(screen.getByTestId("sidebar")).queryByText("4")).toBeNull();
  });
});
