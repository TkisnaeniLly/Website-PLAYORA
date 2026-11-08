import { useState } from "react";
import { AdminBadge, AdminPageHeader, AdminPanel, AdminStatCard } from "@/components/admin/AdminUI";
import { ErrorState } from "@/components/ui/States";
import { useAdminReports } from "@/hooks/useReports";
import { extractApiError } from "@/lib/api";

const WARNA_BAR = {
  users: "#a56aff",
  posts: "#657bff",
  submissions: "#ff7ac6",
};

export function AdminReportsPage() {
  const [hari, setHari] = useState<7 | 14>(14);
  const laporan = useAdminReports();

  if (laporan.isPending) {
    return (
      <div data-testid="loading-state" className="space-y-3">
        <div className="h-16 animate-pulse rounded-2xl bg-[#1d1b36]" />
        <div className="h-64 animate-pulse rounded-2xl bg-[#1d1b36]" />
      </div>
    );
  }

  if (laporan.isError || !laporan.data) {
    return (
      <ErrorState
        pesan={laporan.error ? extractApiError(laporan.error).message : "Terjadi kesalahan."}
        onRetry={() => void laporan.refetch()}
      />
    );
  }

  const data = laporan.data;
  const aktivitas = data.activity.slice(-hari);
  const maks = Math.max(
    1,
    ...aktivitas.map((titik) => titik.users + titik.posts + titik.submissions),
  );

  const totalKonten =
    data.content.games.total +
    data.content.articles.total +
    data.content.tournaments.total +
    data.content.community.posts;

  return (
    <section className="space-y-5" data-testid="halaman-admin-laporan">
      <AdminPageHeader
        judul="Statistik & Laporan"
        deskripsi="Ringkasan data platform PLAYORA yang tersedia saat ini."
        aksi={
          <select
            value={hari}
            onChange={(event) => setHari(Number(event.target.value) as 7 | 14)}
            aria-label="Rentang aktivitas"
            data-testid="filter-rentang-laporan"
            className="pl-input h-10 w-auto py-0 text-xs"
          >
            <option value={7}>7 hari terakhir</option>
            <option value={14}>14 hari terakhir</option>
          </select>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <AdminStatCard
          label="Total Pengguna"
          nilai={data.users.total}
          keterangan={`${data.users.admins} admin \u00b7 ${data.users.regular} pengguna`}
        />
        <AdminStatCard
          label="Total Artikel"
          nilai={data.content.articles.total}
          keterangan={`${data.content.articles.published} terbit`}
          aksen="#657bff"
        />
        <AdminStatCard
          label="Total Turnamen"
          nilai={data.content.tournaments.total}
          keterangan={`${data.content.tournaments.published} terbit`}
          aksen="#ffc857"
        />
        <AdminStatCard
          label="Total Game"
          nilai={data.content.games.total}
          keterangan={`${data.content.games.published} terbit`}
          aksen="#35c98a"
        />
      </div>

      <div className="grid min-w-0 gap-4 xl:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)]">
        <AdminPanel className="p-4" data-testid="grafik-aktivitas">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="text-sm font-bold text-white">Aktivitas {hari} hari terakhir</h2>
              <p className="mt-0.5 text-[11px] text-[#8f88b8]">
                Pendaftaran pengguna, postingan komunitas, dan pengajuan turnamen.
              </p>
            </div>
            <div className="flex items-center gap-3 text-[10px] text-[#9d9ac2]">
              <span className="flex items-center gap-1.5">
                <i className="h-2 w-2 rounded-sm" style={{ background: WARNA_BAR.users }} />
                Pengguna
              </span>
              <span className="flex items-center gap-1.5">
                <i className="h-2 w-2 rounded-sm" style={{ background: WARNA_BAR.posts }} />
                Postingan
              </span>
              <span className="flex items-center gap-1.5">
                <i className="h-2 w-2 rounded-sm" style={{ background: WARNA_BAR.submissions }} />
                Pengajuan
              </span>
            </div>
          </div>

          <div className="mt-5 flex h-48 items-end gap-1.5 sm:gap-2">
            {aktivitas.map((titik) => {
              const total = titik.users + titik.posts + titik.submissions;
              const tinggi = Math.max(total > 0 ? 8 : 2, (total / maks) * 100);
              const segmen = [
                { kunci: "users", nilai: titik.users, warna: WARNA_BAR.users },
                { kunci: "posts", nilai: titik.posts, warna: WARNA_BAR.posts },
                { kunci: "submissions", nilai: titik.submissions, warna: WARNA_BAR.submissions },
              ].filter((bagian) => bagian.nilai > 0);

              return (
                <div key={titik.date} className="flex h-full flex-1 flex-col justify-end gap-1">
                  <div
                    className="flex w-full flex-col-reverse justify-start overflow-hidden rounded-md"
                    style={{ height: `${tinggi}%` }}
                    title={`${titik.date}: ${titik.users} pengguna, ${titik.posts} postingan, ${titik.submissions} pengajuan`}
                    data-testid={`bar-${titik.date}`}
                  >
                    {segmen.map((bagian) => (
                      <span
                        key={bagian.kunci}
                        style={{
                          background: bagian.warna,
                          flexGrow: bagian.nilai,
                        }}
                      />
                    ))}
                  </div>
                  <span className="text-center text-[9px] text-[#6f6b9a]">
                    {titik.date.slice(8, 10)}
                  </span>
                </div>
              );
            })}
          </div>
        </AdminPanel>

        <div className="grid gap-4">
          <AdminPanel className="p-4" data-testid="ringkasan-komunitas">
            <h2 className="text-sm font-bold text-white">Ringkasan komunitas</h2>
            <div className="mt-3 grid grid-cols-3 gap-2 text-center">
              {[
                { label: "Postingan", nilai: data.content.community.posts },
                { label: "Komentar", nilai: data.content.community.comments },
                { label: "Suka", nilai: data.content.community.likes },
              ].map((item) => (
                <div key={item.label} className="rounded-xl bg-[#11132B] px-2 py-3">
                  <p className="text-lg font-extrabold text-white">{item.nilai}</p>
                  <p className="text-[10px] text-[#8f88b8]">{item.label}</p>
                </div>
              ))}
            </div>

            <h3 className="mt-4 text-xs font-bold uppercase tracking-wide text-[#9d9ac2]">
              Ruang Discord
            </h3>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <AdminBadge nada="sukses">{data.content.discordRooms.approved} tampil</AdminBadge>
              <AdminBadge nada="peringatan">
                {data.content.discordRooms.pending} menunggu
              </AdminBadge>
              <AdminBadge nada="bahaya">{data.content.discordRooms.rejected} ditolak</AdminBadge>
            </div>
          </AdminPanel>

          <AdminPanel className="p-4">
            <h2 className="text-sm font-bold text-white">Total konten terkelola</h2>
            <p className="mt-2 text-3xl font-extrabold text-white">{totalKonten}</p>
            <p className="mt-1 text-[11px] text-[#8f88b8]">
              Game, artikel, turnamen, dan postingan komunitas.
            </p>
          </AdminPanel>
        </div>
      </div>

      <div className="grid min-w-0 gap-4 lg:grid-cols-2">
        <AdminPanel className="p-4" data-testid="game-populer">
          <h2 className="text-sm font-bold text-white">Game populer</h2>
          <p className="mt-0.5 text-[11px] text-[#8f88b8]">Berdasarkan jumlah favorit pengguna.</p>
          <ol className="mt-3 space-y-2">
            {data.topGames.map((game, indeks) => (
              <li
                key={game.id}
                className="flex items-center justify-between gap-3 rounded-xl bg-[#11132B] px-3 py-2.5"
              >
                <div className="flex min-w-0 items-center gap-2.5">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-[#2b2350] text-[11px] font-bold text-[#c9b8ff]">
                    {indeks + 1}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-white">{game.title}</p>
                    <p className="text-[10px] text-[#8f88b8]">{game.articles} artikel terkait</p>
                  </div>
                </div>
                <span className="shrink-0 text-xs font-bold text-[#a56aff]">
                  {game.favorites} favorit
                </span>
              </li>
            ))}
            {data.topGames.length === 0 ? (
              <li className="text-xs text-[#8f88b8]">Belum ada data game.</li>
            ) : null}
          </ol>
        </AdminPanel>

        <AdminPanel className="p-4" data-testid="kontributor-teratas">
          <h2 className="text-sm font-bold text-white">Kontributor teratas</h2>
          <p className="mt-0.5 text-[11px] text-[#8f88b8]">
            Artikel dan postingan komunitas yang dibuat.
          </p>
          <ol className="mt-3 space-y-2">
            {data.topContributors.map((orang, indeks) => (
              <li
                key={orang.id}
                className="flex items-center justify-between gap-3 rounded-xl bg-[#11132B] px-3 py-2.5"
              >
                <div className="flex min-w-0 items-center gap-2.5">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-[#2b2350] text-[11px] font-bold text-[#c9b8ff]">
                    {indeks + 1}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-white">{orang.name}</p>
                    <p className="text-[10px] text-[#8f88b8]">@{orang.username}</p>
                  </div>
                </div>
                <span className="shrink-0 text-xs font-bold text-[#657bff]">
                  {orang.articles} artikel \u00b7 {orang.posts} post
                </span>
              </li>
            ))}
            {data.topContributors.length === 0 ? (
              <li className="text-xs text-[#8f88b8]">Belum ada kontributor.</li>
            ) : null}
          </ol>
        </AdminPanel>
      </div>
    </section>
  );
}
