import type { ReactNode } from "react";

export function AdminPageHeader({
  judul,
  deskripsi,
  aksi,
}: {
  judul: string;
  deskripsi?: string;
  aksi?: ReactNode;
}) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-white">{judul}</h1>
        {deskripsi ? <p className="mt-1 text-sm text-[#9d9ac2]">{deskripsi}</p> : null}
      </div>
      {aksi ? <div className="flex flex-wrap items-center gap-2">{aksi}</div> : null}
    </header>
  );
}

export function AdminPanel({
  children,
  className = "",
  ...sisa
}: { children: ReactNode; className?: string } & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`min-w-0 rounded-2xl border border-[#26264F] bg-[#161839] ${className}`}
      {...sisa}
    >
      {children}
    </div>
  );
}

export function AdminStatCard({
  label,
  nilai,
  keterangan,
  aksen = "#a56aff",
  ikon,
}: {
  label: string;
  nilai: string | number;
  keterangan?: string;
  aksen?: string;
  ikon?: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-[#26264F] bg-[#161839] p-4">
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs font-medium text-[#9d9ac2]">{label}</p>
        {ikon ? (
          <span
            className="flex h-8 w-8 items-center justify-center rounded-lg"
            style={{ backgroundColor: `${aksen}22`, color: aksen }}
          >
            {ikon}
          </span>
        ) : null}
      </div>
      <p className="mt-2 text-2xl font-extrabold text-white">{nilai}</p>
      {keterangan ? <p className="mt-1 text-[11px] text-[#8f88b8]">{keterangan}</p> : null}
    </div>
  );
}

export function AdminBadge({
  children,
  nada = "netral",
}: {
  children: ReactNode;
  nada?: "netral" | "sukses" | "peringatan" | "bahaya" | "ungu";
}) {
  const warna = {
    netral: "bg-white/5 text-[#cbc5e6]",
    sukses: "bg-[#35c98a]/15 text-[#35c98a]",
    peringatan: "bg-[#ffc857]/15 text-[#ffc857]",
    bahaya: "bg-[#ff647c]/15 text-[#ff647c]",
    ungu: "bg-[#7135f5]/20 text-[#c9b8ff]",
  }[nada];

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide ${warna}`}
    >
      {children}
    </span>
  );
}

export function AdminSearch({
  nilai,
  onUbah,
  placeholder,
  ...sisa
}: {
  nilai: string;
  onUbah: (nilai: string) => void;
  placeholder: string;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "onChange">) {
  return (
    <label className="flex h-10 min-w-0 items-center gap-2 rounded-xl border border-[#302B50] bg-[#17172F] px-3 text-[#8f88b8]">
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        className="h-4 w-4"
      >
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-4.2-4.2" />
      </svg>
      <input
        value={nilai}
        onChange={(event) => onUbah(event.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className="w-full min-w-0 bg-transparent text-sm text-white outline-none placeholder:text-[#7b76a3]"
        {...sisa}
      />
    </label>
  );
}
