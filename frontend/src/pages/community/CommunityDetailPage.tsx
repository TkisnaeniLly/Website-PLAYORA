import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import {
  useAddCommunityComment,
  useCommunityPost,
  useDeleteCommunityPost,
  useToggleCommunityLike,
} from "@/hooks/useCommunity";
import { extractApiError } from "@/lib/api";
import {
  LABEL_KATEGORI_KOMUNITAS,
  WARNA_KATEGORI_KOMUNITAS,
  inisial,
  waktuRelatif,
} from "@/lib/community";

export function CommunityDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: pengguna } = useAuth();

  const detail = useCommunityPost(id);
  const suka = useToggleCommunityLike();
  const komentar = useAddCommunityComment(id ?? "");
  const hapus = useDeleteCommunityPost();

  const [isi, setIsi] = useState("");

  if (detail.isPending) {
    return (
      <section className="playora-container py-10" data-testid="loading-state">
        <div className="h-8 w-2/3 animate-pulse rounded bg-[#1d1b36]" />
      </section>
    );
  }

  if (detail.isError || !detail.data) {
    return (
      <section className="playora-container py-16 text-center">
        <h1 className="text-xl font-bold text-danger">Postingan tidak ditemukan</h1>
        <p className="mt-2 text-sm text-navy-400">
          {detail.error ? extractApiError(detail.error).message : "Terjadi kesalahan."}
        </p>
        <Link to="/community" className="pl-btn mt-5 inline-flex">
          Kembali ke komunitas
        </Link>
      </section>
    );
  }

  const post = detail.data;
  const pemilik = pengguna?.id === post.author.id || pengguna?.role === "ADMIN";

  function kirimKomentar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const teks = isi.trim();
    if (teks.length < 2) return;
    komentar.mutate(teks, { onSuccess: () => setIsi("") });
  }

  function hapusPost() {
    if (!window.confirm("Hapus postingan ini? Tindakan tidak dapat dibatalkan.")) return;
    hapus.mutate(post.id, { onSuccess: () => navigate("/community", { replace: true }) });
  }

  const galatKomentar = komentar.error ? extractApiError(komentar.error) : null;

  return (
    <section className="playora-container py-6 sm:py-8" data-testid="detail-post">
      <Link to="/community" className="pl-link">
        ← Komunitas
      </Link>

      <article className="mt-4 rounded-[var(--radius-card)] border border-line bg-gradient-to-br from-[#171a34] to-[#111528] p-5 sm:p-6">
        <div className="flex flex-wrap items-center gap-3">
          {post.author.avatarUrl ? (
            <img
              src={post.author.avatarUrl}
              alt={`Avatar ${post.author.name}`}
              className="h-11 w-11 rounded-full border border-line object-cover"
            />
          ) : (
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#262246] text-sm font-bold text-white">
              {inisial(post.author.name)}
            </span>
          )}

          <div className="min-w-0">
            <p className="text-sm font-semibold text-white">{post.author.name}</p>
            <p className="text-[11px] text-navy-400">
              @{post.author.username} · {waktuRelatif(post.createdAt)}
            </p>
          </div>

          <span
            className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide ${WARNA_KATEGORI_KOMUNITAS[post.category]}`}
          >
            {LABEL_KATEGORI_KOMUNITAS[post.category]}
          </span>

          {pemilik ? (
            <button type="button" onClick={hapusPost} className="ml-auto text-xs font-semibold text-danger hover:underline">
              Hapus postingan
            </button>
          ) : null}
        </div>

        <h1 className="mt-4 text-2xl font-extrabold leading-tight text-white sm:text-3xl">
          {post.title}
        </h1>

        <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-navy-200">{post.body}</p>

        {post.imageUrl ? (
          <img
            src={post.imageUrl}
            alt=""
            className="mt-4 max-h-[420px] w-full rounded-xl border border-line object-cover"
          />
        ) : null}

        <div className="mt-5 flex items-center gap-4 border-t border-line pt-4 text-sm">
          <button
            type="button"
            data-testid="tombol-suka-detail"
            disabled={!pengguna || suka.isPending}
            onClick={() => suka.mutate(post.id)}
            className={[
              "flex items-center gap-1.5 font-semibold",
              post.likedByMe ? "text-accent-pink" : "text-navy-300 hover:text-white",
              !pengguna ? "cursor-not-allowed opacity-70" : "",
            ].join(" ")}
          >
            {post.likedByMe ? "♥" : "♡"} {post.likeCount} suka
          </button>
          <span className="text-navy-400">💬 {post.commentCount} komentar</span>
        </div>
      </article>

      <section className="mt-6" aria-label="Komentar">
        <h2 className="pl-section-title">Komentar</h2>

        {pengguna ? (
          <form onSubmit={kirimKomentar} className="mt-3 flex flex-col gap-2 sm:flex-row" data-testid="form-komentar">
            <input
              value={isi}
              onChange={(e) => setIsi(e.target.value)}
              placeholder="Tulis komentar…"
              aria-label="Tulis komentar"
              maxLength={1000}
              className="pl-input flex-1"
            />
            <button type="submit" disabled={komentar.isPending} className="pl-btn">
              {komentar.isPending ? "Mengirim…" : "Kirim"}
            </button>
          </form>
        ) : (
          <p className="mt-2 text-sm text-navy-400">
            <Link to="/login" className="pl-link">
              Masuk
            </Link>{" "}
            untuk ikut berkomentar.
          </p>
        )}

        {galatKomentar ? (
          <p role="alert" className="mt-2 text-xs font-medium text-danger">
            {galatKomentar.message}
          </p>
        ) : null}

        <ul className="mt-4 space-y-2" data-testid="daftar-komentar">
          {post.comments.length === 0 ? (
            <li className="rounded-[var(--radius-card)] border border-dashed border-line px-4 py-6 text-center text-sm text-navy-400">
              Belum ada komentar. Mulai diskusinya!
            </li>
          ) : (
            post.comments.map((item) => (
              <li
                key={item.id}
                className="rounded-[var(--radius-card)] border border-line bg-[#111528] p-4"
              >
                <div className="flex items-center gap-2.5">
                  {item.author.avatarUrl ? (
                    <img
                      src={item.author.avatarUrl}
                      alt={`Avatar ${item.author.name}`}
                      className="h-8 w-8 rounded-full object-cover"
                    />
                  ) : (
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#262246] text-[10px] font-bold text-white">
                      {inisial(item.author.name)}
                    </span>
                  )}
                  <p className="text-xs font-semibold text-white">{item.author.name}</p>
                  <p className="text-[11px] text-navy-400">{waktuRelatif(item.createdAt)}</p>
                </div>
                <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-navy-200">
                  {item.body}
                </p>
              </li>
            ))
          )}
        </ul>
      </section>
    </section>
  );
}
