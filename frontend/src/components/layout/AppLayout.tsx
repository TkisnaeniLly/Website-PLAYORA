import { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";
import { Footer } from "./Footer";

export function AppLayout() {
  const [menuTerbuka, setMenuTerbuka] = useState(false);
  const lokasi = useLocation();

  useEffect(() => {
    const tujuan = lokasi.hash.replace(/^#/, "");
    if (!tujuan) {
      window.scrollTo({ top: 0 });
      return;
    }

    const id = window.requestAnimationFrame(() => {
      document.getElementById(tujuan)?.scrollIntoView({ behavior: "smooth", block: "start" });
    });

    return () => window.cancelAnimationFrame(id);
  }, [lokasi.pathname, lokasi.hash, lokasi.key]);

  return (
    <div className="min-h-screen">
      <Sidebar terbuka={menuTerbuka} onTutup={() => setMenuTerbuka(false)} />

      <div className="lg:pl-[248px]">
        <Header onBukaMenu={() => setMenuTerbuka(true)} />

        <main key={lokasi.pathname} className="min-h-[70vh]">
          <Outlet />
        </main>

        <Footer />
      </div>
    </div>
  );
}
