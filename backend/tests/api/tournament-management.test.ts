import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { bersihkanData, prisma } from "../helpers/db";
import { buatGame } from "../helpers/fixtures";
import { ambilCsrf, klien, kirim } from "../helpers/api";

const SANDI = "RahasiaHasil123!";
type Agent = ReturnType<typeof klien>;

let admin: Agent, csrfAdmin = "";
let pemilik: Agent, csrfPemilik = "";
let orangLain: Agent, csrfOrangLain = "";

let idAdmin = "", idPemilik = "", idOrangLain = "";
let idGame = "";
let idTurnamen = "";

const slugTurnamen = "turnamen-uji-hasil";

async function daftar(email: string, username: string) {
  const agent = klien();
  let csrf = await ambilCsrf(agent);
  await kirim(agent, "post", "/api/v1/auth/register", csrf, {
    name: `Pengguna ${username}`,
    username,
    email,
    password: SANDI,
  }).expect(201);
  return agent;
}

async function loginUlang(agent: Agent, email: string) {
  const csrf = await ambilCsrf(agent);
  await kirim(agent, "post", "/api/v1/auth/login", csrf, { email, password: SANDI }).expect(200);
  return ambilCsrf(agent);
}

async function buatTurnamenUji() {
  return prisma.tournament.create({
    data: {
      gameId: idGame,
      managerId: idPemilik,
      title: "Turnamen Uji Hasil",
      slug: slugTurnamen,
      organizerName: "Penyelenggara Uji",
      description: "Turnamen untuk menguji alur pengelolaan hasil.",
      startDate: new Date("2027-06-01"),
      endDate: new Date("2027-06-03"),
      isPublished: false,
    },
    select: { id: true },
  });
}

const hasilContoh = [
  { position: 1, teamOrPlayer: "Tim Alpha", note: "Juara 1" },
  { position: 2, teamOrPlayer: "Tim Beta" },
  { position: 3, teamOrPlayer: "Tim Gamma" },
];

beforeAll(async () => {
  await bersihkanData();

  const game = await buatGame({ title: "Game Hasil Uji", genre: "MOBA" });
  idGame = game.id;

  const stempel = Date.now();
  const emailAdmin = `admin.hasil.${stempel}@playora.test`;
  const emailPemilik = `pemilik.hasil.${stempel}@playora.test`;
  const emailLain = `lain.hasil.${stempel}@playora.test`;

  admin = await daftar(emailAdmin, `admin_hasil_${stempel}`);
  await prisma.user.update({ where: { email: emailAdmin }, data: { role: "ADMIN" } });
  csrfAdmin = await loginUlang(admin, emailAdmin);
  idAdmin = (await prisma.user.findUniqueOrThrow({ where: { email: emailAdmin } })).id;

  pemilik = await daftar(emailPemilik, `pemilik_hasil_${stempel}`);
  csrfPemilik = await ambilCsrf(pemilik);
  idPemilik = (await prisma.user.findUniqueOrThrow({ where: { email: emailPemilik } })).id;

  orangLain = await daftar(emailLain, `lain_hasil_${stempel}`);
  csrfOrangLain = await ambilCsrf(orangLain);
  idOrangLain = (await prisma.user.findUniqueOrThrow({ where: { email: emailLain } })).id;

  const turnamen = await buatTurnamenUji();
  idTurnamen = turnamen.id;
});

afterAll(async () => {
  await prisma.$disconnect();
});

beforeEach(async () => {
  await prisma.tournamentResultReview.deleteMany({});
  await prisma.tournamentResult.deleteMany({});
  await prisma.tournament.update({
    where: { id: idTurnamen },
    data: { isPublished: false, publishedAt: null, publishedBy: null },
  });
});

describe("Hak akses pengelolaan hasil", () => {
  it("menolak tamu tanpa sesi", async () => {
    const tamu = klien();
    const csrf = await ambilCsrf(tamu);
    const res = await kirim(tamu, "put", `/api/v1/tournaments/${idTurnamen}/results`, csrf, {
      results: hasilContoh,
    });
    expect(res.status).toBe(401);
  });

  it("penyelenggara dapat melihat hasil turnamennya sendiri", async () => {
    const res = await pemilik
      .get(`/api/v1/tournaments/${idTurnamen}/results/manage`)
      .expect(200);

    expect(res.body.data.turnamen.id).toBe(idTurnamen);
    expect(Array.isArray(res.body.data.hasil)).toBe(true);
  });

  it("pengguna lain mendapat 404, bukan 403", async () => {
    const res = await orangLain.get(`/api/v1/tournaments/${idTurnamen}/results/manage`);
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe("NOT_FOUND");
  });

  it("pengguna lain tidak dapat mengubah hasil", async () => {
    const res = await kirim(
      orangLain,
      "put",
      `/api/v1/tournaments/${idTurnamen}/results`,
      csrfOrangLain,
      { results: hasilContoh },
    );
    expect(res.status).toBe(404);
    expect(await prisma.tournamentResult.count({ where: { tournamentId: idTurnamen } })).toBe(0);
  });

  it("admin dapat mengelola hasil turnamen siapa pun", async () => {
    await admin.get(`/api/v1/tournaments/${idTurnamen}/results/manage`).expect(200);
  });
});

