import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { EmptyState, ErrorState } from "@/components/ui/States";
import { Pagination } from "@/components/ui/Pagination";
import { DiscordRoomSection } from "@/components/discord/DiscordRoomSection";
import { useAuth } from "@/hooks/useAuth";
import {
  useCommunityPosts,
  useCreateCommunityPost,
  useToggleCommunityLike,
} from "@/hooks/useCommunity";
import { extractApiError } from "@/lib/api";
import {
  BATAS_KOMUNITAS,
  DAFTAR_KATEGORI_KOMUNITAS,
  LABEL_KATEGORI_KOMUNITAS,
  WARNA_KATEGORI_KOMUNITAS,
  inisial,
  waktuRelatif,
} from "@/lib/community";
import type { CommunityCategory, CommunityPostItem } from "@/types/community";

function Avatar({ post }: { post: CommunityPostItem }) {
  return post.author.avatarUrl ? (
    <img
      src={post.author.avatarUrl}
      alt={`Avatar ${post.author.name}`}
      className="h-9 w-9 rounded-full border border-line object-cover"
    />
  ) : (
    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#262246] text-xs font-bold text-white">
      {inisial(post.author.name)}
    </span>
  );
}

function KartuPost({ post }: { post: CommunityPostItem }) {
  const suka = useToggleCommunityLike();
  const { data: pengguna } = useAuth();

  return (
    <article
      data-testid="kartu-post"
      className="rounded-[var(--radius-card)] border border-line bg-gradient-to-br from-[#171a34] to-[#111528] p-4 transition-colors hover:border-[#7845e9]"
    >
      <div className="flex items-center gap-3">
        <Avatar post={post} />
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-white">{post.author.name}</p>
          <p className="text-[11px] text-navy-400">
            @{post.author.username} · {waktuRelatif(post.createdAt)}
          </p>
        </div>
        <span
          className={`ml-auto rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide ${WARNA_KATEGORI_KOMUNITAS[post.category]}`}
        >
          {LABEL_KATEGORI_KOMUNITAS[post.category]}
        </span>
      </div>

      <Link to={`/community/${post.id}`} className="mt-3 block">
        <h3 className="text-base font-bold leading-snug text-white hover:text-[#c9b8ff]">
          {post.title}
        </h3>
        <p className="mt-1.5 line-clamp-3 text-sm leading-relaxed text-navy-300">{post.body}</p>
      </Link>

      {post.imageUrl ? (
        <img
          src={post.imageUrl}
          alt=""
          loading="lazy"
          className="mt-3 max-h-64 w-full rounded-xl border border-line object-cover"
        />
      ) : null}

      <div className="mt-3 flex items-center gap-4 text-xs">
        <button
          type="button"
          data-testid="tombol-suka-post"
          disabled={!pengguna || suka.isPending}
          onClick={() => suka.mutate(post.id)}
          className={[
            "flex items-center gap-1.5 font-semibold transition-colors",
            post.likedByMe ? "text-accent-pink" : "text-navy-400 hover:text-white",
            !pengguna ? "cursor-not-allowed opacity-70" : "",
          ].join(" ")}
          title={pengguna ? "Suka postingan" : "Masuk untuk menyukai"}
        >
          {post.likedByMe ? "♥" : "♡"} {post.likeCount}
        </button>

        <Link
          to={`/community/${post.id}`}
          className="flex items-center gap-1.5 font-semibold text-navy-400 hover:text-white"
        >
          💬 {post.commentCount}
        </Link>

        <Link to={`/community/${post.id}`} className="pl-link ml-auto">
          Buka diskusi →
        </Link>
      </div>
    </article>
  );
}

