import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

const useAdminTournaments = vi.fn();
const useSetPublished = vi.fn();
const useReviewResults = vi.fn();
const useSubmissions = vi.fn();
const useChangeRequests = vi.fn();

vi.mock("@/hooks/useManagement", () => ({
  useAdminTournaments: (...args: unknown[]) => useAdminTournaments(...args),
  useSetPublished: () => useSetPublished(),
  useReviewResults: (...args: unknown[]) => useReviewResults(...args),
  useReviewSingleResult: () => ({ mutate: vi.fn(), isPending: false, error: null }),
}));

vi.mock("@/pages/admin/AdminSubmissionsPage", () => ({
  AdminSubmissionsPage: () => {
    useSubmissions();
    return <p>Panel pengajuan turnamen</p>;
  },
}));

vi.mock("@/pages/admin/AdminChangeRequestsPage", () => ({
  AdminChangeRequestsPage: () => {
    useChangeRequests();
    return <p>Panel permintaan perubahan</p>;
  },
}));

const { AdminTournamentsPage } = await import("./AdminTournamentsPage");

function renderHalaman(awal = "/admin/tournaments") {
  return render(
    <MemoryRouter initialEntries={[awal]}>
      <AdminTournamentsPage />
    </MemoryRouter>,
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  useAdminTournaments.mockReturnValue({
    data: { items: [], total: 0, page: 1, limit: 12 },
    isPending: false,
    isError: false,
    error: null,
    refetch: vi.fn(),
  });
  useSetPublished.mockReturnValue({ mutate: vi.fn(), isPending: false, error: null });
  useReviewResults.mockReturnValue({ mutate: vi.fn(), isPending: false, error: null });
});

describe("AdminTournamentsPage - tab pengelolaan turnamen", () => {
  it("menampilkan tiga tab pengelolaan", () => {
    renderHalaman();

    expect(screen.getByRole("tab", { name: /^Turnamen/ })).toBeTruthy();
    expect(screen.getByRole("tab", { name: /^Pengajuan/ })).toBeTruthy();
    expect(screen.getByRole("tab", { name: /^Perubahan/ })).toBeTruthy();
  });

  it("tab Turnamen aktif secara bawaan", () => {
    renderHalaman();

    expect(screen.getByRole("tab", { name: /^Turnamen/ }).getAttribute("aria-selected")).toBe(
      "true",
    );
    expect(screen.queryByText("Panel pengajuan turnamen")).toBeNull();
  });

  it("tab Pengajuan merender panel keputusan pengajuan", () => {
    renderHalaman("/admin/tournaments?tab=pengajuan");

    expect(screen.getByText("Panel pengajuan turnamen")).toBeTruthy();
    expect(screen.getByRole("tab", { name: /^Pengajuan/ }).getAttribute("aria-selected")).toBe(
      "true",
    );
  });

  it("tab Perubahan merender panel permintaan perubahan", () => {
    renderHalaman("/admin/tournaments?tab=perubahan");

    expect(screen.getByText("Panel permintaan perubahan")).toBeTruthy();
  });

  it("mengabaikan nilai tab yang tidak dikenal", () => {
    renderHalaman("/admin/tournaments?tab=ngawur");

    expect(screen.getByRole("tab", { name: /^Turnamen/ }).getAttribute("aria-selected")).toBe(
      "true",
    );
  });
});
