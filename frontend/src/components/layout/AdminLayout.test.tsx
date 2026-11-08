import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router-dom";

const useAuth = vi.fn();
const useLogout = vi.fn();

vi.mock("@/hooks/useAuth", () => ({
  useAuth: () => useAuth(),
  useLogout: () => useLogout(),
}));

const { AdminLayout } = await import("./AdminLayout");

function renderAdmin(awal = "/admin") {
  const router = createMemoryRouter(
    [
      {
        path: "/admin",
        element: <AdminLayout />,
        children: [
          { index: true, element: <p>Konten dashboard</p> },
          { path: "games", element: <p>Konten game</p> },
        ],
      },
    ],
    { initialEntries: [awal] },
  );

  return render(<RouterProvider router={router} />);
}

const MENU = [
  "Dashboard",
  "Kelola Game",
  "Kelola Berita",
  "Kelola Turnamen",
  "Kelola Komunitas",
  "Kelola Pengguna",
  "Laporan & Statistik",
  "Pengaturan",
];

beforeEach(() => {
  vi.clearAllMocks();
  useAuth.mockReturnValue({
    data: { id: "a1", name: "Admin Uji", username: "admin", email: "admin@playora.id", role: "ADMIN" },
  });
  useLogout.mockReturnValue({ mutate: vi.fn(), isPending: false });
});

describe("AdminLayout", () => {
  it("menampilkan delapan menu panel admin sesuai urutan", () => {
    renderAdmin();

    const navigasi = screen.getByRole("navigation", { name: "Menu admin" });
    const label = Array.from(navigasi.querySelectorAll("a")).map((tautan) =>
      tautan.textContent?.trim(),
    );

    expect(label).toEqual(MENU);
  });

  it("menautkan setiap menu ke rute yang benar", () => {
    renderAdmin();
    const navigasi = screen.getByRole("navigation", { name: "Menu admin" });
    const tautan = Array.from(navigasi.querySelectorAll("a")).map((item) =>
      item.getAttribute("href"),
    );

    expect(tautan).toEqual([
      "/admin",
      "/admin/games",
      "/admin/articles",
      "/admin/tournaments",
      "/admin/community",
      "/admin/users",
      "/admin/reports",
      "/admin/settings",
    ]);
  });

  it("menandai menu Dashboard sebagai aktif", () => {
    renderAdmin();

    const dashboard = screen.getByRole("link", { name: "Dashboard" });
    expect(dashboard.getAttribute("aria-current")).toBe("page");
  });

  it("menyediakan tombol keluar dan identitas admin", () => {
    renderAdmin();

    expect(screen.getByTestId("keluar-admin")).toBeTruthy();
    expect(screen.getByTestId("sidebar-admin")).toBeTruthy();
    expect(screen.getByTestId("profil-admin")).toBeTruthy();
  });

  it("merender konten halaman di dalam panel admin", () => {
    renderAdmin("/admin/games");

    expect(screen.getByText("Konten game")).toBeTruthy();
    expect(screen.getByRole("link", { name: "Kelola Game" }).getAttribute("aria-current")).toBe(
      "page",
    );
  });
  it("tidak menampilkan menu pelanggan atau tamu di sidebar admin", () => {
    renderAdmin();

    const navigasi = screen.getByRole("navigation", { name: "Menu admin" });
    const label = Array.from(navigasi.querySelectorAll("a")).map((tautan) =>
      tautan.textContent?.trim(),
    );

    expect(label).not.toContain("Komunitas Discord");
    expect(label).not.toContain("Beranda");
    expect(label).not.toContain("Jelajahi Game");
    expect(label).not.toContain("Berita");
    expect(label).not.toContain("Panduan");
    expect(label).not.toContain("Turnamen");
    expect(label).not.toContain("Komunitas");
    expect(label).toHaveLength(8);
  });

  it("menu profil admin hanya berisi pengaturan dan keluar", () => {
    renderAdmin();

    fireEvent.click(screen.getByTestId("profil-admin"));

    const menu = screen.getByTestId("menu-profil-admin");
    const tautan = Array.from(menu.querySelectorAll("a")).map((item) => item.textContent?.trim());

    expect(tautan).toEqual(["Pengaturan akun"]);
    expect(within(menu).queryByText("Kembali ke situs")).toBeNull();
    expect(within(menu).getByRole("button", { name: "Keluar" })).toBeTruthy();
  });

  it("halaman kelola hasil tidak menautkan ke rute publik saat gagal", async () => {
    const sumber = await import("node:fs").then((fs) =>
      fs.readFileSync(
        "T:/SRTS_Playora/frontend/src/pages/admin/ManageResultsPage.tsx",
        "utf8",
      ),
    );

    expect(sumber).not.toContain('to="/tournaments"');
  });
});
