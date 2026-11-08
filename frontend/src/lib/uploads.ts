import { api } from "./api";
import type { ApiSuccess } from "@/types/api";

export interface UploadStatus {
  aktif: boolean;
}

export interface HasilUnggah {
  url: string;
  width: number;
  height: number;
}

export async function getUploadStatus(): Promise<UploadStatus> {
  const response = await api.get<ApiSuccess<UploadStatus>>("/me/uploads/status");
  return response.data.data;
}

export async function uploadAvatar(dataUrl: string): Promise<HasilUnggah> {
  const response = await api.post<ApiSuccess<HasilUnggah>>("/me/uploads/avatar", { dataUrl });
  return response.data.data;
}

export async function uploadBerkas(
  dataUrl: string,
  folder: "playora/cover" | "playora/artikel",
): Promise<HasilUnggah> {
  const response = await api.post<ApiSuccess<HasilUnggah>>("/admin/uploads", { dataUrl, folder });
  return response.data.data;
}

/**
 * Membaca berkas gambar menjadi data URL base64 agar siap dikirim ke API.
 * Berkas yang bukan gambar atau terlalu besar ditolak sebelum jaringan.
 */
export function bacaSebagaiDataUrl(
  file: File,
  maksBytes = 2 * 1024 * 1024,
): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith("image/")) {
      reject(new Error("Berkas yang dipilih bukan gambar."));
      return;
    }

    if (file.size > maksBytes) {
      reject(new Error("Ukuran gambar maksimal 2 MB."));
      return;
    }

    const pembaca = new FileReader();
    pembaca.onerror = () => reject(new Error("Gagal membaca berkas gambar."));
    pembaca.onload = () => {
      const hasil = pembaca.result;
      if (typeof hasil !== "string") {
        reject(new Error("Gagal membaca berkas gambar."));
        return;
      }
      resolve(hasil);
    };
    pembaca.readAsDataURL(file);
  });
}