describe("Pengajuan hasil oleh penyelenggara", () => {
  it("menyimpan hasil dengan status PENDING_REVIEW dan mencatat audit", async () => {
    const res = await kirim(
      pemilik,
      "put",
      `/api/v1/tournaments/${idTurnamen}/results`,
      csrfPemilik,
      { results: hasilContoh },
    );

    expect(res.status).toBe(200);
    expect(res.body.data.jumlah).toBe(3);

    const tersimpan = await prisma.tournamentResult.findMany({
      where: { tournamentId: idTurnamen },
      select: { status: true, submittedBy: true },
    });
    expect(tersimpan).toHaveLength(3);
    expect(tersimpan.every((r) => r.status === "PENDING_REVIEW")).toBe(true);
    expect(tersimpan.every((r) => r.submittedBy === idPemilik)).toBe(true);

    const audit = await prisma.tournamentResultReview.findMany();
    expect(audit).toHaveLength(3);
    expect(audit.every((a) => a.action === "SUBMITTED")).toBe(true);
    expect(audit.every((a) => a.actorId === idPemilik)).toBe(true);
  });

  it("hasil pending tidak tampil di halaman publik", async () => {
    await kirim(pemilik, "put", `/api/v1/tournaments/${idTurnamen}/results`, csrfPemilik, {
      results: hasilContoh,
    });

    await prisma.tournament.update({ where: { id: idTurnamen }, data: { isPublished: true } });

    const res = await klien().get(`/api/v1/tournaments/${slugTurnamen}`).expect(200);
    expect(res.body.data.tournament.results).toEqual([]);
  });

  it("menolak peringkat ganda", async () => {
    const res = await kirim(
      pemilik,
      "put",
      `/api/v1/tournaments/${idTurnamen}/results`,
      csrfPemilik,
      {
        results: [
          { position: 1, teamOrPlayer: "A" },
          { position: 1, teamOrPlayer: "B" },
        ],
      },
    );

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
  });

  it("menolak hasil kosong", async () => {
    const res = await kirim(
      pemilik,
      "put",
      `/api/v1/tournaments/${idTurnamen}/results`,
      csrfPemilik,
      { results: [] },
    );
    expect(res.status).toBe(400);
  });

  it("menolak peringkat di luar rentang", async () => {
    const res = await kirim(
      pemilik,
      "put",
      `/api/v1/tournaments/${idTurnamen}/results`,
      csrfPemilik,
      { results: [{ position: 999, teamOrPlayer: "Tim" }] },
    );
    expect(res.status).toBe(400);
  });

  it("mengganti isi hasil menghapus posisi lama yang tidak dipakai", async () => {
    await kirim(pemilik, "put", `/api/v1/tournaments/${idTurnamen}/results`, csrfPemilik, {
      results: hasilContoh,
    });

    await kirim(pemilik, "put", `/api/v1/tournaments/${idTurnamen}/results`, csrfPemilik, {
      results: [{ position: 1, teamOrPlayer: "Tim Tunggal" }],
    });

    const sisa = await prisma.tournamentResult.findMany({
      where: { tournamentId: idTurnamen },
      select: { position: true, teamOrPlayer: true },
    });
    expect(sisa).toHaveLength(1);
    expect(sisa[0].teamOrPlayer).toBe("Tim Tunggal");
  });
});

