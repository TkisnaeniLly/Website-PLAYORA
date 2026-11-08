import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { bersihkanData, prisma } from "../helpers/db";
import { buatGame } from "../helpers/fixtures";
import { ambilCsrf, klien, kirim } from "../helpers/api";

const SANDI = "RahasiaPengajuan123!";
const ORIGIN = "http://localhost:5173";

type Agent = ReturnType<typeof klien>;

let agentPemilik: Agent;
let agentLain: Agent;
let agentAdmin: Agent;

let csrfPemilik = "";
let csrfLain = "";
let csrfAdmin = "";

let idGamePublik = "";
let idGameDraf = "";

function tanggalGeser(hari: number): string {
  const d = new Date(Date.now() + hari * 86_400_000);
  return d.toISOString().slice(0, 10);
}

function bodyPengajuan(ubah: Record<string, unknown> = {}) {
  return {
    title: "Turnamen Uji Kampus 2027",
    gameId: idGamePublik,
    organizerName: "Himpunan Mahasiswa Uji",
    description:
      "Turnamen antarprogram studi dengan format grup dilanjutkan sistem gugur.",
    startDate: tanggalGeser(20),
    endDate: tanggalGeser(22),
    registrationDeadline: tanggalGeser(15),
    format: "5v5, grup + gugur",
    teamCount: 16,
    prizePool: "Rp5.000.000",
    requirements: "Mahasiswa aktif, satu tim maksimal 6 orang.",
    registrationMethod: "Formulir pendaftaran daring",
    registrationUrl: "https://contoh.playora.id/daftar/uji",
    contact: "turnamen@contoh.ac.id",
    ...ubah,
  };
}

async function daftarDanMasuk(
  email: string,
  username: string,
): Promise<{ agent: Agent; csrf: string }> {
  const agent = klien();
  let csrf = await ambilCsrf(agent);

  const daftar = await kirim(agent, "post", "/api/v1/auth/register", csrf, {
    name: `Pengguna ${username}`,
    username,
    email,
    password: SANDI,
  });

  if (daftar.status !== 201) {
    throw new Error(`Registrasi gagal: ${daftar.status} ${JSON.stringify(daftar.body)}`);
  }

  csrf = await ambilCsrf(agent);
  return { agent, csrf };
}

async function buatPengajuanLewat(agent: Agent, csrf: string, ubah: Record<string, unknown> = {}) {
  return kirim(agent, "post", "/api/v1/submissions", csrf, bodyPengajuan(ubah));
}

