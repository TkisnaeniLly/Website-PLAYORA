import { Link } from "react-router-dom";

export function Footer() {
  return (
    <footer className="mt-16 border-t border-line bg-[#0a0c17]/80">
      <div className="playora-container flex flex-col gap-3 py-8 text-sm text-navy-400 sm:flex-row sm:items-center sm:justify-between">
        <p>
          <Link to="/" className="font-bold text-white">
            PLAYORA
          </Link>{" "}
          — dunia game dalam satu tempat.
        </p>
        <p className="text-xs">
          Informasi game, berita &amp; panduan, serta direktori turnamen.
        </p>
      </div>
    </footer>
  );
}
