import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

const useAuth = vi.fn();
const useTournaments = vi.fn();

vi.mock("@/hooks/useAuth", () => ({ useAuth: () => useAuth() }));
vi.mock("@/hooks/useTournaments", () => ({
  useTournaments: (...args: unknown[]) => useTournaments(...args),
}));

const { TournamentsPage } = await import("./TournamentsPage");

function renderHalaman(awal = "/tournaments") {
  return render(
    <MemoryRouter initialEntries={[awal]}>
      <TournamentsPage />
    </MemoryRouter>,
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  useTournaments.mockReturnValue({
    data: { items: [], total: 0, page: 1, limit: 9 },
    isPending: false,
    isError: false,
    error: null,
    refetch: vi.fn(),
  });
});

describe("TournamentsPage - akses pengajuan turnamen", () => {
  it("pengguna login melihat tombol Ajukan turnamen dan Pengajuan saya", () => {
    useAuth.mockReturnValue({
      data: { id: "u1", name: "Tika", username: "tika", role: "USER" },
    });

    renderHalaman();

    expect(screen.getByTestId("ajukan-turnamen")).toBeTruthy();
    expect(screen.getByTestId("ajukan-turnamen").getAttribute("href")).toBe("/tournaments/submit");
    expect(screen.getByTestId("pengajuan-saya").getAttribute("href")).toBe(
      "/tournaments/submissions",
    );
  });

  it("tamu diarahkan ke login dengan tombol Masuk untuk mengajukan", () => {
    useAuth.mockReturnValue({ data: undefined });

    renderHalaman();

    expect(screen.queryByTestId("ajukan-turnamen")).toBeNull();
    const masuk = screen.getByTestId("masuk-untuk-ajukan");
    expect(masuk.getAttribute("href")).toBe("/login");
    expect(screen.getByText(/Masuk untuk mengajukan turnamen/i)).toBeTruthy();
  });

  it("tombol tetap tersedia meski daftar turnamen kosong", () => {
    useAuth.mockReturnValue({
      data: { id: "u1", name: "Tika", username: "tika", role: "USER" },
    });

    renderHalaman();

    expect(screen.getByTestId("empty-state")).toBeTruthy();
    expect(screen.getByTestId("ajukan-turnamen")).toBeTruthy();
  });
});
