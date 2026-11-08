import { useAuth } from "@/hooks/useAuth";
import { useBookmarks, useFavorites, useToggleBookmark, useToggleFavorite } from "@/hooks/usePersonal";
import { isBookmarked, isFavorited } from "@/lib/personal";
import { extractApiError } from "@/lib/api";

const KELAS_AKTIF =
  "rounded-[var(--radius-control)] bg-gradient-to-r from-[#7135f5] to-[#8b35f4] px-3.5 py-2 text-xs font-bold text-white transition-all hover:brightness-110";
const KELAS_IDLE =
  "rounded-[var(--radius-control)] border border-line bg-[#1d1b36] px-3.5 py-2 text-xs font-semibold text-navy-200 transition-colors hover:border-[#7135f5] hover:text-white";

export function FavoriteButton({ gameId }: { gameId: string }) {
  const { data: pengguna } = useAuth();
  const { data: favorit } = useFavorites(Boolean(pengguna));
  const toggle = useToggleFavorite();

  if (!pengguna) {
    return (
      <p data-testid="favorit-butuh-login" className="text-xs text-navy-400">
        Masuk untuk menyimpan game ke favorit.
      </p>
    );
  }

  const aktif = isFavorited(favorit?.items ?? [], gameId);
  const galat = toggle.error ? extractApiError(toggle.error).message : null;

  return (
    <div className="flex flex-col items-start gap-1">
      <button
        type="button"
        data-testid="tombol-favorit"
        disabled={toggle.isPending}
        onClick={() => toggle.mutate({ gameId, aktif })}
        className={aktif ? KELAS_AKTIF : KELAS_IDLE}
      >
        {toggle.isPending ? "Menyimpan…" : aktif ? "★ Tersimpan sebagai favorit" : "☆ Simpan sebagai favorit"}
      </button>

      {galat ? (
        <p role="alert" className="text-xs font-medium text-danger">
          {galat}
        </p>
      ) : null}
    </div>
  );
}

export function BookmarkButton({ articleId }: { articleId: string }) {
  const { data: pengguna } = useAuth();
  const { data: simpanan } = useBookmarks(Boolean(pengguna));
  const toggle = useToggleBookmark();

  if (!pengguna) {
    return (
      <p data-testid="simpanan-butuh-login" className="text-xs text-navy-400">
        Masuk untuk menyimpan artikel.
      </p>
    );
  }

  const aktif = isBookmarked(simpanan?.items ?? [], articleId);
  const galat = toggle.error ? extractApiError(toggle.error).message : null;

  return (
    <div className="flex flex-col items-start gap-1">
      <button
        type="button"
        data-testid="tombol-simpanan"
        disabled={toggle.isPending}
        onClick={() => toggle.mutate({ articleId, aktif })}
        className={aktif ? KELAS_AKTIF : KELAS_IDLE}
      >
        {toggle.isPending ? "Menyimpan…" : aktif ? "★ Tersimpan" : "☆ Simpan artikel"}
      </button>

      {galat ? (
        <p role="alert" className="text-xs font-medium text-danger">
          {galat}
        </p>
      ) : null}
    </div>
  );
}