describe("Penghapusan hasil pertandingan", () => {
  async function simpanDanSetujuiPeringkat1() {
    await kirim(pemilik, "put", `/api/v1/tournaments/${idTurnamen}/results`, csrfPemilik, {
      results: hasilContoh,
    });

    const baris = await prisma.tournamentResult.findMany({
      where: { tournamentId: idTurnamen },
      orderBy: { position: "asc" },
      select: { id: true, position: true },
    });

    await kirim(
      admin,
      "patch",
      `/api/v1/admin/tournaments/${idTurnamen}/results/${baris[0]!.id}/review`,
      csrfAdmin,
      { decision: "APPROVED" },
    ).expect(200);

    return baris;
  }

  it("penyelenggara tidak dapat menghapus hasil yang sudah disetujui", async () => {
    await simpanDanSetujuiPeringkat1();

    const res = await kirim(pemilik, "put", `/api/v1/tournaments/${idTurnamen}/results`, csrfPemilik, {
      results: [
        { position: 2, teamOrPlayer: "Tim Beta" },
        { position: 3, teamOrPlayer: "Tim Gamma" },
      ],
    });

    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe("CONFLICT");
    expect(res.body.error.message).toContain("peringkat 1");

    const sesudah = await prisma.tournamentResult.findMany({
      where: { tournamentId: idTurnamen },
      orderBy: { position: "asc" },
      select: { position: true, status: true, teamOrPlayer: true },
    });

    expect(sesudah).toHaveLength(3);
    expect(sesudah[0]!.status).toBe("APPROVED");
    expect(sesudah[0]!.teamOrPlayer).toBe("Tim Alpha");
  });

  it("hasil yang disetujui tetap tampil publik setelah penghapusan ditolak", async () => {
    await simpanDanSetujuiPeringkat1();
    await prisma.tournament.update({
      where: { id: idTurnamen },
      data: { isPublished: true },
    });

    await kirim(pemilik, "put", `/api/v1/tournaments/${idTurnamen}/results`, csrfPemilik, {
      results: [
        { position: 2, teamOrPlayer: "Tim Beta" },
        { position: 3, teamOrPlayer: "Tim Gamma" },
      ],
    }).expect(409);

    const res = await klien().get(`/api/v1/tournaments/${slugTurnamen}`).expect(200);

    expect(res.body.data.tournament.results).toHaveLength(1);
    expect(res.body.data.tournament.results[0].teamOrPlayer).toBe("Tim Alpha");
  });

  it("penyelenggara tetap dapat menghapus hasil yang belum disetujui", async () => {
    await simpanDanSetujuiPeringkat1();

    await kirim(pemilik, "put", `/api/v1/tournaments/${idTurnamen}/results`, csrfPemilik, {
      results: [
        { position: 1, teamOrPlayer: "Tim Alpha", note: "Juara 1" },
        { position: 2, teamOrPlayer: "Tim Beta" },
      ],
    }).expect(200);

    const sesudah = await prisma.tournamentResult.findMany({
      where: { tournamentId: idTurnamen },
      orderBy: { position: "asc" },
      select: { position: true, status: true },
    });

    expect(sesudah).toHaveLength(2);
    expect(sesudah[0]!.status).toBe("APPROVED");
  });

  it("admin tetap dapat menghapus hasil yang sudah disetujui", async () => {
    await simpanDanSetujuiPeringkat1();

    await kirim(admin, "put", `/api/v1/tournaments/${idTurnamen}/results`, csrfAdmin, {
      results: [
        { position: 2, teamOrPlayer: "Tim Beta" },
        { position: 3, teamOrPlayer: "Tim Gamma" },
      ],
    }).expect(200);

    const sesudah = await prisma.tournamentResult.findMany({
      where: { tournamentId: idTurnamen },
      select: { position: true },
      orderBy: { position: "asc" },
    });

    expect(sesudah.map((b) => b.position)).toEqual([2, 3]);
  });

  it("penolakan penghapusan tidak mengubah baris lain", async () => {
    await simpanDanSetujuiPeringkat1();

    await kirim(pemilik, "put", `/api/v1/tournaments/${idTurnamen}/results`, csrfPemilik, {
      results: [
        { position: 2, teamOrPlayer: "Tim Beta Diubah" },
        { position: 3, teamOrPlayer: "Tim Gamma" },
      ],
    }).expect(409);

    const sesudah = await prisma.tournamentResult.findMany({
      where: { tournamentId: idTurnamen },
      orderBy: { position: "asc" },
      select: { position: true, status: true, teamOrPlayer: true },
    });

    expect(sesudah).toHaveLength(3);
    expect(sesudah[1]!.teamOrPlayer).toBe("Tim Beta");
  });
});

