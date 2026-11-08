import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth, useLogout } from "@/hooks/useAuth";
import { useUnreadCount } from "@/hooks/useAccount";

function Ikon({ d, className }: { d: string; className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className ?? "h-5 w-5"}
    >
      <path d={d} />
    </svg>
  );
}

export function Header({ onBukaMenu }: { onBukaMenu: () => void }) {
  const { data: pengguna } = useAuth();
  const keluar = useLogout();
  const navigate = useNavigate();
  const { data: belumDibaca = 0 } = useUnreadCount(Boolean(pengguna));

  const [kata, setKata] = useState("");
  const [menuTerbuka, setMenuTerbuka] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function klikLuar(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuTerbuka(false);
      }
    }
    document.addEventListener("mousedown", klikLuar);
    return () => document.removeEventListener("mousedown", klikLuar);
  }, []);

  function cari(event: React.FormEvent) {
    event.preventDefault();
    const q = kata.trim();
    navigate(q ? `/games?q=${encodeURIComponent(q)}` : "/games");
  }

  const inisial = (pengguna?.name ?? "?").charAt(0).toUpperCase();

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-[#0b0b18]/85 backdrop-blur">
      <div className="flex h-16 items-center gap-3 px-4 sm:gap-4 sm:px-6">
        <button
          type="button"
          onClick={onBukaMenu}
          aria-label="Buka menu"
          data-testid="tombol-menu"
          className="rounded-xl border border-line bg-surface-2 p-2 text-navy-200 lg:hidden"
        >
          <Ikon d="M4 7h16M4 12h16M4 17h16" />
        </button>

        <form onSubmit={cari} role="search" className="flex-1 min-w-0">
          <label className="flex h-11 items-center gap-3 rounded-full border border-line bg-[#1a1b37] px-4 text-navy-300">
            <Ikon d="M11 4a7 7 0 1 1 0 14 7 7 0 0 1 0-14zm9 16-4.2-4.2" className="h-4 w-4" />
            <input
              value={kata}
              onChange={(event) => setKata(event.target.value)}
              placeholder="Cari game, berita, atau turnamen…"
              aria-label="Cari game"
              data-testid="input-cari"
              className="w-full min-w-0 bg-transparent text-sm text-white outline-none placeholder:text-[#9d9abf]"
            />
            <button
              type="submit"
              aria-label="Jalankan pencarian"
              className="rounded-full bg-gradient-to-r from-[#7135f5] to-[#8b35f4] px-3 py-1.5 text-xs font-bold text-white"
            >
              Cari
            </button>
          </label>
        </form>

        <div className="flex items-center gap-2 sm:gap-3">

          {pengguna ? (
            <div className="relative" ref={menuRef}>
              <button
                type="button"
                onClick={() => setMenuTerbuka((sebelumnya) => !sebelumnya)}
                aria-haspopup="menu"
                aria-expanded={menuTerbuka}
                data-testid="tombol-profil"
                aria-label={belumDibaca > 0 ? `Menu profil, ${belumDibaca} notifikasi belum dibaca` : "Menu profil"}
                className="relative flex items-center gap-2 rounded-full border border-[#6541c8] bg-surface-2 p-1 pr-2 sm:pr-3"
              >
                {pengguna.avatarUrl ? (
                  <img
                    src={pengguna.avatarUrl}
                    alt={`Avatar ${pengguna.name}`}
                    className="h-8 w-8 rounded-full object-cover"
                  />
                ) : (
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#262246] text-xs font-bold text-white">
                    {inisial}
                  </span>
                )}
                <span className="hidden max-w-[110px] truncate text-xs font-semibold text-white sm:block">
                  {pengguna.name}
                </span>
              </button>

              {menuTerbuka ? (
                <div
                  role="menu"
                  data-testid="menu-profil"
                  className="absolute right-0 top-12 grid w-56 gap-1 rounded-xl border border-line bg-[#1b1d38] p-2 shadow-2xl"
                >
                  <Link
                    to="/profile/settings"
                    data-testid="tautan-pengaturan"
                    onClick={() => setMenuTerbuka(false)}
                    className="rounded-lg px-3 py-2 text-sm text-navy-200 hover:bg-[#30245e] hover:text-white"
                  >
                    Profil & pengaturan
                  </Link>
                  <Link
                    to="/profile/favorites"
                    onClick={() => setMenuTerbuka(false)}
                    className="rounded-lg px-3 py-2 text-sm text-navy-200 hover:bg-[#30245e] hover:text-white"
                  >
                    Favorit saya
                  </Link>
                  <Link
                    to="/profile/bookmarks"
                    onClick={() => setMenuTerbuka(false)}
                    className="rounded-lg px-3 py-2 text-sm text-navy-200 hover:bg-[#30245e] hover:text-white"
                  >
                    Artikel tersimpan
                  </Link>
                  <Link
                    to="/notifications"
                    data-testid="tautan-notifikasi"
                    onClick={() => setMenuTerbuka(false)}
                    className="flex items-center justify-between gap-2 rounded-lg px-3 py-2 text-sm text-navy-200 hover:bg-[#30245e] hover:text-white"
                  >
                    <span>Notifikasi</span>
                    {belumDibaca > 0 ? (
                      <span
                        data-testid="badge-notifikasi-profil"
                        className="min-w-[18px] rounded-full bg-danger px-1.5 text-center text-[10px] font-bold leading-[16px] text-white"
                      >
                        {belumDibaca > 99 ? "99+" : belumDibaca}
                      </span>
                    ) : null}
                  </Link>
                  <Link
                    to="/tournaments/submissions"
                    onClick={() => setMenuTerbuka(false)}
                    className="rounded-lg px-3 py-2 text-sm text-navy-200 hover:bg-[#30245e] hover:text-white"
                  >
                    Pengajuan saya
                  </Link>
                  {pengguna.role === "ADMIN" ? (
                    <Link
                      to="/admin"
                      data-testid="tautan-admin"
                      onClick={() => setMenuTerbuka(false)}
                      className="rounded-lg px-3 py-2 text-sm font-semibold text-accent-pink hover:bg-[#30245e]"
                    >
                      Panel admin
                    </Link>
                  ) : null}
                  <button
                    type="button"
                    data-testid="keluar-menu"
                    onClick={() => {
                      setMenuTerbuka(false);
                      keluar.mutate();
                    }}
                    disabled={keluar.isPending}
                    className="rounded-lg px-3 py-2 text-left text-sm font-semibold text-danger hover:bg-[#30245e] disabled:opacity-60"
                  >
                    {keluar.isPending ? "Keluar…" : "Keluar"}
                  </button>
                </div>
              ) : null}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="hidden rounded-xl px-3 py-2 text-sm font-semibold text-navy-200 hover:text-white sm:block"
              >
                Masuk
              </Link>
              <Link
                to="/register"
                className="rounded-xl bg-gradient-to-r from-[#7135f5] to-[#8b35f4] px-4 py-2 text-sm font-bold text-white"
              >
                Daftar
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
