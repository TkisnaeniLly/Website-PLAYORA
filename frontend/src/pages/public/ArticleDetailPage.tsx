import axios from "axios";
import { Link, useParams } from "react-router-dom";
import { BookmarkButton } from "@/components/ui/PersonalButtons";
import { useArticleDetail } from "@/hooks/useArticles";
import { extractApiError } from "@/lib/api";
import { JALUR_TIPE, LABEL_KATEGORI, LABEL_TIPE } from "@/lib/articles";
import type { ArticleType } from "@/types/articles";

function formatTanggal(nilai: string | null): string {
  if (!nilai) return "Belum terbit";
  return new Date(nilai).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function ArticleDetailPage({ tipe }: { tipe: ArticleType }) {
  const { slug } = useParams<{ slug: string }>();
  const detail = useArticleDetail(slug, tipe);

  const tidakDitemukan =
    axios.isAxiosError(detail.error) && detail.error.response?.status === 404;

  if (detail.isPending) {
    return (
      <section className="playora-container py-10" data-testid="loading-state">
        <div className="h-3 w-24 animate-pulse rounded bg-navy-100" />
        <div className="mt-3 h-8 w-2/3 animate-pulse rounded bg-navy-100" />
        <div className="mt-6 aspect-[16/9] w-full animate-pulse rounded-[var(--radius-card)] bg-navy-100" />
      </section>
    );
  }

  if (tidakDitemukan) {
    return (
      <section className="playora-container py-20 text-center">
        <h1 className="text-2xl font-bold text-navy-800">
          Artikel tidak ditemukan
        </h1>
        <p className="mt-2 text-sm text-muted">
          Artikel yang Anda cari tidak tersedia atau belum dipublikasikan.
        </p>
        <Link
          to={JALUR_TIPE[tipe]}
          className="mt-6 inline-block rounded-[var(--radius-control)] bg-[#7138F5] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#4B1DB8]"
        >
          Kembali ke {LABEL_TIPE[tipe].toLowerCase()}
        </Link>
      </section>
    );
  }

  if (detail.isError || !detail.data) {
    return (
      <section className="playora-container py-20 text-center">
        <h1 className="text-xl font-bold text-danger">Gagal memuat artikel</h1>
        <p className="mt-2 text-sm text-muted">
          {detail.error ? extractApiError(detail.error).message : "Terjadi kesalahan."}
        </p>
        <button
          type="button"
          onClick={() => void detail.refetch()}
          className="mt-6 rounded-[var(--radius-control)] border border-navy-700 px-5 py-2.5 text-sm font-semibold text-navy-800"
        >
          Coba lagi
        </button>
      </section>
    );
  }

  const artikel = detail.data;
  const paragraf = artikel.content
    .split(/\n{2,}/)
    .map((bagian) => bagian.trim())
    .filter((bagian) => bagian.length > 0);

  return (
    <article data-testid="article-detail" className="pb-12">
      <div
        className="border-b border-line text-white"
        style={{
          backgroundImage:
            "radial-gradient(ellipse at 15% -50%, #2b1a5e 0, #12132c 48%, #0b0b18 100%)",
        }}
      >
        <div className="playora-container max-w-3xl py-10 sm:py-12">
          <Link
            to={JALUR_TIPE[tipe]}
            className="text-xs font-semibold uppercase tracking-widest text-accent-pink"
          >
            ← {LABEL_TIPE[tipe]}
          </Link>

          <span className="mt-4 block text-[11px] font-bold uppercase tracking-wide text-accent-pink">
            {LABEL_KATEGORI[artikel.category] ?? artikel.category}
          </span>

          <h1 className="mt-2 text-2xl font-extrabold leading-tight sm:text-4xl">
            {artikel.title}
          </h1>

          <p className="mt-4 text-sm text-navy-200">
            {artikel.author.name}
            <span aria-hidden="true"> · </span>
            {formatTanggal(artikel.publishedAt)}
          </p>

          <div className="mt-5">
            <BookmarkButton articleId={artikel.id} />
          </div>
        </div>
      </div>

      <div className="playora-container max-w-3xl">
        {artikel.thumbnailUrl ? (
          <img
            src={artikel.thumbnailUrl}
            alt={`Ilustrasi ${artikel.title}`}
            className="-mt-6 mb-8 w-full rounded-[var(--radius-card)] object-cover"
          />
        ) : null}

        {artikel.excerpt ? (
          <p className="mt-8 border-l-4 border-accent pl-4 text-base font-medium leading-relaxed text-navy-700">
            {artikel.excerpt}
          </p>
        ) : null}

        <div className="mt-6 space-y-4">
          {paragraf.map((bagian, indeks) => (
            <p key={indeks} className="text-sm leading-relaxed text-ink sm:text-base">
              {bagian}
            </p>
          ))}
        </div>

        {artikel.game ? (
          <aside className="mt-10 rounded-[var(--radius-card)] border border-line bg-white p-5">
            <h2 className="text-sm font-bold uppercase tracking-wide text-muted">
              Game terkait
            </h2>
            <Link
              to={`/games/${artikel.game.slug}`}
              className="mt-2 block text-base font-semibold text-navy-800 hover:underline"
            >
              {artikel.game.title}
            </Link>
            <p className="mt-1 text-xs text-muted">{artikel.game.genre}</p>
          </aside>
        ) : null}
      </div>
    </article>
  );
}