describe("Peninjauan hasil oleh admin", () => {
  it("penyelenggara tidak dapat menyetujui hasil (403)", async () => {
    await kirim(pemilik, "put", `/api/v1/tournaments/${idTurnamen}/results`, csrfPemilik, {
      results: hasilContoh,
    });

    const res = await kirim(
      pemilik,
      "patch",
      `/api/v1/admin/tournaments/${idTurnamen}/results/review`,
      csrfPemilik,
      { decision: "APPROVED" },
    );

    expect(res.status).toBe(403);
  });

  it("menolak peninjauan saat tidak ada hasil menunggu", async () => {
    const res = await kirim(
      admin,
      "patch",
      `/api/v1/admin/tournaments/${idTurnamen}/results/review`,
      csrfAdmin,
      { decision: "APPROVED" },
    );

    expect(res.status).toBe(409);
  });

  it("admin menyetujui seluruh hasil pending dan mencatat audit", async () => {
    await kirim(pemilik, "put", `/api/v1/tournaments/${idTurnamen}/results`, csrfPemilik, {
      results: hasilContoh,
    });

    const res = await kirim(
      admin,
      "patch",
      `/api/v1/admin/tournaments/${idTurnamen}/results/review`,
      csrfAdmin,
      { decision: "APPROVED", note: "Sesuai laporan resmi." },
    );

    expect(res.status).toBe(200);
    expect(res.body.data.jumlah).toBe(3);

    const hasil = await prisma.tournamentResult.findMany({
      where: { tournamentId: idTurnamen },
      select: { status: true, reviewedBy: true, adminNote: true },
    });
    expect(hasil.every((r) => r.status === "APPROVED")).toBe(true);
    expect(hasil.every((r) => r.reviewedBy === idAdmin)).toBe(true);
    expect(hasil[0].adminNote).toBe("Sesuai laporan resmi.");

    const audit = await prisma.tournamentResultReview.findMany({ where: { action: "APPROVED" } });
    expect(audit).toHaveLength(3);
    expect(audit.every((a) => a.actorId === idAdmin)).toBe(true);
  });

  it("hasil yang disetujui tampil di halaman publik", async () => {
    await kirim(pemilik, "put", `/api/v1/tournaments/${idTurnamen}/results`, csrfPemilik, {
      results: hasilContoh,
    });
    await kirim(admin, "patch", `/api/v1/admin/tournaments/${idTurnamen}/results/review`, csrfAdmin, {
      decision: "APPROVED",
    });
    await prisma.tournament.update({ where: { id: idTurnamen }, data: { isPublished: true } });

    const res = await klien().get(`/api/v1/tournaments/${slugTurnamen}`).expect(200);
    const hasil = res.body.data.tournament.results;

    expect(hasil).toHaveLength(3);
    expect(hasil.map((h: { position: number }) => h.position)).toEqual([1, 2, 3]);
  });

  it("menolak hasil wajib menyertakan catatan", async () => {
    await kirim(pemilik, "put", `/api/v1/tournaments/${idTurnamen}/results`, csrfPemilik, {
      results: hasilContoh,
    });

    const res = await kirim(
      admin,
      "patch",
      `/api/v1/admin/tournaments/${idTurnamen}/results/review`,
      csrfAdmin,
      { decision: "REJECTED" },
    );

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
  });

  it("admin menolak hasil dengan catatan", async () => {
    await kirim(pemilik, "put", `/api/v1/tournaments/${idTurnamen}/results`, csrfPemilik, {
      results: hasilContoh,
    });

    await kirim(
      admin,
      "patch",
      `/api/v1/admin/tournaments/${idTurnamen}/results/review`,
      csrfAdmin,
      { decision: "REJECTED", note: "Nama tim tidak sesuai." },
    ).expect(200);

    const hasil = await prisma.tournamentResult.findMany({
      where: { tournamentId: idTurnamen },
      select: { status: true, adminNote: true },
    });
    expect(hasil.every((r) => r.status === "REJECTED")).toBe(true);
    expect(hasil[0].adminNote).toBe("Nama tim tidak sesuai.");

    const audit = await prisma.tournamentResultReview.count({ where: { action: "REJECTED" } });
    expect(audit).toBe(3);
  });

  it("hasil yang ditolak tidak tampil publik", async () => {
    await kirim(pemilik, "put", `/api/v1/tournaments/${idTurnamen}/results`, csrfPemilik, {
      results: hasilContoh,
    });
    await kirim(admin, "patch", `/api/v1/admin/tournaments/${idTurnamen}/results/review`, csrfAdmin, {
      decision: "REJECTED",
      note: "Perbaiki.",
    });
    await prisma.tournament.update({ where: { id: idTurnamen }, data: { isPublished: true } });

    const res = await klien().get(`/api/v1/tournaments/${slugTurnamen}`).expect(200);
    expect(res.body.data.tournament.results).toEqual([]);
  });

  it("mengubah hasil yang sudah disetujui mengembalikannya ke PENDING_REVIEW", async () => {
    await kirim(pemilik, "put", `/api/v1/tournaments/${idTurnamen}/results`, csrfPemilik, {
      results: hasilContoh,
    });
    await kirim(admin, "patch", `/api/v1/admin/tournaments/${idTurnamen}/results/review`, csrfAdmin, {
      decision: "APPROVED",
      note: "Disetujui.",
    });

    await kirim(pemilik, "put", `/api/v1/tournaments/${idTurnamen}/results`, csrfPemilik, {
      results: [
        { position: 1, teamOrPlayer: "Tim Revisi" },
        { position: 2, teamOrPlayer: "Tim Beta" },
        { position: 3, teamOrPlayer: "Tim Gamma" },
      ],
    }).expect(200);

    const hasil = await prisma.tournamentResult.findMany({
      where: { tournamentId: idTurnamen },
      orderBy: { position: "asc" },
      select: { position: true, status: true, adminNote: true, reviewedBy: true },
    });

    expect(hasil).toHaveLength(3);
    expect(hasil[0]!.status).toBe("PENDING_REVIEW");
    expect(hasil[0]!.adminNote).toBeNull();
    expect(hasil[0]!.reviewedBy).toBeNull();
  });
});

