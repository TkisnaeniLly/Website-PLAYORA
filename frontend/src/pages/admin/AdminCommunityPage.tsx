import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { AdminDiscordRoomsPage } from "./AdminDiscordRoomsPage";
import { AdminStatCard } from "@/components/admin/AdminUI";
import { EmptyState, ErrorState } from "@/components/ui/States";
import { Pagination } from "@/components/ui/Pagination";
import { useAdminCommunityPosts, useSetCommunityHidden } from "@/hooks/useCommunity";
import { useAdminReports } from "@/hooks/useReports";
import { extractApiError } from "@/lib/api";
import {
  BATAS_KOMUNITAS,
  LABEL_KATEGORI_KOMUNITAS,
  WARNA_KATEGORI_KOMUNITAS,
  waktuRelatif,
} from "@/lib/community";

const TAB = [
  { kunci: "postingan", label: "Postingan" },
  { kunci: "discord", label: "Ruang Discord" },
] as const;

type TabKomunitas = (typeof TAB)[number]["kunci"];

export function AdminCommunityPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const qUrl = searchParams.get("q") ?? "";

  const tabMentah = searchParams.get("tab") ?? "postingan";
  const tab: TabKomunitas = TAB.some((item) => item.kunci === tabMentah)
    ? (tabMentah as TabKomunitas)
    : "postingan";

  function ubahTab(nilai: TabKomunitas) {
    setSearchParams(
      (sebelumnya) => {
        const berikut = new URLSearchParams(sebelumnya);
        if (nilai === "postingan") berikut.delete("tab");
        else berikut.set("tab", nilai);
        berikut.delete("page");
        return berikut;
      },
      { replace: true },
    );
  }

  const [q, setQ] = useState(qUrl);
  const [page, setPage] = useState(1);
  const laporan = useAdminReports();

  useEffect(() => {
    setQ(qUrl);
    setPage(1);
  }, [qUrl]);

  const daftar = useAdminCommunityPosts({ q, page, limit: BATAS_KOMUNITAS });
  const sembunyi = useSetCommunityHidden();

  const items = daftar.data?.items ?? [];
  const totalHalaman = Math.max(1, Math.ceil((daftar.data?.total ?? 0) / BATAS_KOMUNITAS));

  return (
    <section className="space-y-5" data-testid="halaman-admin-komunitas">
      <header>
        <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-white">Kelola komunitas</h1>
        <p className="mt-2 text-sm text-navy-400">
          Moderasi postingan komunitas dan validasi pengajuan ruang Discord sebelum tampil
          di halaman anggota.
        </p>
      </header>

      <div
        role="tablist"
        aria-label="Tab pengelolaan komunitas"
        className="flex flex-wrap gap-2 border-b border-[#26264F] pb-3"
      >
        {TAB.map((item) => {
          const aktif = tab === item.kunci;
          return (
            <button
              key={item.kunci}
              type="button"
              role="tab"
              aria-selected={aktif}
              data-testid={`tab-komunitas-${item.kunci}`}
              onClick={() => ubahTab(item.kunci)}
              className={[
                "rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors",
                aktif
                  ? "bg-gradient-to-r from-[#7135f5] to-[#8b35f4] text-white"
                  : "border border-[#26264F] bg-[#1d1b36] text-navy-300 hover:text-white",
              ].join(" ")}
            >
              {item.label}
            </button>
          );
        })}
      </div>

      {tab === "discord" ? (
        <AdminDiscordRoomsPage tanpaHeader />
      ) : (
        <>
      <div className="grid gap-3 sm:grid-cols-3" data-testid="statistik-komunitas">
        <AdminStatCard
          label="Total diskusi"
          nilai={laporan.data?.content.community.posts ?? "\u2014"}
          keterangan="Postingan komunitas"
        />
        <AdminStatCard
          label="Komentar"
          nilai={laporan.data?.content.community.comments ?? "\u2014"}
          keterangan="Tanggapan anggota"
          aksen="#657bff"
        />
        <AdminStatCard
          label="Suka"
          nilai={laporan.data?.content.community.likes ?? "\u2014"}
          keterangan="Interaksi postingan"
          aksen="#ff7ac6"
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <input
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setPage(1);
          }}
          placeholder="Cari judul postingan…"
          aria-label="Cari postingan"
          data-testid="cari-post-admin"
          className="pl-input max-w-sm"
        />
        <p className="text-sm text-navy-400">{daftar.data ? `${daftar.data.total} postingan` : "Memuat…"}</p>
      </div>

      {sembunyi.error ? (
        <p role="alert" className="mt-3 text-sm font-medium text-danger">
          {extractApiError(sembunyi.error).message}
        </p>
      ) : null}

      <div className="rounded-2xl border border-[#26264F] bg-[#161839] p-4">
        {daftar.isPending ? (
          <div data-testid="loading-state" className="space-y-2">
            <div className="h-20 animate-pulse rounded-[var(--radius-card)] bg-[#1d1b36]" />
          </div>
        ) : daftar.isError ? (
          <ErrorState
            pesan={daftar.error ? extractApiError(daftar.error).message : "Terjadi kesalahan."}
            onRetry={() => void daftar.refetch()}
          />
        ) : items.length === 0 ? (
          <EmptyState judul="Belum ada postingan" deskripsi="Belum ada postingan komunitas." />
        ) : (
          <div className="pl-scroll-x">
            <table className="pl-table min-w-[720px]" data-testid="tabel-komunitas">
              <thead>
                <tr>
                  <th>Postingan</th>
                  <th>Kategori</th>
                  <th>Penulis</th>
                  <th>Status</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {items.map((post) => (
                  <tr key={post.id}>
                    <td>
                      <p className="font-semibold text-white">{post.title}</p>
                      <p className="text-[11px] text-navy-400">
                        {waktuRelatif(post.createdAt)} · ♥ {post.likeCount} · 💬 {post.commentCount}
                      </p>
                    </td>
                    <td>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${WARNA_KATEGORI_KOMUNITAS[post.category]}`}
                      >
                        {LABEL_KATEGORI_KOMUNITAS[post.category]}
                      </span>
                    </td>
                    <td className="text-navy-300">@{post.author.username}</td>
                    <td>
                      <span
                        className={[
                          "rounded-full px-2 py-0.5 text-[11px] font-bold uppercase",
                          post.isHidden ? "bg-danger/15 text-danger" : "bg-success/15 text-success",
                        ].join(" ")}
                      >
                        {post.isHidden ? "Disembunyikan" : "Tampil"}
                      </span>
                    </td>
                    <td>
                      <button
                        type="button"
                        data-testid={`sembunyi-${post.id}`}
                        disabled={sembunyi.isPending}
                        onClick={() => sembunyi.mutate({ id: post.id, isHidden: !post.isHidden })}
                        className="pl-btn-ghost"
                      >
                        {post.isHidden ? "Tampilkan" : "Sembunyikan"}
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
        </>
      )}
    </section>
  );
}
