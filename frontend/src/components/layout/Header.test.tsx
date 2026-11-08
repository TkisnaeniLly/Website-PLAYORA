import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

const useAuth = vi.fn();
const useUnreadCount = vi.fn();

vi.mock("@/hooks/useAuth", () => ({
  useAuth: () => useAuth(),
  useLogout: () => ({ mutate: vi.fn(), isPending: false }),
}));
vi.mock("@/hooks/useAccount", () => ({
  useUnreadCount: (...args: unknown[]) => useUnreadCount(...args),
}));

const { Header } = await import("./Header");

function renderHeader() {
  return render(
    <MemoryRouter>
      <Header onBukaMenu={() => {}} />
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
  useUnreadCount.mockReturnValue({ data: 3 });
});

describe("Header - menu profil pengguna login", () => {
  it("menyediakan semua fitur akun di dalam ikon profil", () => {
    renderHeader();

    fireEvent.click(screen.getByTestId("tombol-profil"));

    const menu = screen.getByTestId("menu-profil");
    expect(within(menu).getByRole("link", { name: /Favorit saya/ })).toBeTruthy();
    expect(within(menu).getByRole("link", { name: /Artikel tersimpan/ })).toBeTruthy();
    expect(within(menu).getByRole("link", { name: /Notifikasi/ })).toBeTruthy();
    expect(within(menu).getByRole("link", { name: /Profil & pengaturan/ })).toBeTruthy();
    expect(within(menu).getByTestId("keluar-menu")).toBeTruthy();
  });

  it("menampilkan jumlah notifikasi belum dibaca pada menu profil", () => {
    renderHeader();

    fireEvent.click(screen.getByTestId("tombol-profil"));

    const badge = screen.getByTestId("badge-notifikasi-profil");
    expect(badge.textContent).toBe("3");
  });

  it("menyembunyikan badge bila tidak ada notifikasi belum dibaca", () => {
    useUnreadCount.mockReturnValue({ data: 0 });

    renderHeader();
    fireEvent.click(screen.getByTestId("tombol-profil"));

    expect(screen.queryByTestId("badge-notifikasi-profil")).toBeNull();
  });

  it("tidak lagi menampilkan ikon lonceng terpisah di header", () => {
    renderHeader();

    expect(screen.queryByTestId("lonceng-notifikasi")).toBeNull();
  });
});