describe("Publikasi turnamen", () => {
  it("penyelenggara tidak dapat mempublikasikan (403)", async () => {
    const res = await kirim(
      pemilik,
      "patch",
      `/api/v1/admin/tournaments/${idTurnamen}/publish`,
      csrfPemilik,
      { isPublished: true },
    );
    expect(res.status).toBe(403);
  });

  it("admin dapat mempublikasikan turnamen", async () => {
    const res = await kirim(
      admin,
      "patch",
      `/api/v1/admin/tournaments/${idTurnamen}/publish`,
      csrfAdmin,
      { isPublished: true },
    );

    expect(res.status).toBe(200);
    expect(res.body.data.isPublished).toBe(true);

    const turnamen = await prisma.tournament.findUniqueOrThrow({
      where: { id: idTurnamen },
      select: { isPublished: true, publishedAt: true, publishedBy: true },
    });
    expect(turnamen.isPublished).toBe(true);
    expect(turnamen.publishedAt).not.toBeNull();
    expect(turnamen.publishedBy).toBe(idAdmin);
  });

  it("admin dapat membatalkan publikasi", async () => {
    await kirim(admin, "patch", `/api/v1/admin/tournaments/${idTurnamen}/publish`, csrfAdmin, {
      isPublished: true,
    });
    await kirim(admin, "patch", `/api/v1/admin/tournaments/${idTurnamen}/publish`, csrfAdmin, {
      isPublished: false,
    }).expect(200);

    const turnamen = await prisma.tournament.findUniqueOrThrow({
      where: { id: idTurnamen },
      select: { isPublished: true, publishedAt: true },
    });
    expect(turnamen.isPublished).toBe(false);
    expect(turnamen.publishedAt).toBeNull();
  });

  it("turnamen tidak tampil publik setelah publikasi dibatalkan", async () => {
    await kirim(admin, "patch", `/api/v1/admin/tournaments/${idTurnamen}/publish`, csrfAdmin, {
      isPublished: true,
    });
    await kirim(admin, "patch", `/api/v1/admin/tournaments/${idTurnamen}/publish`, csrfAdmin, {
      isPublished: false,
    });

    const res = await klien().get(`/api/v1/tournaments/${slugTurnamen}`);
    expect(res.status).toBe(404);
  });

  it("menolak publikasi bila pengajuan terkait belum disetujui", async () => {
    const submission = await prisma.tournamentSubmission.create({
      data: {
        submittedBy: idPemilik,
        gameId: idGame,
        title: "Pengajuan Belum Disetujui",
        organizerName: "Penyelenggara",
        description: "Deskripsi.",
        startDate: new Date("2027-07-01"),
        endDate: new Date("2027-07-02"),
        status: "PENDING",
      },
      select: { id: true },
    });

    const turnamen = await prisma.tournament.create({
      data: {
        submissionId: submission.id,
        gameId: idGame,
        managerId: idPemilik,
        title: "Turnamen Pengajuan Pending",
        slug: "turnamen-pengajuan-pending-uji",
        organizerName: "Penyelenggara",
        description: "Deskripsi.",
        startDate: new Date("2027-07-01"),
        endDate: new Date("2027-07-02"),
      },
      select: { id: true },
    });

    const res = await kirim(
      admin,
      "patch",
      `/api/v1/admin/tournaments/${turnamen.id}/publish`,
      csrfAdmin,
      { isPublished: true },
    );

    expect(res.status).toBe(409);

    await prisma.tournament.delete({ where: { id: turnamen.id } });
    await prisma.tournamentSubmission.delete({ where: { id: submission.id } });
  });

  it("menolak publikasi bila ada hasil yang belum disetujui", async () => {
    await kirim(pemilik, "put", `/api/v1/tournaments/${idTurnamen}/results`, csrfPemilik, {
      results: hasilContoh,
    });

    const res = await kirim(
      admin,
      "patch",
      `/api/v1/admin/tournaments/${idTurnamen}/publish`,
      csrfAdmin,
      { isPublished: true },
    );

    expect(res.status).toBe(409);
    expect(res.body.error.message).toMatch(/belum disetujui/i);
  });

  it("menolak nilai isPublished yang bukan boolean", async () => {
    const res = await kirim(
      admin,
      "patch",
      `/api/v1/admin/tournaments/${idTurnamen}/publish`,
      csrfAdmin,
      { isPublished: "ya" },
    );
    expect(res.status).toBe(400);
  });
});