beforeAll(async () => {
  await bersihkanData();

  const publik = await buatGame({ title: "Game Publik Uji", genre: "MOBA" });
  const draf = await buatGame({ title: "Game Draf Uji", genre: "FPS", status: "DRAFT" });
  idGamePublik = publik.id;
  idGameDraf = draf.id;

  const pemilik = await daftarDanMasuk(`pemilik.${Date.now()}@playora.test`, `pemilik_${Date.now()}`);
  agentPemilik = pemilik.agent;
  csrfPemilik = pemilik.csrf;

  const lain = await daftarDanMasuk(`lain.${Date.now()}@playora.test`, `lain_${Date.now()}`);
  agentLain = lain.agent;
  csrfLain = lain.csrf;

  const admin = klien();
  const emailAdmin = `admin.uji.${Date.now()}@playora.test`;
  const csrfAdminAwal = await ambilCsrf(admin);

  await kirim(admin, "post", "/api/v1/auth/register", csrfAdminAwal, {
    name: "Admin Uji",
    username: `admin_uji_${Date.now()}`,
    email: emailAdmin,
    password: SANDI,
  }).expect(201);

  await prisma.user.update({
    where: { email: emailAdmin },
    data: { role: "ADMIN" },
  });

  const csrfAdminMasuk = await ambilCsrf(admin);
  const masukAdmin = await kirim(admin, "post", "/api/v1/auth/login", csrfAdminMasuk, {
    email: emailAdmin,
    password: SANDI,
  });

  if (masukAdmin.status !== 200) {
    throw new Error(`Login admin gagal: ${masukAdmin.status}`);
  }

  agentAdmin = admin;
  csrfAdmin = await ambilCsrf(admin);
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe("POST /api/v1/submissions", () => {
  it("menolak pengajuan tanpa sesi", async () => {
    const tamu = klien();
    const csrf = await ambilCsrf(tamu);

    const res = await kirim(tamu, "post", "/api/v1/submissions", csrf, bodyPengajuan());
    expect(res.status).toBe(401);
  });

  it("menyimpan pengajuan baru dengan status PENDING", async () => {
    const res = await buatPengajuanLewat(agentPemilik, csrfPemilik);

    expect(res.status).toBe(201);
    expect(res.body.data.id).toBeTruthy();

    const tersimpan = await prisma.tournamentSubmission.findUniqueOrThrow({
      where: { id: res.body.data.id },
      select: { status: true, teamCount: true, registrationMethod: true },
    });

    expect(tersimpan.status).toBe("PENDING");
    expect(tersimpan.teamCount).toBe(16);
    expect(tersimpan.registrationMethod).toBe("Formulir pendaftaran daring");
  });

  it("mencatat notifikasi 'pengajuan terkirim' tepat satu kali", async () => {
    const res = await buatPengajuanLewat(agentPemilik, csrfPemilik, {
      title: "Turnamen Notifikasi Terkirim",
    });
    const id = res.body.data.id;

    const notifikasi = await prisma.notification.findMany({
      where: { referenceId: id },
      select: { type: true, title: true, userId: true },
    });

    expect(notifikasi).toHaveLength(1);
    expect(notifikasi[0].type).toBe("SUBMISSION_CREATED");
    expect(notifikasi[0].title).toContain("terkirim");
  });

  it("menolak game yang belum dipublikasikan", async () => {
    const res = await buatPengajuanLewat(agentPemilik, csrfPemilik, { gameId: idGameDraf });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
    expect(res.body.error.details[0].field).toBe("gameId");
  });

  it("menolak bila tautan dan kontak sama-sama kosong", async () => {
    const res = await buatPengajuanLewat(agentPemilik, csrfPemilik, {
      registrationUrl: "",
      contact: "",
    });

    expect(res.status).toBe(400);
    const pesan = res.body.error.details.map((d: { message: string }) => d.message).join(" ");
    expect(pesan).toMatch(/tautan pendaftaran atau kontak/i);
  });

  it("menolak tanggal selesai sebelum tanggal mulai", async () => {
    const res = await buatPengajuanLewat(agentPemilik, csrfPemilik, {
      startDate: tanggalGeser(30),
      endDate: tanggalGeser(10),
    });

    expect(res.status).toBe(400);
    expect(
      res.body.error.details.some((d: { field: string }) => d.field === "endDate"),
    ).toBe(true);
  });

  it("menolak batas pendaftaran setelah tanggal mulai", async () => {
    const res = await buatPengajuanLewat(agentPemilik, csrfPemilik, {
      startDate: tanggalGeser(20),
      endDate: tanggalGeser(22),
      registrationDeadline: tanggalGeser(25),
    });

    expect(res.status).toBe(400);
    expect(
      res.body.error.details.some(
        (d: { field: string }) => d.field === "registrationDeadline",
      ),
    ).toBe(true);
  });

  it("menolak turnamen yang sudah selesai", async () => {
    const res = await buatPengajuanLewat(agentPemilik, csrfPemilik, {
      startDate: tanggalGeser(-10),
      endDate: tanggalGeser(-8),
      registrationDeadline: tanggalGeser(-15),
    });

    expect(res.status).toBe(400);
  });

  it("menolak jumlah tim di luar rentang", async () => {
    expect((await buatPengajuanLewat(agentPemilik, csrfPemilik, { teamCount: 1 })).status).toBe(400);
    expect((await buatPengajuanLewat(agentPemilik, csrfPemilik, { teamCount: 9999 })).status).toBe(400);
    expect((await buatPengajuanLewat(agentPemilik, csrfPemilik, { teamCount: 8.5 })).status).toBe(400);
  });

  it("menolak tautan pendaftaran yang bukan URL", async () => {
    const res = await buatPengajuanLewat(agentPemilik, csrfPemilik, {
      registrationUrl: "bukan-url",
    });

    expect(res.status).toBe(400);
  });

  it("tetap menerima pengajuan hanya dengan kontak tanpa tautan", async () => {
    const res = await buatPengajuanLewat(agentPemilik, csrfPemilik, {
      registrationUrl: "",
      contact: "081234567890",
      title: "Turnamen Hanya Kontak",
    });

    expect(res.status).toBe(201);
  });
});

describe("GET /api/v1/submissions", () => {
  it("pengguna hanya melihat pengajuannya sendiri", async () => {
    await buatPengajuanLewat(agentPemilik, csrfPemilik, { title: "Milik Pemilik" });

    const punyaLain = await buatPengajuanLewat(agentLain, csrfLain, {
      title: "Milik Pengguna Lain",
    });
    expect(punyaLain.status).toBe(201);

    const resPemilik = await agentPemilik.get("/api/v1/submissions/me").expect(200);
    const judulPemilik = resPemilik.body.data.items.map((s: { title: string }) => s.title);

    expect(judulPemilik).toContain("Milik Pemilik");
    expect(judulPemilik).not.toContain("Milik Pengguna Lain");

    const resLain = await agentLain.get("/api/v1/submissions/me").expect(200);
    const judulLain = resLain.body.data.items.map((s: { title: string }) => s.title);

    expect(judulLain).toContain("Milik Pengguna Lain");
    expect(judulLain).not.toContain("Milik Pemilik");
  });

  it("memfilter berdasarkan status", async () => {
    const res = await agentPemilik.get("/api/v1/submissions/me?status=PENDING").expect(200);

    expect(res.body.data.items.length).toBeGreaterThan(0);
    expect(
      res.body.data.items.every((s: { status: string }) => s.status === "PENDING"),
    ).toBe(true);
  });

  it("menolak status yang tidak dikenal", async () => {
    const res = await agentPemilik.get("/api/v1/submissions/me?status=BARU").expect(400);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
  });
});

describe("GET /api/v1/submissions/:id", () => {
  it("pemilik dapat membuka detail pengajuannya", async () => {
    const dibuat = await buatPengajuanLewat(agentPemilik, csrfPemilik, {
      title: "Detail Milik Pemilik",
    });

    const res = await agentPemilik
      .get(`/api/v1/submissions/${dibuat.body.data.id}`)
      .expect(200);

    expect(res.body.data.submission.title).toBe("Detail Milik Pemilik");
    expect(res.body.data.submission.teamCount).toBe(16);
  });

  it("pengguna lain mendapat 404, bukan 403", async () => {
    const dibuat = await buatPengajuanLewat(agentPemilik, csrfPemilik, {
      title: "Rahasia Pemilik",
    });

    const res = await agentLain.get(`/api/v1/submissions/${dibuat.body.data.id}`).expect(404);
    expect(res.body.error.code).toBe("NOT_FOUND");
  });

  it("admin dapat membuka pengajuan pengguna mana pun", async () => {
    const dibuat = await buatPengajuanLewat(agentPemilik, csrfPemilik, {
      title: "Dilihat Admin",
    });

    const res = await agentAdmin
      .get(`/api/v1/submissions/${dibuat.body.data.id}`)
      .expect(200);

    expect(res.body.data.submission.title).toBe("Dilihat Admin");
  });
});

describe("Alur keputusan admin", () => {
  it("menolak pengguna biasa mengakses endpoint admin", async () => {
    const res = await agentPemilik.get("/api/v1/admin/submissions");
    expect(res.status).toBe(403);
  });

  it("admin melihat daftar pengajuan dan dapat memfilter status", async () => {
    const res = await agentAdmin.get("/api/v1/admin/submissions?status=PENDING").expect(200);

    expect(res.body.data.items.length).toBeGreaterThan(0);
    expect(res.body.data.items[0].submitter.username).toBeTruthy();
  });

  it("menolak permintaan revisi tanpa catatan", async () => {
    const dibuat = await buatPengajuanLewat(agentPemilik, csrfPemilik, {
      title: "Butuh Catatan",
    });

    const res = await kirim(
      agentAdmin,
      "patch",
      `/api/v1/admin/submissions/${dibuat.body.data.id}/decision`,
      csrfAdmin,
      { decision: "NEEDS_REVISION" },
    );

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
  });

  it("meminta revisi mencatat status, riwayat, dan notifikasi", async () => {
    const dibuat = await buatPengajuanLewat(agentPemilik, csrfPemilik, {
      title: "Perlu Revisi Uji",
    });
    const id = dibuat.body.data.id;

    const res = await kirim(
      agentAdmin,
      "patch",
      `/api/v1/admin/submissions/${id}/decision`,
      csrfAdmin,
      { decision: "NEEDS_REVISION", note: "Lengkapi informasi hadiah." },
    );

    expect(res.status).toBe(200);

    const submission = await prisma.tournamentSubmission.findUniqueOrThrow({
      where: { id },
      select: { status: true, adminNote: true, reviewedBy: true, reviewedAt: true },
    });
    expect(submission.status).toBe("NEEDS_REVISION");
    expect(submission.adminNote).toBe("Lengkapi informasi hadiah.");
    expect(submission.reviewedBy).toBeTruthy();
    expect(submission.reviewedAt).toBeTruthy();

    const riwayat = await prisma.tournamentReview.findMany({ where: { submissionId: id } });
    expect(riwayat).toHaveLength(1);
    expect(riwayat[0].decision).toBe("NEEDS_REVISION");

    const notifikasi = await prisma.notification.findMany({ where: { referenceId: id } });
    const jenis = notifikasi.map((n) => n.type);
    expect(jenis).toContain("SUBMISSION_CREATED");
    expect(jenis).toContain("SUBMISSION_NEEDS_REVISION");

    const turnamen = await prisma.tournament.findUnique({ where: { submissionId: id } });
    expect(turnamen).toBeNull();
  });

  it("pemilik dapat memperbaiki lalu mengirim ulang setelah diminta revisi", async () => {
    const dibuat = await buatPengajuanLewat(agentPemilik, csrfPemilik, {
      title: "Revisi Lalu Kirim Ulang",
    });
    const id = dibuat.body.data.id;

    await kirim(
      agentAdmin,
      "patch",
      `/api/v1/admin/submissions/${id}/decision`,
      csrfAdmin,
      { decision: "NEEDS_REVISION", note: "Perbaiki deskripsi." },
    );

    const perbaikan = await kirim(agentPemilik, "patch", `/api/v1/submissions/${id}`, csrfPemilik, {
      description:
        "Deskripsi sudah diperbaiki dan dilengkapi sesuai catatan admin sebelumnya.",
    });
    expect(perbaikan.status).toBe(200);

    const sesudah = await prisma.tournamentSubmission.findUniqueOrThrow({
      where: { id },
      select: { status: true, adminNote: true },
    });
    expect(sesudah.status).toBe("PENDING");
    expect(sesudah.adminNote).toBeNull();

    const notifikasi = await prisma.notification.findMany({ where: { referenceId: id } });
    expect(notifikasi.map((n) => n.type)).toContain("SUBMISSION_STATUS_CHANGED");
  });

  it("menolak perubahan saat status masih PENDING", async () => {
    const dibuat = await buatPengajuanLewat(agentPemilik, csrfPemilik, {
      title: "Masih Menunggu",
    });

    const res = await kirim(
      agentPemilik,
      "patch",
      `/api/v1/submissions/${dibuat.body.data.id}`,
      csrfPemilik,
      { title: "Coba Ubah Judul" },
    );

    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe("CONFLICT");
  });

  it("menyetujui pengajuan membuat tepat satu turnamen", async () => {
    const dibuat = await buatPengajuanLewat(agentPemilik, csrfPemilik, {
      title: "Turnamen Disetujui Uji",
    });
    const id = dibuat.body.data.id;

    const res = await kirim(
      agentAdmin,
      "patch",
      `/api/v1/admin/submissions/${id}/decision`,
      csrfAdmin,
      { decision: "APPROVED" },
    );

    expect(res.status).toBe(200);
    expect(res.body.data.tournamentId).toBeTruthy();

    const turnamen = await prisma.tournament.findMany({ where: { submissionId: id } });
    expect(turnamen).toHaveLength(1);
    expect(turnamen[0].isPublished).toBe(false);
    expect(turnamen[0].teamCount).toBe(16);
    expect(turnamen[0].registrationMethod).toBe("Formulir pendaftaran daring");

    const notifikasi = await prisma.notification.findMany({ where: { referenceId: id } });
    expect(notifikasi.map((n) => n.type)).toContain("SUBMISSION_APPROVED");
  });

  it("menolak keputusan kedua sehingga turnamen tidak berganda", async () => {
    const dibuat = await buatPengajuanLewat(agentPemilik, csrfPemilik, {
      title: "Tidak Boleh Ganda",
    });
    const id = dibuat.body.data.id;

    await kirim(
      agentAdmin,
      "patch",
      `/api/v1/admin/submissions/${id}/decision`,
      csrfAdmin,
      { decision: "APPROVED" },
    ).expect(200);

    const kedua = await kirim(
      agentAdmin,
      "patch",
      `/api/v1/admin/submissions/${id}/decision`,
      csrfAdmin,
      { decision: "APPROVED" },
    );

    expect(kedua.status).toBe(409);

    const jumlah = await prisma.tournament.count({ where: { submissionId: id } });
    expect(jumlah).toBe(1);
  });

  it("menolak perubahan pengguna setelah pengajuan disetujui", async () => {
    const dibuat = await buatPengajuanLewat(agentPemilik, csrfPemilik, {
      title: "Sudah Disetujui",
    });
    const id = dibuat.body.data.id;

    await kirim(
      agentAdmin,
      "patch",
      `/api/v1/admin/submissions/${id}/decision`,
      csrfAdmin,
      { decision: "APPROVED" },
    ).expect(200);

    const res = await kirim(agentPemilik, "patch", `/api/v1/submissions/${id}`, csrfPemilik, {
      title: "Ingin Mengubah Judul",
    });

    expect(res.status).toBe(409);
    expect(res.body.error.message).toMatch(/sudah disetujui/i);
  });

  it("menolak pengajuan dan tidak membuat turnamen", async () => {
    const dibuat = await buatPengajuanLewat(agentPemilik, csrfPemilik, {
      title: "Akan Ditolak",
    });
    const id = dibuat.body.data.id;

    const res = await kirim(
      agentAdmin,
      "patch",
      `/api/v1/admin/submissions/${id}/decision`,
      csrfAdmin,
      { decision: "REJECTED", note: "Informasi penyelenggara tidak dapat diverifikasi." },
    );

    expect(res.status).toBe(200);
    expect(res.body.data.tournamentId).toBeNull();

    const submission = await prisma.tournamentSubmission.findUniqueOrThrow({
      where: { id },
      select: { status: true, adminNote: true },
    });
    expect(submission.status).toBe("REJECTED");
    expect(submission.adminNote).toContain("tidak dapat diverifikasi");

    expect(await prisma.tournament.count({ where: { submissionId: id } })).toBe(0);

    const notifikasi = await prisma.notification.findMany({ where: { referenceId: id } });
    expect(notifikasi.map((n) => n.type)).toContain("SUBMISSION_REJECTED");
  });

  it("menolak perubahan pengguna setelah pengajuan ditolak", async () => {
    const dibuat = await buatPengajuanLewat(agentPemilik, csrfPemilik, {
      title: "Sudah Ditolak",
    });
    const id = dibuat.body.data.id;

    await kirim(
      agentAdmin,
      "patch",
      `/api/v1/admin/submissions/${id}/decision`,
      csrfAdmin,
      { decision: "REJECTED", note: "Duplikat pengajuan sebelumnya." },
    ).expect(200);

    const res = await kirim(agentPemilik, "patch", `/api/v1/submissions/${id}`, csrfPemilik, {
      title: "Coba Lagi",
    });

    expect(res.status).toBe(409);
  });

  it("mengembalikan 404 untuk pengajuan yang tidak ada", async () => {
    const res = await kirim(
      agentAdmin,
      "patch",
      "/api/v1/admin/submissions/ffffffff-ffff-4fff-8fff-ffffffffffff/decision",
      csrfAdmin,
      { decision: "APPROVED" },
    );

    expect(res.status).toBe(404);
  });
});

describe("Notifikasi pengguna", () => {
  it("mengembalikan notifikasi milik sendiri beserta jumlah belum dibaca", async () => {
    const res = await agentPemilik.get("/api/v1/me/notifications").expect(200);

    expect(res.body.data.items.length).toBeGreaterThan(0);
    expect(typeof res.body.data.unreadCount).toBe("number");
    expect(res.body.data.unreadCount).toBeGreaterThan(0);
  });

  it("menandai notifikasi sebagai dibaca", async () => {
    const daftar = await agentPemilik.get("/api/v1/me/notifications").expect(200);
    const belumDibaca = daftar.body.data.items.find((n: { isRead: boolean }) => !n.isRead);
    expect(belumDibaca).toBeTruthy();

    await kirim(
      agentPemilik,
      "patch",
      `/api/v1/me/notifications/${belumDibaca.id}/read`,
      csrfPemilik,
    ).expect(200);

    const sesudah = await prisma.notification.findUniqueOrThrow({
      where: { id: belumDibaca.id },
      select: { isRead: true },
    });
    expect(sesudah.isRead).toBe(true);
  });

  it("menolak menandai notifikasi milik pengguna lain", async () => {
    const daftar = await agentPemilik.get("/api/v1/me/notifications").expect(200);
    const milikPemilik = daftar.body.data.items[0];

    const res = await kirim(
      agentLain,
      "patch",
      `/api/v1/me/notifications/${milikPemilik.id}/read`,
      csrfLain,
    );

    expect(res.status).toBe(404);
  });

  it("tidak mencampur notifikasi antar pengguna", async () => {
    const res = await agentLain.get("/api/v1/me/notifications").expect(200);
    const ids = res.body.data.items.map((n: { id: string }) => n.id);

    const milikPemilik = await prisma.notification.findMany({
      where: { userId: { not: (await prisma.user.findFirstOrThrow({ where: { email: { contains: "lain." } }, select: { id: true } })).id } },
      select: { id: true },
      take: 5,
    });

    for (const n of milikPemilik) {
      if (n.id) expect(ids).not.toContain(n.id);
    }
  });
});

describe("Konsistensi database", () => {
  it("setiap pengajuan APPROVED memiliki tepat satu turnamen", async () => {
    const disetujui = await prisma.tournamentSubmission.findMany({
      where: { status: "APPROVED" },
      select: { id: true, tournament: { select: { id: true, submissionId: true } } },
    });

    expect(disetujui.length).toBeGreaterThan(0);
    for (const s of disetujui) {
      expect(s.tournament).not.toBeNull();
      expect(s.tournament?.submissionId).toBe(s.id);
    }

    const jumlahTurnamen = await prisma.tournament.count({
      where: { submissionId: { in: disetujui.map((s) => s.id) } },
    });
    expect(jumlahTurnamen).toBe(disetujui.length);
  });

  it("pengajuan non-APPROVED tidak memiliki turnamen", async () => {
    const bukan = await prisma.tournamentSubmission.findMany({
      where: { status: { not: "APPROVED" } },
      select: { id: true, status: true, tournament: { select: { id: true } } },
    });

    for (const s of bukan) {
      expect(s.tournament).toBeNull();
    }
  });

  it("setiap keputusan admin punya satu baris riwayat", async () => {
    const diputuskan = await prisma.tournamentSubmission.findMany({
      where: { status: { in: ["APPROVED", "REJECTED", "NEEDS_REVISION"] } },
      select: { id: true, _count: { select: { reviews: true } } },
    });

    expect(diputuskan.length).toBeGreaterThan(0);
    for (const s of diputuskan) {
      expect(s._count.reviews).toBeGreaterThanOrEqual(1);
    }
  });
});

void ORIGIN;
