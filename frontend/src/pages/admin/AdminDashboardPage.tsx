import { Link } from "react-router-dom";
import { AdminBadge, AdminPageHeader, AdminPanel, AdminStatCard } from "@/components/admin/AdminUI";
import { EmptyState } from "@/components/ui/States";
import { useAdminDashboard } from "@/hooks/useAdmin";
import { useAuth } from "@/hooks/useAuth";
import { LABEL_STATUS_PENGAJUAN, formatTanggal } from "@/lib/admin";
import { waktuRelatif } from "@/lib/community";
import { extractApiError } from "@/lib/api";

function nadaStatus(status: string): "sukses" | "peringatan" | "bahaya" | "netral" {
  if (status === "APPROVED") return "sukses";
  if (status === "REJECTED") return "bahaya";
  if (status === "PENDING" || status === "NEEDS_REVISION") return "peringatan";
  return "netral";
}

export function AdminDashboardPage() {
  const { data: pengguna } = useAuth();
  const { data, isPending, isError, error } = useAdminDashboard();

  if (isPending) {
    return (
      <div data-testid="loading-state" className="space-y-3">
        <div className="h-16 animate-pulse rounded-2xl bg-[#1d1b36]" />
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, indeks) => (
            <div key={indeks} className="h-28 animate-pulse rounded-2xl bg-[#1d1b36]" />
          ))}
        </div>
        <div className="h-64 animate-pulse rounded-2xl bg-[#1d1b36]" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <section className="py-16 text-center">
        <h1 className="text-xl font-bold text-[#ff647c]">Gagal memuat ringkasan</h1>
        <p className="mt-2 text-sm text-[#9d9ac2]">
          {error ? extractApiError(error).message : "Terjadi kesalahan."}
        </p>
      </section>
    );
  }

  const totalPengajuan =
    data.submissions.pending +
    data.submissions.needsRevision +
    data.submissions.approved +
    data.submissions.rejected;

  const distribusi = [
    { label: "Game", total: data.games.total, terbit: data.games.published, warna: "#35c98a" },
    { label: "Artikel", total: data.articles.total, terbit: data.articles.published, warna: "#657bff" },
    {
      label: "Turnamen",
      total: data.tournaments.total,
      terbit: data.tournaments.published,
      warna: "#ffc857",
    },
    { label: "Pengguna", total: data.users.total, terbit: data.users.active, warna: "#a56aff" },
  ];
  const maksDistribusi = Math.max(1, ...distribusi.map((item) => item.total));

  return (
    <section className="space-y-5" data-testid="halaman-dashboard-admin">
      <AdminPageHeader
        judul="Dashboard"
        deskripsi={`Selamat datang, ${pengguna?.name ?? "Admin"}! Berikut ringkasan platform hari ini.`}
        aksi={
          <Link to="/admin/reports" className="pl-btn-ghost text-xs">
            Lihat laporan
          </Link>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <AdminStatCard
          label="Total Game"
          nilai={data.games.total}
          keterangan={`${data.games.published} terbit`}
          aksen="#35c98a"
        />
        <AdminStatCard
          label="Total Artikel"
          nilai={data.articles.total}
          keterangan={`${data.articles.published} terbit`}
          aksen="#657bff"
        />
        <AdminStatCard
          label="Total Turnamen"
          nilai={data.tournaments.total}
          keterangan={`${data.tournaments.published} terbit`}
          aksen="#ffc857"
        />
        <AdminStatCard
          label="Total Pengguna"
          nilai={data.users.total}
          keterangan={`${data.users.active} aktif`}
          aksen="#a56aff"
        />
      </div>

      <div className="grid min-w-0 gap-4 xl:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)]">
        <AdminPanel className="p-4" data-testid="aktivitas-platform">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="text-sm font-bold text-white">Aktivitas Platform</h2>
              <p className="mt-0.5 text-[11px] text-[#8f88b8]">
                Perbandingan data terkelola dan yang sudah terbit.
              </p>
            </div>
            <Link to="/admin/reports" className="text-[11px] font-semibold text-[#a56aff] hover:underline">
              Detail statistik
            </Link>
          </div>

          <div className="mt-5 space-y-4">
            {distribusi.map((item) => (
              <div key={item.label}>
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-[#cbc5e6]">{item.label}</span>
                  <span className="text-[#8f88b8]">
                    {item.terbit} / {item.total}
                  </span>
                </div>
                <div className="mt-1.5 h-2.5 overflow-hidden rounded-full bg-[#11132B]">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${Math.max(2, (item.total / maksDistribusi) * 100)}%`,
                      background: item.warna,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-5 grid gap-2 sm:grid-cols-3">
            <Link
              to="/admin/tournaments?tab=pengajuan"
              className="rounded-xl border border-[#26264F] bg-[#11132B] px-3 py-2.5 transition-colors hover:border-[#7135f5]"
            >
              <p className="text-[10px] uppercase tracking-wide text-[#8f88b8]">Pengajuan</p>
              <p className="mt-1 text-lg font-extrabold text-white">{totalPengajuan}</p>
              <p className="text-[10px] text-[#8f88b8]">{data.submissions.pending} menunggu</p>
            </Link>
            <Link
              to="/admin/tournaments"
              className="rounded-xl border border-[#26264F] bg-[#11132B] px-3 py-2.5 transition-colors hover:border-[#7135f5]"
            >
              <p className="text-[10px] uppercase tracking-wide text-[#8f88b8]">Hasil menunggu</p>
              <p className="mt-1 text-lg font-extrabold text-white">{data.pendingReviewResults}</p>
              <p className="text-[10px] text-[#8f88b8]">perlu tinjauan</p>
            </Link>
            <Link
              to="/admin/community?tab=discord"
              className="rounded-xl border border-[#26264F] bg-[#11132B] px-3 py-2.5 transition-colors hover:border-[#5865F2]"
            >
              <p className="text-[10px] uppercase tracking-wide text-[#8f88b8]">Notifikasi</p>
              <p className="mt-1 text-lg font-extrabold text-white">{data.notifications}</p>
              <p className="text-[10px] text-[#8f88b8]">tersimpan</p>
            </Link>
          </div>
        </AdminPanel>

        <AdminPanel className="p-4" data-testid="aktivitas-terbaru">
          <h2 className="text-sm font-bold text-white">Aktivitas Terbaru</h2>
          <p className="mt-0.5 text-[11px] text-[#8f88b8]">Pengajuan turnamen terakhir.</p>

          {data.recentSubmissions.length === 0 ? (
            <div className="mt-3">
              <EmptyState
                judul="Belum ada pengajuan"
                deskripsi="Pengajuan baru akan muncul di sini."
              />
            </div>
          ) : (
            <ul className="mt-3 space-y-2" data-testid="daftar-pengajuan-terbaru">
              {data.recentSubmissions.map((item) => (
                <li
                  key={item.id}
                  className="rounded-xl border border-[#26264F] bg-[#11132B] px-3 py-2.5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="min-w-0 truncate text-sm font-semibold text-white">
                      {item.title}
                    </p>
                    <AdminBadge nada={nadaStatus(item.status)}>
                      {LABEL_STATUS_PENGAJUAN[item.status] ?? item.status}
                    </AdminBadge>
                  </div>
                  <p className="mt-1 text-[10px] text-[#8f88b8]">
                    {item.submitter.name} \u00b7 {waktuRelatif(item.submittedAt)}
                  </p>
                </li>
              ))}
            </ul>
          )}

          <div className="mt-4 grid gap-2">
            <Link
              to="/admin/tournaments?tab=perubahan"
              className="flex items-center justify-between rounded-xl border border-[#26264F] bg-[#11132B] px-3 py-2.5 text-xs text-[#cbc5e6] hover:border-[#7135f5]"
            >
              Tinjauan perubahan turnamen
              <span aria-hidden="true">\u2192</span>
            </Link>
            <Link
              to="/admin/community"
              className="flex items-center justify-between rounded-xl border border-[#26264F] bg-[#11132B] px-3 py-2.5 text-xs text-[#cbc5e6] hover:border-[#7135f5]"
            >
              Moderasi komunitas & ruang Discord
              <span aria-hidden="true">\u2192</span>
            </Link>
          </div>
        </AdminPanel>
      </div>

      <p className="text-[11px] text-[#6f6b9a]" data-testid="tanggal-ringkasan">
        Ringkasan per {formatTanggal(new Date().toISOString())}
      </p>
    </section>
  );
}
