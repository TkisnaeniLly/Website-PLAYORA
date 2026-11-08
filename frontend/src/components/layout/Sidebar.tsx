import { NavLink, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { DiscordLogo } from "@/components/discord/DiscordLogo";

const NAVIGASI = [
  { label: "Beranda", to: "/", icon: "M3 10.5 12 3l9 7.5V21H3z" },
  { label: "Jelajahi Game", to: "/games", icon: "M4 6h16v12H4zM8 10v4M6 12h4" },
  { label: "Berita", to: "/news", icon: "M5 4h14v16H5zM8 8h8M8 12h8M8 16h5" },
  { label: "Panduan", to: "/guides", icon: "M4 5h7v15H4zM13 5h7v15h-7z" },
  { label: "Turnamen", to: "/tournaments", icon: "M8 4h8v4a4 4 0 0 1-8 0zM6 4h2v3H6zM16 4h2v3h-2zM11 12h2v4h3v2H8v-2h3z" },
  { label: "Komunitas", to: "/community", icon: "M7 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm10 1a3 3 0 1 0 0-6M2 21v-2c0-3 3-5 7-5s7 2 7 5v2M17 14c3 0 5 2 5 4v2" },
];

function Ikon({ d }: { d: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5 shrink-0"
    >
      <path d={d} />
    </svg>
  );
}

function kelasNav({ isActive }: { isActive: boolean }): string {
  return [
    "flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors",
    isActive
      ? "bg-gradient-to-r from-[#5124bd] to-[#251b59] text-white shadow-[inset_3px_0_var(--color-accent-pink)]"
      : "text-[#d0cfe8] hover:bg-white/5 hover:text-white",
  ].join(" ");
}

export function Sidebar({ terbuka, onTutup }: { terbuka: boolean; onTutup: () => void }) {
  const { data: pengguna } = useAuth();

  const namaDepan = pengguna?.name?.split(" ")[0] ?? "";

  return (
    <>
      {terbuka ? (
        <button
          type="button"
          aria-label="Tutup menu"
          data-testid="tutup-sidebar"
          onClick={onTutup}
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
        />
      ) : null}

      <aside
        data-testid="sidebar"
        className={[
          "fixed inset-y-0 left-0 z-50 flex w-[248px] flex-col overflow-y-auto border-r border-line px-4 py-6",
          "bg-gradient-to-b from-[#151630f7] to-[#101326f9] backdrop-blur",
          "transition-transform duration-200 lg:translate-x-0",
          terbuka ? "translate-x-0" : "-translate-x-full",
        ].join(" ")}
      >
        <div className="mb-8 flex items-center justify-between">
          <Link to="/" onClick={onTutup} className="flex items-center gap-2 text-xl font-extrabold text-white">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#7135f5] to-[#8b4cff] text-base font-black text-white">
              P
            </span>
            PLAYORA
          </Link>

          <button
            type="button"
            onClick={onTutup}
            aria-label="Tutup menu"
            className="rounded-lg p-1.5 text-navy-300 hover:bg-white/10 lg:hidden"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>

        <nav aria-label="Navigasi utama" className="grid gap-1.5">
          {NAVIGASI.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.to === "/"} onClick={onTutup} className={kelasNav}>
              <Ikon d={item.icon} />
              {item.label}
            </NavLink>
          ))}
        </nav>


        <div className="mt-auto pt-6">
          <div
            data-testid="ajakan-discord"
            className="rounded-2xl border border-[#5865F2]/45 bg-gradient-to-br from-[#2a2f6b]/60 to-[#11152a] p-4 text-center"
          >
            <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-2xl bg-[#5865F2] text-white">
              <DiscordLogo className="h-6 w-6" />
            </span>
            <strong className="mt-3 block text-sm text-white">Gabung komunitas Discord</strong>
            <p className="mt-1 text-[11px] leading-relaxed text-navy-300">
              Temukan ruang Discord pilihan untuk mabar dan berdiskusi dengan gamer lain.
            </p>
            <Link
              to="/community#discord"
              onClick={onTutup}
              data-testid="tombol-gabung-discord"
              className="pl-btn mt-3 w-full text-xs"
            >
              Gabung
            </Link>
          </div>

          <p className="mt-4 px-1 text-[11px] leading-relaxed text-navy-400">
            {namaDepan ? `Halo, ${namaDepan}. ` : ""}
            PLAYORA - dunia game dalam satu tempat.
          </p>
        </div>
      </aside>
    </>
  );
}