describe("Daftar turnamen admin", () => {
  it("menolak pengguna biasa", async () => {
    const res = await pemilik.get("/api/v1/admin/tournaments");
    expect(res.status).toBe(403);
  });

  it("mengembalikan ringkasan status hasil", async () => {
    await kirim(pemilik, "put", `/api/v1/tournaments/${idTurnamen}/results`, csrfPemilik, {
      results: hasilContoh,
    });

    const res = await admin.get("/api/v1/admin/tournaments").expect(200);
    const item = res.body.data.items.find((t: { id: string }) => t.id === idTurnamen);

    expect(item).toBeTruthy();
    expect(item.totalResults).toBe(3);
    expect(item.pendingResults).toBe(3);
    expect(item.approvedResults).toBe(0);
    expect(item.manager.username).toBeTruthy();
  });

  it("memfilter awaiting_results", async () => {
    await kirim(pemilik, "put", `/api/v1/tournaments/${idTurnamen}/results`, csrfPemilik, {
      results: hasilContoh,
    });
    await prisma.tournament.update({ where: { id: idTurnamen }, data: { isPublished: true } });

    const res = await admin.get("/api/v1/admin/tournaments?status=awaiting_results").expect(200);
    const ids = res.body.data.items.map((t: { id: string }) => t.id);
    expect(ids).toContain(idTurnamen);
  });

  it("menolak status filter tidak dikenal", async () => {
    const res = await admin.get("/api/v1/admin/tournaments?status=aneh").expect(400);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
  });
});