export function CommunityPage() {
  const { data: pengguna } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const kategori = (searchParams.get("kategori") ?? "") as CommunityCategory | "";
  const urut = (searchParams.get("urut") ?? "terbaru") as "terbaru" | "populer";
  const q = searchParams.get("q") ?? "";
  const pageMentah = Number.parseInt(searchParams.get("page") ?? "1", 10);
  const page = Number.isFinite(pageMentah) && pageMentah > 0 ? pageMentah : 1;

  const [kataKunci, setKataKunci] = useState(q);
  const [judul, setJudul] = useState("");
  const [isi, setIsi] = useState("");
  const [kategoriBaru, setKategoriBaru] = useState<CommunityCategory>("DISKUSI");
  const [gambar, setGambar] = useState("");

  const daftar = useCommunityPosts({
    category: kategori,
    q,
    sort: urut,
    page,
    limit: BATAS_KOMUNITAS,
  });
  const buat = useCreateCommunityPost();

  const items = daftar.data?.items ?? [];
  const totalHalaman = Math.max(1, Math.ceil((daftar.data?.total ?? 0) / BATAS_KOMUNITAS));

  function ubahParam(perubahan: Record<string, string>) {
    setSearchParams(
      (sebelumnya) => {
        const berikut = new URLSearchParams(sebelumnya);
        for (const [kunci, nilai] of Object.entries(perubahan)) {
          if (nilai) berikut.set(kunci, nilai);
          else berikut.delete(kunci);
        }
        berikut.delete("page");
        return berikut;
      },
      { replace: true },
    );
  }

  function kirim(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    buat.mutate(
      {
        title: judul,
        body: isi,
        category: kategoriBaru,
        imageUrl: gambar.trim() || undefined,
      },
      {
        onSuccess: () => {
          setJudul("");
          setIsi("");
          setGambar("");
          setKategoriBaru("DISKUSI");
        },
      },
    );
  }

  const galat = buat.error ? extractApiError(buat.error) : null;

  return (
    <section className="playora-container py-6 sm:py-8" data-testid="halaman-komunitas">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <span className="pl-eyebrow">Komunitas</span>
          <h1 className="pl-title mt-3">Ruang diskusi gamer</h1>
          <p className="mt-2 max-w-2xl text-sm text-navy-400">
            Bagikan tips, bahas turnamen, dan temukan teman bermain sesama gamer PLAYORA.
          </p>
        </div>

        <p className="text-sm text-navy-400" data-testid="jumlah-post">
          {daftar.data ? `${daftar.data.total} diskusi` : "Memuat…"}
        </p>
      </header>

      <DiscordRoomSection />

      {pengguna ? (
        <form
          onSubmit={kirim}
          data-testid="form-post"
          className="mt-5 space-y-3 rounded-[var(--radius-card)] border border-line bg-gradient-to-br from-[#171a34] to-[#111528] p-4"
        >
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#262246] text-xs font-bold text-white">
              {inisial(pengguna.name)}
            </span>
            <p className="text-sm font-semibold text-white">Tulis postingan baru</p>
          </div>

          <div className="grid gap-3 sm:grid-cols-[1fr_180px]">
            <input
              value={judul}
              onChange={(e) => setJudul(e.target.value)}
              placeholder="Judul diskusi…"
              aria-label="Judul postingan"
              required
              minLength={5}
              maxLength={200}
              className="pl-input"
            />
            <select
              value={kategoriBaru}
              onChange={(e) => setKategoriBaru(e.target.value as CommunityCategory)}
              aria-label="Kategori postingan"
              className="pl-input"
            >
              {DAFTAR_KATEGORI_KOMUNITAS.map((nilai) => (
                <option key={nilai} value={nilai}>
                  {LABEL_KATEGORI_KOMUNITAS[nilai]}
                </option>
              ))}
            </select>
          </div>

          <textarea
            value={isi}
            onChange={(e) => setIsi(e.target.value)}
            placeholder="Apa yang ingin kamu bahas?"
            aria-label="Isi postingan"
            required
            minLength={10}
            maxLength={5000}
            rows={3}
            className="pl-input"
          />

          <input
            value={gambar}
            onChange={(e) => setGambar(e.target.value)}
            placeholder="URL gambar (opsional)"
            aria-label="URL gambar"
            className="pl-input"
          />

          {galat ? (
            <p role="alert" className="text-xs font-medium text-danger">
              {galat.message}
              {galat.details.length > 0 ? ` — ${galat.details[0]?.message}` : ""}
            </p>
          ) : null}

          <div className="flex items-center justify-between gap-3">
            <p className="text-[11px] text-navy-400">Minimal judul 5 karakter dan isi 10 karakter.</p>
            <button type="submit" disabled={buat.isPending} className="pl-btn">
              {buat.isPending ? "Mengirim…" : "Kirim postingan"}
            </button>
          </div>
        </form>
      ) : (
        <div className="mt-5 rounded-[var(--radius-card)] border border-line bg-[#111528] px-4 py-5 text-center">
          <p className="text-sm text-navy-300">
            Masuk untuk ikut berdiskusi, menyukai, dan berkomentar.
          </p>
          <div className="mt-3 flex justify-center gap-2">
            <Link to="/login" className="pl-btn">
              Masuk
            </Link>
            <Link to="/register" className="pl-btn-outline">
              Daftar
            </Link>
          </div>
        </div>
      )}

      <div className="mt-6 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => ubahParam({ kategori: "" })}
          className={[
            "rounded-full px-3 py-1.5 text-xs font-semibold",
            !kategori ? "bg-gradient-to-r from-[#7135f5] to-[#8b35f4] text-white" : "border border-line bg-[#1d1b36] text-navy-300",
          ].join(" ")}
        >
          Semua
        </button>
        {DAFTAR_KATEGORI_KOMUNITAS.map((nilai) => (
          <button
            key={nilai}
            type="button"
            onClick={() => ubahParam({ kategori: nilai })}
            className={[
              "rounded-full px-3 py-1.5 text-xs font-semibold",
              kategori === nilai
                ? "bg-gradient-to-r from-[#7135f5] to-[#8b35f4] text-white"
                : "border border-line bg-[#1d1b36] text-navy-300 hover:text-white",
            ].join(" ")}
          >
            {LABEL_KATEGORI_KOMUNITAS[nilai]}
          </button>
        ))}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <form
          onSubmit={(event) => {
            event.preventDefault();
            ubahParam({ q: kataKunci.trim() });
          }}
          className="flex flex-1 items-center gap-2"
        >
          <input
            value={kataKunci}
            onChange={(e) => setKataKunci(e.target.value)}
            placeholder="Cari diskusi…"
            aria-label="Cari diskusi"
            data-testid="cari-post"
            className="pl-input max-w-sm"
          />
          <button type="submit" className="pl-btn-ghost">
            Cari
          </button>
        </form>

        <select
          value={urut}
          onChange={(e) => ubahParam({ urut: e.target.value })}
          aria-label="Urutkan postingan"
          className="pl-input max-w-[160px]"
        >
          <option value="terbaru">Terbaru</option>
          <option value="populer">Paling disukai</option>
        </select>
      </div>

      <div className="mt-4 space-y-3">
        {daftar.isPending ? (
          <div data-testid="loading-state" className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-40 animate-pulse rounded-[var(--radius-card)] bg-[#1d1b36]" />
            ))}
          </div>
        ) : daftar.isError ? (
          <ErrorState
            pesan={daftar.error ? extractApiError(daftar.error).message : "Terjadi kesalahan."}
            onRetry={() => void daftar.refetch()}
          />
        ) : items.length === 0 ? (
          <EmptyState
            judul="Belum ada diskusi"
            deskripsi="Jadilah yang pertama membuka topik di komunitas PLAYORA."
          />
        ) : (
          items.map((post) => <KartuPost key={post.id} post={post} />)
        )}
      </div>

      <Pagination
        page={page}
        totalPages={totalHalaman}
        onChange={(baru) => ubahParam({ page: baru > 1 ? String(baru) : "" })}
      />
    </section>
  );
}
