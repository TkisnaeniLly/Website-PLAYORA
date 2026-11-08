import { useEffect, useRef, useState } from "react";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth, useLogout } from "@/hooks/useAuth";

const MENU = [
  { label: "Dashboard", to: "/admin", end: true, icon: "M3 11 12 3l9 8v10h-6v-6H9v6H3z" },
  { label: "Kelola Game", to: "/admin/games", icon: "M4 6h16v12H4zM8 10v4M6 12h4" },
  { label: "Kelola Berita", to: "/admin/articles", icon: "M5 4h14v16H5zM8 8h8M8 12h8M8 16h5" },
  { label: "Kelola Turnamen", to: "/admin/tournaments", icon: "M8 4h8v4a4 4 0 0 1-8 0zM6 4h2v3H6zM16 4h2v3h-2zM11 12h2v4h3v2H8v-2h3z" },
  { label: "Kelola Komunitas", to: "/admin/community", icon: "M7 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm10 1a3 3 0 1 0 0-6M2 21v-2c0-3 3-5 7-5s7 2 7 5v2M17 14c3 0 5 2 5 4v2" },
  { label: "Kelola Pengguna", to: "/admin/users", icon: "M12 3a4 4 0 1 1 0 8 4 4 0 0 1 0-8zm0 10c4 0 7 2 7 4v4H5v-4c0-2 3-4 7-4z" },
  { label: "Laporan & Statistik", to: "/admin/reports", icon: "M4 20V10M10 20V4M16 20v-7M22 20H2" },
  { label: "Pengaturan", to: "/admin/settings", icon: "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19.4 15a1.7 1.7 0 0 0 .34 1.87l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06A1.7 1.7 0 0 0 15 19.4a1.7 1.7 0 0 0-1 1.55V21a2 2 0 1 1-4 0v-.09A1.7 1.7 0 0 0 9 19.4a1.7 1.7 0 0 0-1.87.34l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.7 1.7 0 0 0 4.6 15a1.7 1.7 0 0 0-1.55-1H3a2 2 0 1 1 0-4h.09A1.7 1.7 0 0 0 4.6 9a1.7 1.7 0 0 0-.34-1.87l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.7 1.7 0 0 0 9 4.6a1.7 1.7 0 0 0 1-1.55V3a2 2 0 1 1 4 0v.09A1.7 1.7 0 0 0 15 4.6a1.7 1.7 0 0 0 1.87-.34l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.7 1.7 0 0 0 19.4 9c.24.59.8 1 1.45 1H21a2 2 0 1 1 0 4h-.09a1.7 1.7 0 0 0-1.51 1z" },
];

const PENCARIAN = [
  { awalan: "/admin/games", placeholder: "Cari nama game\u2026", tujuan: "/admin/games" },
  { awalan: "/admin/articles", placeholder: "Cari judul berita\u2026", tujuan: "/admin/articles" },
  { awalan: "/admin/users", placeholder: "Cari username atau email\u2026", tujuan: "/admin/users" },
  { awalan: "/admin/community", placeholder: "Cari postingan\u2026", tujuan: "/admin/community" },
];

function Ikon({ d }: { d: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-[18px] w-[18px] shrink-0"
    >
      <path d={d} />
    </svg>
  );
}

function kelasMenu({ isActive }: { isActive: boolean }): string {
  return [
    "flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-[13px] font-medium transition-colors",
    isActive
      ? "bg-gradient-to-r from-[#3a1a8f] to-[#271667] text-white shadow-[inset_3px_0_#a56aff]"
      : "text-[#a9a6c9] hover:bg-white/5 hover:text-white",
  ].join(" ");
}

