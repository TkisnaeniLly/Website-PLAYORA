import { Link } from "react-router-dom";
import { LABEL_STATUS, WARNA_STATUS, formatRentangTanggal } from "@/lib/tournaments";
import type { TournamentListItem } from "@/types/tournaments";

export function TournamentCard({ tournament }: { tournament: TournamentListItem }) {
  return (
    <article
      data-testid="kartu-turnamen"
      className="group flex h-full flex-col rounded-[var(--radius-card)] border border-line bg-gradient-to-br from-[#1c203e] to-[#111528] p-5 transition-all hover:-translate-y-1 hover:border-[#7845e9]"
    >
      <div className="flex items-center justify-between gap-2">
        <span
          className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide ${WARNA_STATUS[tournament.status]}`}
          data-testid="status-turnamen"
        >
          {LABEL_STATUS[tournament.status]}
        </span>

        <span className="text-xs text-navy-400">{tournament.game.title}</span>
      </div>

      <Link to={`/tournaments/${tournament.slug}`} className="mt-3 block focus:outline-none">
        <h3 className="line-clamp-2 text-base font-semibold leading-snug text-white group-hover:text-[#c9b8ff]">
          {tournament.title}
        </h3>
      </Link>

      <dl className="mt-3 space-y-1.5 text-xs text-navy-400">
        <div className="flex gap-1">
          <dt className="font-medium text-navy-300">Jadwal:</dt>
          <dd>{formatRentangTanggal(tournament.startDate, tournament.endDate)}</dd>
        </div>
        <div className="flex gap-1">
          <dt className="font-medium text-navy-300">Penyelenggara:</dt>
          <dd className="line-clamp-1">{tournament.organizerName}</dd>
        </div>
        {tournament.prizePool ? (
          <div className="flex gap-1">
            <dt className="font-medium text-navy-300">Hadiah:</dt>
            <dd className="font-semibold text-gold">{tournament.prizePool}</dd>
          </div>
        ) : null}
      </dl>

      <Link to={`/tournaments/${tournament.slug}`} className="pl-link mt-4 inline-block">
        Lihat detail →
      </Link>
    </article>
  );
}
