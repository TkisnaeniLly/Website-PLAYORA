import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

const useAdminSubmissions = vi.fn();
const useSubmissionDetail = vi.fn();

vi.mock("@/hooks/useSubmissions", () => ({
  useAdminSubmissions: (...args: unknown[]) => useAdminSubmissions(...args),
  useDecideSubmission: () => ({ mutate: vi.fn(), isPending: false, error: null }),
  useSubmissionDetail: (...args: unknown[]) => useSubmissionDetail(...args),
}));

const { AdminSubmissionsPage } = await import("./AdminSubmissionsPage");

const pengajuan = {
  id: "s1",
  title: "Turnamen Uji",
  status: "PENDING" as const,
  adminNote: null,
  submittedAt: new Date().toISOString(),
  reviewedAt: null,
  startDate: "2027-01-01T00:00:00.000Z",
  endDate: "2027-01-03T00:00:00.000Z",
  teamCount: 16,
  prizePool: "Rp5.000.000",
  game: { id: "g1", title: "Valorant", slug: "valorant" },
  organizerName: "Penyelenggara Uji",
  submitter: { name: "Tika", username: "tika", email: "tika@playora.id" },
};

beforeEach(() => {
  vi.clearAllMocks();
  useAdminSubmissions.mockReturnValue({
    data: { items: [pengajuan], total: 1, page: 1, limit: 12 },
    isPending: false,
    isError: false,
    error: null,
    refetch: vi.fn(),
  });
  useSubmissionDetail.mockReturnValue({
    data: {
      ...pengajuan,
      description: "Deskripsi lengkap turnamen uji yang diajukan pengguna.",
      registrationUrl: "https://contoh.id/daftar",
      contact: "08123456789",
      registrationMethod: "Online",
      registrationDeadline: "2026-12-20T00:00:00.000Z",
      format: "5v5",
      requirements: "Pemain minimal rank Diamond.",
      reviewer: null,
      tournament: null,
    },
    isPending: false,
    isError: false,
  });
});

describe("AdminSubmissionsPage", () => {
  it("menampilkan detail pengajuan setelah tombol detail ditekan", () => {
    render(
      <MemoryRouter>
        <AdminSubmissionsPage />
      </MemoryRouter>,
    );

    expect(screen.queryByTestId("detail-pengajuan")).toBeNull();

    fireEvent.click(screen.getByTestId("lihat-detail-pengajuan"));

    expect(screen.getByTestId("detail-pengajuan")).toBeTruthy();
    expect(
      screen.getByText("Deskripsi lengkap turnamen uji yang diajukan pengguna."),
    ).toBeTruthy();
    expect(screen.getByText(/Pemain minimal rank Diamond/)).toBeTruthy();
  });

  it("dapat menyembunyikan detail kembali", () => {
    render(
      <MemoryRouter>
        <AdminSubmissionsPage />
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByTestId("lihat-detail-pengajuan"));
    expect(screen.getByTestId("detail-pengajuan")).toBeTruthy();

    fireEvent.click(screen.getByTestId("lihat-detail-pengajuan"));
    expect(screen.queryByTestId("detail-pengajuan")).toBeNull();
  });
});
