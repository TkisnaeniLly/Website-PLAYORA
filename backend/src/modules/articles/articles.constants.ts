import type { ArticleCategory } from "@prisma/client";

export type ArticleType = "berita" | "panduan";

export const KATEGORI_BERITA = ["NEWS", "UPDATE", "ESPORTS"] as const;
export const KATEGORI_PANDUAN = ["TIPS", "TUTORIAL"] as const;

export const SEMUA_KATEGORI = [
  ...KATEGORI_BERITA,
  ...KATEGORI_PANDUAN,
] as const satisfies readonly ArticleCategory[];

export function kategoriUntukTipe(tipe: ArticleType): readonly ArticleCategory[] {
  return tipe === "berita" ? KATEGORI_BERITA : KATEGORI_PANDUAN;
}

export function tipeUntukKategori(kategori: ArticleCategory): ArticleType {
  return (KATEGORI_BERITA as readonly ArticleCategory[]).includes(kategori)
    ? "berita"
    : "panduan";
}
