import { DiscordLogo } from "./DiscordLogo";
import { formatAnggota } from "@/lib/discord";
import type { DiscordRoomPublic } from "@/types/discord";

export function DiscordRoomCard({ room }: { room: DiscordRoomPublic }) {
  const anggota = formatAnggota(room.memberCount);

  return (
    <article
      data-testid="kartu-ruang-discord"
      className="flex h-full flex-col rounded-[var(--radius-card)] border border-line bg-gradient-to-br from-[#1b1e44] to-[#111528] p-4 transition-colors hover:border-[#5865F2]"
    >
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#5865F2] text-white">
          <DiscordLogo className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-sm font-bold text-white">{room.name}</h3>
          <p className="mt-0.5 truncate text-[11px] text-navy-400">
            {room.game ? room.game.title : "Komunitas umum"}
            {anggota ? ` \u00b7 ${anggota}` : ""}
          </p>
        </div>
      </div>

      <p className="mt-3 line-clamp-3 flex-1 whitespace-pre-line text-xs leading-relaxed text-navy-300">
        {room.description}
      </p>

      <a
        href={room.inviteUrl}
        target="_blank"
        rel="noopener noreferrer"
        data-testid="gabung-ruang-discord"
        className="mt-4 inline-flex items-center justify-center gap-2 rounded-[var(--radius-control)] bg-[#5865F2] px-3 py-2 text-xs font-bold text-white transition-colors hover:bg-[#4752c4]"
      >
        <DiscordLogo className="h-4 w-4" />
        Gabung Discord
      </a>
    </article>
  );
}
