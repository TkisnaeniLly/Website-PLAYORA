import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { EmptyState, ErrorState, GameSkeletonGrid } from "./States";

describe("EmptyState", () => {
  it("menampilkan judul dan deskripsi", () => {
    render(<EmptyState judul="Tidak ada hasil" deskripsi="Coba kata kunci lain." />);

    expect(screen.getByText("Tidak ada hasil")).toBeInTheDocument();
    expect(screen.getByText("Coba kata kunci lain.")).toBeInTheDocument();
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("memanggil aksi saat tombol ditekan", async () => {
    const aksi = vi.fn();
    const pengguna = userEvent.setup();

    render(<EmptyState judul="Kosong" aksi={{ label: "Hapus filter", onClick: aksi }} />);
    await pengguna.click(screen.getByRole("button", { name: "Hapus filter" }));

    expect(aksi).toHaveBeenCalledOnce();
  });
});

describe("ErrorState", () => {
  it("memakai role alert dan menampilkan pesan", () => {
    render(<ErrorState pesan="Server tidak merespons." />);

    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(screen.getByText("Server tidak merespons.")).toBeInTheDocument();
  });

  it("memanggil onRetry saat tombol Coba lagi ditekan", async () => {
    const ulang = vi.fn();
    const pengguna = userEvent.setup();

    render(<ErrorState pesan="Gagal" onRetry={ulang} />);
    await pengguna.click(screen.getByRole("button", { name: "Coba lagi" }));

    expect(ulang).toHaveBeenCalledOnce();
  });
});

describe("GameSkeletonGrid", () => {
  it("menampilkan jumlah kerangka sesuai permintaan", () => {
    const { container } = render(<GameSkeletonGrid jumlah={4} />);
    expect(container.querySelectorAll(".animate-pulse").length).toBe(12);
    expect(screen.getByTestId("loading-state")).toBeInTheDocument();
  });
});