describe("Peninjauan hasil satuan", () => {
  async function siapkanHasil() {
    await kirim(pemilik, "put", `/api/v1/tournaments/${idTurnamen}/results`, csrfPemilik, {
      results: hasilContoh,
    });

    return prisma.tournamentResult.findMany({
      where: { tournamentId: idTurnamen },
      orderBy: { position: "asc" },
      select: { id: true, position: true },
    });
  }

  it("penyelenggara tidak dapat meninjau hasil satuan (403)", async () => {
    const hasil = await siapkanHasil();

    const res = await kirim(
      pemilik,
      "patch",
      `/api/v1/admin/tournaments/${idTurnamen}/results/${hasil[0]!.id}/review`,
      csrfPemilik,
      { decision: "APPROVED" },
    );

    expect(res.status).toBe(403);
  });

  it("admin menyetujui satu hasil tanpa mengubah status hasil lain", async () => {
    const hasil = await siapkanHasil();

    await kirim(
      admin,
      "patch",
      `/api/v1/admin/tournaments/${idTurnamen}/results/${hasil[0]!.id}/review`,
      csrfAdmin,
      { decision: "APPROVED", note: "Peringkat 1 sesuai." },
    ).expect(200);

    const sesudah = await prisma.tournamentResult.findMany({
      where: { tournamentId: idTurnamen },
      orderBy: { position: "asc" },
      select: { position: true, status: true, adminNote: true },
    });

    expect(sesudah[0]!.status).toBe("APPROVED");
    expect(sesudah[0]!.adminNote).toBe("Peringkat 1 sesuai.");
    expect(sesudah[1]!.status).toBe("PENDING_REVIEW");
    expect(sesudah[2]!.status).toBe("PENDING_REVIEW");
  });

  it("menolak satu hasil mewajibkan catatan", async () => {
    const hasil = await siapkanHasil();

    const res = await kirim(
      admin,
      "patch",
      `/api/v1/admin/tournaments/${idTurnamen}/results/${hasil[0]!.id}/review`,
      csrfAdmin,
      { decision: "REJECTED" },
    );

    expect(res.status).toBe(400);
  });

  it("menolak satu hasil menyimpan alasan pada baris itu saja", async () => {
    const hasil = await siapkanHasil();

    await kirim(
      admin,
      "patch",
      `/api/v1/admin/tournaments/${idTurnamen}/results/${hasil[1]!.id}/review`,
      csrfAdmin,
      { decision: "REJECTED", note: "Nama tim peringkat 2 keliru." },
    ).expect(200);

    const sesudah = await prisma.tournamentResult.findMany({
      where: { tournamentId: idTurnamen },
      orderBy: { position: "asc" },
      select: { position: true, status: true, adminNote: true },
    });

    expect(sesudah[1]!.status).toBe("REJECTED");
    expect(sesudah[1]!.adminNote).toBe("Nama tim peringkat 2 keliru.");
    expect(sesudah[0]!.status).toBe("PENDING_REVIEW");
    expect(sesudah[2]!.status).toBe("PENDING_REVIEW");
  });

  it("hasil yang disetujui individual tampil publik", async () => {
    const hasil = await siapkanHasil();

    await kirim(
      admin,
      "patch",
      `/api/v1/admin/tournaments/${idTurnamen}/results/${hasil[0]!.id}/review`,
      csrfAdmin,
      { decision: "APPROVED" },
    ).expect(200);

    await prisma.tournament.update({ where: { id: idTurnamen }, data: { isPublished: true } });

    const res = await klien().get(`/api/v1/tournaments/${slugTurnamen}`).expect(200);
    const tampil = res.body.data.tournament.results;

    expect(tampil).toHaveLength(1);
    expect(tampil[0].position).toBe(1);
    expect(tampil[0].teamOrPlayer).toBe("Tim Alpha");
  });

  it("hasil yang ditolak tetap tersembunyi dari publik", async () => {
    const hasil = await siapkanHasil();

    await kirim(
      admin,
      "patch",
      `/api/v1/admin/tournaments/${idTurnamen}/results/${hasil[2]!.id}/review`,
      csrfAdmin,
      { decision: "REJECTED", note: "Tidak lengkap." },
    ).expect(200);

    await prisma.tournament.update({ where: { id: idTurnamen }, data: { isPublished: true } });

    const res = await klien().get(`/api/v1/tournaments/${slugTurnamen}`).expect(200);
    expect(res.body.data.tournament.results).toEqual([]);
  });

  it("menolak keputusan kedua untuk hasil yang sama (409)", async () => {
    const hasil = await siapkanHasil();
    const url = `/api/v1/admin/tournaments/${idTurnamen}/results/${hasil[0]!.id}/review`;

    await kirim(admin, "patch", url, csrfAdmin, { decision: "APPROVED" }).expect(200);
    const kedua = await kirim(admin, "patch", url, csrfAdmin, { decision: "REJECTED", note: "Ubah." });

    expect(kedua.status).toBe(409);
  });

  it("mengembalikan 404 untuk hasil yang bukan milik turnamen ini", async () => {
    await siapkanHasil();

    const res = await kirim(
      admin,
      "patch",
      `/api/v1/admin/tournaments/${idTurnamen}/results/ffffffff-ffff-4fff-8fff-ffffffffffff/review`,
      csrfAdmin,
      { decision: "APPROVED" },
    );

    expect(res.status).toBe(404);
  });

  it("menyimpan satu notifikasi per keputusan hasil", async () => {
    const hasil = await siapkanHasil();

    await prisma.notification.deleteMany({ where: { userId: idPemilik } });

    await kirim(
      admin,
      "patch",
      `/api/v1/admin/tournaments/${idTurnamen}/results/${hasil[0]!.id}/review`,
      csrfAdmin,
      { decision: "APPROVED" },
    ).expect(200);

    const notifikasi = await prisma.notification.findMany({
      where: { userId: idPemilik },
      select: { type: true, referenceId: true },
    });

    expect(notifikasi).toHaveLength(1);
    expect(notifikasi[0]!.type).toBe("RESULT_APPROVED");
    expect(notifikasi[0]!.referenceId).toBe(idTurnamen);
  });

  it("notifikasi penolakan menyertakan alasan", async () => {
    const hasil = await siapkanHasil();
    await prisma.notification.deleteMany({ where: { userId: idPemilik } });

    await kirim(
      admin,
      "patch",
      `/api/v1/admin/tournaments/${idTurnamen}/results/${hasil[0]!.id}/review`,
      csrfAdmin,
      { decision: "REJECTED", note: "Nama tim salah ketik." },
    ).expect(200);

    const notifikasi = await prisma.notification.findFirstOrThrow({
      where: { userId: idPemilik },
      select: { type: true, message: true },
    });

    expect(notifikasi.type).toBe("RESULT_REJECTED");
    expect(notifikasi.message).toContain("Nama tim salah ketik.");
    expect(notifikasi.message).toContain("kirim ulang");
  });

  it("alasan penolakan yang panjang tidak menggagalkan keputusan", async () => {
    const hasil = await siapkanHasil();
    await prisma.notification.deleteMany({ where: { userId: idPemilik } });
    const alasan = "Nama tim perlu diperbaiki. ".repeat(40).trim();

    await kirim(
      admin,
      "patch",
      `/api/v1/admin/tournaments/${idTurnamen}/results/${hasil[0]!.id}/review`,
      csrfAdmin,
      { decision: "REJECTED", note: alasan },
    ).expect(200);

    const ditolak = await prisma.tournamentResult.findUniqueOrThrow({
      where: { id: hasil[0]!.id },
      select: { status: true, adminNote: true },
    });
    const notifikasi = await prisma.notification.findFirstOrThrow({
      where: { userId: idPemilik },
      select: { message: true },
    });

    expect(ditolak.status).toBe("REJECTED");
    expect(ditolak.adminNote).toBe(alasan);
    expect(notifikasi.message.length).toBeLessThanOrEqual(500);
  });

  it("mempertahankan hasil yang disetujui saat penyelenggara memperbaiki hasil lain", async () => {
    const hasil = await siapkanHasil();

    await kirim(
      admin,
      "patch",
      `/api/v1/admin/tournaments/${idTurnamen}/results/${hasil[0]!.id}/review`,
      csrfAdmin,
      { decision: "APPROVED", note: "Peringkat 1 sah." },
    ).expect(200);
    await kirim(
      admin,
      "patch",
      `/api/v1/admin/tournaments/${idTurnamen}/results/${hasil[1]!.id}/review`,
      csrfAdmin,
      { decision: "REJECTED", note: "Perbaiki peringkat 2." },
    ).expect(200);

    await kirim(pemilik, "put", `/api/v1/tournaments/${idTurnamen}/results`, csrfPemilik, {
      results: [
        { position: 1, teamOrPlayer: "Tim Alpha", note: "Juara 1" },
        { position: 2, teamOrPlayer: "Tim Beta Diperbaiki" },
        { position: 3, teamOrPlayer: "Tim Gamma" },
      ],
    }).expect(200);

    const sesudah = await prisma.tournamentResult.findMany({
      where: { tournamentId: idTurnamen },
      orderBy: { position: "asc" },
      select: {
        position: true,
        teamOrPlayer: true,
        status: true,
        reviewedBy: true,
        adminNote: true,
      },
    });

    // Peringkat 1 tidak diubah: status APPROVED dan jejak tinjauan tetap utuh.
    expect(sesudah[0]!.status).toBe("APPROVED");
    expect(sesudah[0]!.reviewedBy).toBe(idAdmin);
    expect(sesudah[0]!.adminNote).toBe("Peringkat 1 sah.");

    // Peringkat 2 diperbaiki: kembali ke antrean tinjauan tanpa jejak lama.
    expect(sesudah[1]!.teamOrPlayer).toBe("Tim Beta Diperbaiki");
    expect(sesudah[1]!.status).toBe("PENDING_REVIEW");
    expect(sesudah[1]!.reviewedBy).toBeNull();
    expect(sesudah[1]!.adminNote).toBeNull();

    // Peringkat 3 tidak diubah dan belum pernah disetujui: tetap menunggu tinjauan.
    expect(sesudah[2]!.status).toBe("PENDING_REVIEW");
  });

  it("hasil ditolak yang belum diperbaiki tetap berstatus REJECTED", async () => {
    const hasil = await siapkanHasil();

    await kirim(
      admin,
      "patch",
      `/api/v1/admin/tournaments/${idTurnamen}/results/${hasil[1]!.id}/review`,
      csrfAdmin,
      { decision: "REJECTED", note: "Nama tim belum benar." },
    ).expect(200);

    await kirim(pemilik, "put", `/api/v1/tournaments/${idTurnamen}/results`, csrfPemilik, {
      results: hasilContoh,
    }).expect(200);

    const ditolak = await prisma.tournamentResult.findFirstOrThrow({
      where: { tournamentId: idTurnamen, position: 2 },
      select: { status: true, adminNote: true, reviewedBy: true },
    });

    expect(ditolak.status).toBe("REJECTED");
    expect(ditolak.adminNote).toBe("Nama tim belum benar.");
    expect(ditolak.reviewedBy).toBe(idAdmin);
  });

  it("kirim ulang tanpa perubahan tidak menambah baris audit", async () => {
    await siapkanHasil();

    const sebelum = await prisma.tournamentResultReview.count({
      where: { result: { tournamentId: idTurnamen } },
    });

    await kirim(pemilik, "put", `/api/v1/tournaments/${idTurnamen}/results`, csrfPemilik, {
      results: hasilContoh,
    }).expect(200);

    const sesudah = await prisma.tournamentResultReview.count({
      where: { result: { tournamentId: idTurnamen } },
    });

    expect(sebelum).toBeGreaterThan(0);
    expect(sesudah).toBe(sebelum);
  });
});

