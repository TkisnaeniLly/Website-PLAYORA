interface PaginationProps {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
}

export function Pagination({ page, totalPages, onChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  const bisaMundur = page > 1;
  const bisaMaju = page < totalPages;

  return (
    <nav
      aria-label="Navigasi halaman"
      className="mt-8 flex flex-wrap items-center justify-center gap-2"
    >
      <button
        type="button"
        onClick={() => onChange(page - 1)}
        disabled={!bisaMundur}
        className="rounded-[var(--radius-control)] border border-line bg-[#1d1b36] px-3 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-40"
      >
        Sebelumnya
      </button>

      <span className="px-2 text-sm text-navy-400" data-testid="info-halaman">
        Halaman {page} dari {totalPages}
      </span>

      <button
        type="button"
        onClick={() => onChange(page + 1)}
        disabled={!bisaMaju}
        className="rounded-[var(--radius-control)] border border-line bg-[#1d1b36] px-3 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-40"
      >
        Berikutnya
      </button>
    </nav>
  );
}
