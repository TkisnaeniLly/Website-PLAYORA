import { Link } from "react-router-dom";
import { LABEL_KATEGORI, articlePath } from "@/lib/articles";
import type { ArticleListItem } from "@/types/articles";

function formatTanggal(nilai: string | null): string {
  if (!nilai) return "Belum terbit";
  return new Date(nilai).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function ArticleCard({ article }: { article: ArticleListItem }) {
  const tujuan = articlePath(article.category, article.slug);

  return (
    <article
      data-testid="kartu-artikel"
      className="group h-full overflow-hidden rounded-[var(--radius-card)] border border-line bg-gradient-to-br from-[#1c203e] to-[#111528] transition-all hover:-translate-y-1 hover:border-[#7845e9]"
    >
      <Link to={tujuan} className="flex h-full flex-col focus:outline-none">
        <div className="aspect-[16/9] overflow-hidden bg-[#1a1d38]">
          {article.thumbnailUrl ? (
            <img
              src={article.thumbnailUrl}
              alt={`Ilustrasi ${article.title}`}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div
              aria-hidden="true"
              className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#2a2450] to-[#15152a] text-xs font-bold uppercase tracking-widest text-navy-300"
            >
              {LABEL_KATEGORI[article.category] ?? article.category}
            </div>
          )}
        </div>

        <div className="flex flex-1 flex-col gap-2 p-4">
          <span className="text-[11px] font-bold uppercase tracking-wide text-accent-pink">
            {LABEL_KATEGORI[article.category] ?? article.category}
          </span>

          <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-white group-hover:text-[#c9b8ff]">
            {article.title}
          </h3>

          {article.excerpt ? (
            <p className="line-clamp-2 text-xs leading-relaxed text-navy-400">{article.excerpt}</p>
          ) : null}

          <div className="mt-auto pt-2 text-[11px] text-navy-400">
            <span>{formatTanggal(article.publishedAt)}</span>
            <span aria-hidden="true"> · </span>
            <span>{article.author.name}</span>
          </div>
        </div>
      </Link>
    </article>
  );
}
