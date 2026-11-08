interface EmptyStateProps {
  judul: string;
  deskripsi?: string;
  aksi?: { label: string; onClick: () => void };
}

export function EmptyState({ judul, deskripsi, aksi }: EmptyStateProps) {
  return (
    <div
      data-testid="empty-state"
      className="rounded-[var(--radius-card)] border border-dashed border-line bg-[#111528] px-6 py-16 text-center"
    >
      <p className="text-base font-semibold text-white">{judul}</p>
      {deskripsi ? <p className="mt-2 text-sm text-navy-400">{deskripsi}</p> : null}
      {aksi ? (
        <button type="button" onClick={aksi.onClick} className="pl-btn mt-5">
          {aksi.label}
        </button>
      ) : null}
    </div>
  );
}

export function ErrorState({
  pesan,
  onRetry,
}: {
  pesan: string;
  onRetry?: () => void;
}) {
  return (
    <div
      role="alert"
      data-testid="error-state"
      className="rounded-[var(--radius-card)] border border-danger/40 bg-[#1d1226] px-6 py-12 text-center"
    >
      <p className="text-base font-semibold text-danger">Gagal memuat data</p>
      <p className="mt-2 text-sm text-navy-400">{pesan}</p>
      {onRetry ? (
        <button type="button" onClick={onRetry} className="pl-btn-outline mt-5">
          Coba lagi
        </button>
      ) : null}
    </div>
  );
}

export function GameSkeletonGrid({ jumlah = 6 }: { jumlah?: number }) {
  return (
    <div data-testid="loading-state" className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {Array.from({ length: jumlah }).map((_, indeks) => (
        <div key={indeks} className="overflow-hidden rounded-[var(--radius-card)] border border-line bg-[#111528]">
          <div className="h-[150px] animate-pulse bg-[#1d1b36]" />
          <div className="space-y-2 p-3">
            <div className="h-3 w-3/4 animate-pulse rounded bg-[#1d1b36]" />
            <div className="h-3 w-1/2 animate-pulse rounded bg-[#1d1b36]" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function ArticleSkeletonList({ jumlah = 6 }: { jumlah?: number }) {
  return (
    <div data-testid="loading-state" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: jumlah }).map((_, indeks) => (
        <div key={indeks} className="overflow-hidden rounded-[var(--radius-card)] border border-line bg-[#111528]">
          <div className="aspect-[16/9] animate-pulse bg-[#1d1b36]" />
          <div className="space-y-2 p-4">
            <div className="h-2.5 w-16 animate-pulse rounded bg-[#1d1b36]" />
            <div className="h-3 w-full animate-pulse rounded bg-[#1d1b36]" />
            <div className="h-3 w-2/3 animate-pulse rounded bg-[#1d1b36]" />
          </div>
        </div>
      ))}
    </div>
  );
}