describe("Konsistensi database", () => {
  it("setiap hasil APPROVED punya reviewer dan waktu tinjau", async () => {
    await kirim(pemilik, "put", `/api/v1/tournaments/${idTurnamen}/results`, csrfPemilik, {
      results: hasilContoh,
    });
    await kirim(admin, "patch", `/api/v1/admin/tournaments/${idTurnamen}/results/review`, csrfAdmin, {
      decision: "APPROVED",
    });

    const disetujui = await prisma.tournamentResult.findMany({
      where: { status: "APPROVED" },
      select: { reviewedBy: true, reviewedAt: true, status: true },
    });

    expect(disetujui.length).toBeGreaterThan(0);
    for (const r of disetujui) {
      expect(r.reviewedBy).toBeTruthy();
      expect(r.reviewedAt).not.toBeNull();
    }
  });

  it("setiap hasil PENDING_REVIEW tidak punya reviewer", async () => {
    await kirim(pemilik, "put", `/api/v1/tournaments/${idTurnamen}/results`, csrfPemilik, {
      results: hasilContoh,
    });

    const pending = await prisma.tournamentResult.findMany({
      where: { status: "PENDING_REVIEW" },
      select: { reviewedBy: true, reviewedAt: true },
    });

    for (const r of pending) {
      expect(r.reviewedBy).toBeNull();
      expect(r.reviewedAt).toBeNull();
    }
  });

  it("audit tercatat untuk setiap perubahan hasil", async () => {
    await kirim(pemilik, "put", `/api/v1/tournaments/${idTurnamen}/results`, csrfPemilik, {
      results: hasilContoh,
    });

    const jumlahHasil = await prisma.tournamentResult.count({ where: { tournamentId: idTurnamen } });
    const jumlahAudit = await prisma.tournamentResultReview.count();

    expect(jumlahAudit).toBe(jumlahHasil);
  });
});