export function AdminLayout() {
  const { data: pengguna } = useAuth();
  const keluar = useLogout();
  const navigate = useNavigate();
  const lokasi = useLocation();
  const [kata, setKata] = useState("");
  const [menuTerbuka, setMenuTerbuka] = useState(false);
  const [profilTerbuka, setProfilTerbuka] = useState(false);
  const refProfil = useRef<HTMLDivElement | null>(null);

  const konteks = PENCARIAN.find((item) => lokasi.pathname.startsWith(item.awalan)) ?? {
    placeholder: "Cari game, berita, pengguna\u2026",
    tujuan: "/admin/games",
  };

  useEffect(() => {
    function klikLuar(event: MouseEvent) {
      if (refProfil.current && !refProfil.current.contains(event.target as Node)) {
        setProfilTerbuka(false);
      }
    }
    document.addEventListener("mousedown", klikLuar);
    return () => document.removeEventListener("mousedown", klikLuar);
  }, []);

  useEffect(() => {
    setMenuTerbuka(false);
    setProfilTerbuka(false);
  }, [lokasi.pathname]);

  const inisial = (pengguna?.name ?? "A").charAt(0).toUpperCase();
  const tanggal = new Date().toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  function cari(event: React.FormEvent) {
    event.preventDefault();
    const q = kata.trim();
    navigate(q ? `${konteks.tujuan}?q=${encodeURIComponent(q)}` : konteks.tujuan);
  }

  return (
    <div className="min-h-screen bg-[#11112C] text-[#F5F3FF]">
      <aside
        data-testid="sidebar-admin"
        className={[
          "fixed inset-y-0 left-0 z-50 flex w-[232px] flex-col border-r border-[#26264F] bg-[#131331] px-3.5 py-5",
          "transition-transform duration-200 lg:translate-x-0",
          menuTerbuka ? "translate-x-0" : "-translate-x-full",
        ].join(" ")}
      >
        <Link to="/admin" className="mb-7 flex items-center gap-2 px-1.5 text-lg font-extrabold text-white">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#7135f5] to-[#a56aff] text-sm font-black">
            P
          </span>
          PLAYORA
        </Link>

        <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-[0.18em] text-[#6f6b9a]">
          Admin Panel
        </p>

        <nav aria-label="Menu admin" className="grid gap-1">
          {MENU.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              data-testid={`menu-admin-${item.to.replace("/admin/", "") || "dashboard"}`}
              className={kelasMenu}
            >
              <Ikon d={item.icon} />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto grid gap-2 pt-5">
          <button
            type="button"
            onClick={() => keluar.mutate()}
            disabled={keluar.isPending}
            data-testid="keluar-admin"
            className="flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-[13px] font-medium text-[#a9a6c9] hover:bg-white/5 hover:text-white disabled:opacity-60"
          >
            <Ikon d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
            {keluar.isPending ? "Keluar\u2026" : "Keluar"}
          </button>
        </div>
      </aside>

      {menuTerbuka ? (
        <button
          type="button"
          aria-label="Tutup menu admin"
          onClick={() => setMenuTerbuka(false)}
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
        />
      ) : null}

      <div className="lg:pl-[232px]">
        <header className="sticky top-0 z-30 border-b border-[#26264F] bg-[#0D0D25]/95 backdrop-blur">
          <div className="flex h-16 items-center gap-3 px-4 sm:px-6">
            <button
              type="button"
              onClick={() => setMenuTerbuka(true)}
              aria-label="Buka menu admin"
              data-testid="buka-menu-admin"
              className="rounded-lg border border-[#302B50] bg-[#1A1A38] p-2 text-[#cbc5e6] lg:hidden"
            >
              <Ikon d="M4 7h16M4 12h16M4 17h16" />
            </button>

            <form onSubmit={cari} role="search" className="min-w-0 flex-1">
              <label className="flex h-10 items-center gap-2.5 rounded-xl border border-[#302B50] bg-[#17172F] px-3.5 text-[#8f88b8]">
                <Ikon d="M11 4a7 7 0 1 1 0 14 7 7 0 0 1 0-14zm9 16-4.2-4.2" />
                <input
                  value={kata}
                  onChange={(event) => setKata(event.target.value)}
                  placeholder={konteks.placeholder}
                  aria-label="Cari di panel admin"
                  data-testid="cari-admin-global"
                  className="w-full min-w-0 bg-transparent text-sm text-white outline-none placeholder:text-[#7b76a3] disabled:cursor-not-allowed"
                />
              </label>
            </form>

            <p className="hidden text-xs text-[#8f88b8] md:block" data-testid="tanggal-admin">
              {tanggal}
            </p>

            <div className="relative" ref={refProfil}>
              <button
                type="button"
                onClick={() => setProfilTerbuka((nilai) => !nilai)}
                aria-haspopup="menu"
                aria-expanded={profilTerbuka}
                data-testid="profil-admin"
                className="flex items-center gap-2 rounded-full border border-[#3a3566] bg-[#1A1A38] p-1 pr-2.5"
              >
                {pengguna?.avatarUrl ? (
                  <img
                    src={pengguna.avatarUrl}
                    alt=""
                    className="h-8 w-8 rounded-full object-cover"
                  />
                ) : (
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#2b2350] text-xs font-bold text-white">
                    {inisial}
                  </span>
                )}
                <span className="hidden max-w-[120px] truncate text-xs font-semibold text-white sm:block">
                  {pengguna?.name ?? "Admin"}
                </span>
              </button>

              {profilTerbuka ? (
                <div
                  role="menu"
                  data-testid="menu-profil-admin"
                  className="absolute right-0 top-12 grid w-52 gap-1 rounded-xl border border-[#302B50] bg-[#1b1b38] p-2 shadow-2xl"
                >
                  <p className="px-3 py-1 text-[11px] text-[#8f88b8]">
                    {pengguna?.email ?? ""}
                  </p>
                  <Link
                    to="/admin/settings"
                    onClick={() => setProfilTerbuka(false)}
                    className="rounded-lg px-3 py-2 text-sm text-[#cbc5e6] hover:bg-[#2b2350] hover:text-white"
                  >
                    Pengaturan akun
                  </Link>

                  <button
                    type="button"
                    onClick={() => keluar.mutate()}
                    disabled={keluar.isPending}
                    className="rounded-lg px-3 py-2 text-left text-sm font-semibold text-[#ff647c] hover:bg-[#2b2350] disabled:opacity-60"
                  >
                    Keluar
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        </header>

        <main className="px-4 py-5 sm:px-6 sm:py-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
