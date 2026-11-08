import { createHash } from "node:crypto";
import { env } from "../config/env";
import { ApiError } from "./ApiError";

const MIME_IZIN = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAKSIMAL_BYTES = 2 * 1024 * 1024;

export function uploadTerkonfigurasi(): boolean {
  return Boolean(env.CLOUDINARY_CLOUD_NAME && env.CLOUDINARY_API_KEY && env.CLOUDINARY_API_SECRET);
}

interface HasilUnggah {
  url: string;
  publicId: string;
  width: number;
  height: number;
}

function tandaTangan(param: Record<string, string>, apiSecret: string): string {
  const teks = Object.keys(param)
    .sort()
    .map((kunci) => `${kunci}=${param[kunci]}`)
    .join("&");

  return createHash("sha1").update(`${teks}${apiSecret}`).digest("hex");
}

/**
 * Mengunggah gambar ke Cloudinary melalui REST API.
 *
 * Paket resmi Cloudinary tidak dipakai agar backend tidak menambah
 * dependency; API-nya sederhana: POST multipart + parameter bertanda tangan.
 */
export async function unggahDataUrl(
  dataUrl: string,
  folder: string,
): Promise<HasilUnggah> {
  const cocok = /^data:(image\/[a-z+]+);base64,([A-Za-z0-9+/=]+)$/i.exec(dataUrl.trim());
  if (!cocok) {
    throw ApiError.badRequest("Format gambar tidak dikenali. Gunakan data URL base64 dari berkas gambar.");
  }

  const mime = cocok[1]!.toLowerCase();
  if (!MIME_IZIN.includes(mime)) {
    throw ApiError.badRequest(
      `Format gambar tidak didukung. Gunakan ${MIME_IZIN.join(", ")}.`,
    );
  }

  const base64 = cocok[2]!;
  const perkiraanBytes = Math.floor((base64.length * 3) / 4);
  if (perkiraanBytes > MAKSIMAL_BYTES) {
    throw ApiError.badRequest("Ukuran gambar maksimal 2 MB.");
  }

  if (!uploadTerkonfigurasi()) {
    throw ApiError.badRequest(
      "Fitur upload gambar belum dikonfigurasi pada server ini. Isi CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, dan CLOUDINARY_API_SECRET terlebih dahulu.",
    );
  }

  const timestamp = Math.floor(Date.now() / 1000);
  const parameter = { folder, timestamp: String(timestamp) };

  const bentuk = new FormData();
  bentuk.append("file", `data:${mime};base64,${base64}`);
  bentuk.append("api_key", env.CLOUDINARY_API_KEY);
  bentuk.append("timestamp", parameter.timestamp);
  bentuk.append("folder", folder);
  bentuk.append("signature", tandaTangan(parameter, env.CLOUDINARY_API_SECRET));

  const url = `https://api.cloudinary.com/v1_1/${env.CLOUDINARY_CLOUD_NAME}/image/upload`;

  let respons: Response;
  try {
    respons = await fetch(url, { method: "POST", body: bentuk });
  } catch {
    throw ApiError.internal("Gagal menghubungi layanan upload gambar.");
  }

  if (!respons.ok) {
    const teks = await respons.text();
    throw ApiError.internal(
      `Layanan upload gambar menolak permintaan (HTTP ${respons.status}). ${teks.slice(0, 200)}`,
    );
  }

  const isi = (await respons.json()) as {
    secure_url?: string;
    public_id?: string;
    width?: number;
    height?: number;
  };

  if (!isi.secure_url) {
    throw ApiError.internal("Layanan upload gambar tidak mengembalikan tautan.");
  }

  return {
    url: isi.secure_url,
    publicId: isi.public_id ?? "",
    width: isi.width ?? 0,
    height: isi.height ?? 0,
  };
}
