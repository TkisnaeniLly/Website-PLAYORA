import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { EmptyState, ErrorState } from "@/components/ui/States";
import { AdminStatCard } from "@/components/admin/AdminUI";
import { Pagination } from "@/components/ui/Pagination";
import { useAdminUsers, useUpdateAdminUser } from "@/hooks/useAdmin";
import { useAdminReports } from "@/hooks/useReports";
import { BATAS_ADMIN, formatTanggal } from "@/lib/admin";
import { extractApiError } from "@/lib/api";
import type { AdminUserItem } from "@/types/admin";

export function AdminUsersPage() {
  const [searchParams] = useSearchParams();
  const qUrl = searchParams.get("q") ?? "";
  const [q, setQ] = useState(qUrl);
  const [role, setRole] = useState<"" | "USER" | "ADMIN">("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    setQ(qUrl);
    setPage(1);
  }, [qUrl]);

  const daftar = useAdminUsers({ q, role: role || undefined, page, limit: BATAS_ADMIN });
  const ubah = useUpdateAdminUser();
  const laporan = useAdminReports();

  const items = daftar.data?.items ?? [];
  const totalHalaman = Math.max(1, Math.ceil((daftar.data?.total ?? 0) / BATAS_ADMIN));

  function ubahPeran(item: AdminUserItem, nilai: "USER" | "ADMIN") {
    if (nilai === item.role) return;
    ubah.mutate({ id: item.id, data: { role: nilai } });
  }

  function ubahAktif(item: AdminUserItem) {
    const aktif = !item.isActive;
    const pesan = aktif
      ? `Aktifkan kembali akun “${item.name}”?`
      : `Nonaktifkan akun “${item.name}”? Semua sesinya akan dikeluarkan.`;

    if (window.confirm(pesan)) {
      ubah.mutate({ id: item.id, data: { isActive: aktif } });
    }
  }

  return (
    <section className="space-y-5" data-testid="halaman-admin-pengguna">
      <header>
        <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-white">Kelola pengguna</h1>
        <p className="mt-2 text-sm text-[#9d9ac2]">
          Ubah peran dan status aktif akun. Menonaktifkan akun akan mengeluarkan semua sesinya.
        </p>
      </header>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4" data-testid="statistik-pengguna">
        <AdminStatCard
          label="Total pengguna"
          nilai={laporan.data?.users.total ?? "\u2014"}
          keterangan="Seluruh akun terdaftar"
        />
        <AdminStatCard
          label="Pengguna aktif"
          nilai={
            laporan.data
              ? laporan.data.users.total - (laporan.data.users.total - laporan.data.users.regular)
              : "\u2014"
          }
          keterangan="Akun dengan akses aktif"
          aksen="#35c98a"
        />
        <AdminStatCard
          label="Admin"
          nilai={laporan.data?.users.admins ?? "\u2014"}
          keterangan="Pengelola platform"
          aksen="#ffc857"
        />
        <AdminStatCard
          label="Baru (30 hari)"
          nilai={laporan.data?.users.newLast30Days ?? "\u2014"}
          keterangan="Pendaftar terbaru"
          aksen="#657bff"
        />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <input
          type="search"
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setPage(1);
          }}
          placeholder="Cari nama, username, atau surel…"
          data-testid="cari-pengguna"
          className="rounded-[var(--radius-control)] border border-[#26264F] bg-[#161839] px-3 py-2.5 text-sm"
        />

        <select
          value={role}
          onChange={(e) => {
            setRole(e.target.value as "" | "USER" | "ADMIN");
            setPage(1);
          }}
          data-testid="filter-peran-pengguna"
          className="rounded-[var(--radius-control)] border border-[#26264F] bg-[#161839] px-3 py-2.5 text-sm"
        >
          <option value="">Semua peran</option>
          <option value="USER">User</option>
          <option value="ADMIN">Admin</option>
        </select>
      </div>

      {ubah.error ? (
        <p role="alert" data-testid="galat-pengguna" className="mt-3 text-sm font-medium text-danger">
          {extractApiError(ubah.error).message}
        </p>
      ) : null}

      <div className="rounded-2xl border border-[#26264F] bg-[#161839] p-4">
        {daftar.isPending ? (
          <div data-testid="loading-state" className="space-y-2">
            <div className="h-16 animate-pulse rounded-[var(--radius-card)] bg-[#1d1b36]" />
            <div className="h-16 animate-pulse rounded-[var(--radius-card)] bg-[#1d1b36]" />
          </div>
        ) : daftar.isError ? (
          <ErrorState
            pesan={daftar.error ? extractApiError(daftar.error).message : "Terjadi kesalahan."}
            onRetry={() => void daftar.refetch()}
          />
        ) : items.length === 0 ? (
          <EmptyState
            judul="Pengguna tidak ditemukan"
            deskripsi="Tidak ada pengguna yang cocok dengan pencarian atau filter."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm" data-testid="tabel-pengguna">
              <thead>
                <tr className="border-b border-[#26264F] text-xs uppercase tracking-wide text-[#9d9ac2]">
                  <th className="py-2 pr-3">Pengguna</th>
                  <th className="py-2 pr-3">Peran</th>
                  <th className="py-2 pr-3">Status</th>
                  <th className="py-2 pr-3">Pengajuan</th>
                  <th className="py-2 pr-3">Bergabung</th>
                  <th className="py-2">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id} className="border-b border-[#26264F]/70">
                    <td className="py-3 pr-3">
                      <p className="font-semibold text-white">{item.name}</p>
                      <p className="text-xs text-[#9d9ac2]">
                        @{item.username} · {item.email}
                      </p>
                    </td>
                    <td className="py-3 pr-3">
                      <select
                        value={item.role}
                        onChange={(e) => ubahPeran(item, e.target.value as "USER" | "ADMIN")}
                        data-testid={`peran-${item.username}`}
                        className="rounded-[var(--radius-control)] border border-[#26264F] bg-[#161839] px-2.5 py-1.5 text-xs"
                      >
                        <option value="USER">User</option>
                        <option value="ADMIN">Admin</option>
                      </select>
                    </td>
                    <td className="py-3 pr-3">
                      <span
                        className={[
                          "rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide",
                          item.isActive ? "bg-success/15 text-success" : "bg-danger/15 text-danger",
                        ].join(" ")}
                      >
                        {item.isActive ? "Aktif" : "Nonaktif"}
                      </span>
                    </td>
                    <td className="py-3 pr-3 text-[#cbc5e6]">{item._count.submissions}</td>
                    <td className="py-3 pr-3 text-xs text-[#9d9ac2]">{formatTanggal(item.createdAt)}</td>
                    <td className="py-3">
                      <button
                        type="button"
                        data-testid={`aktif-pengguna-${item.username}`}
                        onClick={() => ubahAktif(item)}
                        className={[
                          "rounded-[var(--radius-control)] border px-2.5 py-1.5 text-xs font-semibold",
                          item.isActive
                            ? "border-[#26264F] bg-[#161839] text-danger"
                            : "border-[#26264F] bg-[#161839] text-white",
                        ].join(" ")}
                      >
                        {item.isActive ? "Nonaktifkan" : "Aktifkan"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Pagination page={page} totalPages={totalHalaman} onChange={setPage} />
    </section>
  );
}
