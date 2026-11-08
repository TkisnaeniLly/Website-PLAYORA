import { Link, Outlet } from "react-router-dom";

/**
 * Layout khusus halaman autentikasi.
 *
 * Sengaja TANPA sidebar, navigasi utama, maupun kolom pencarian agar pengguna
 * fokus menyelesaikan proses masuk atau pendaftaran.
 */
export function AuthLayout() {
  return (
    <div className="flex min-h-screen flex-col" data-testid="layout-auth">
      <header className="flex items-center justify-between px-5 py-4 sm:px-8">
        <Link
          to="/"
          className="flex items-center gap-2 text-lg font-extrabold tracking-tight text-white"
        >
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#7135f5] to-[#8b4cff] text-base font-black text-white">
            P
          </span>
          PLAYORA
        </Link>

        <Link
          to="/"
          data-testid="kembali-ke-situs"
          className="rounded-xl border border-line bg-[#1d1b36] px-3 py-2 text-xs font-semibold text-navy-200 hover:border-[#7135f5] hover:text-white"
        >
          ← Kembali ke situs
        </Link>
      </header>

      <main className="flex flex-1 items-center justify-center px-4 py-6">
        <div className="w-full max-w-md">
          <Outlet />
        </div>
      </main>

      <footer className="px-5 pb-6 text-center text-[11px] text-navy-400 sm:px-8">
        PLAYORA — dunia game dalam satu tempat.
      </footer>
    </div>
  );
}
