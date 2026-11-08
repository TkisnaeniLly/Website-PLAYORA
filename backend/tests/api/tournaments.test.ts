import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { bersihkanData, prisma } from "../helpers/db";
import { buatGame, buatPengguna } from "../helpers/fixtures";
import { klien } from "../helpers/api";

const agent = klien();

let idGame = "";
let idPengguna = "";
const slug: Record<string, string> = {};

const HARI = 86_400_000;
const geser = (hari: number) => new Date(Date.now() + hari * HARI);

async function buatTurnamen(input: {
  kunci: string;
  title: string;
  startDate: Date;
  endDate: Date;
  isPublished?: boolean;
  submissionStatus?: "PENDING" | "NEEDS_REVISION" | "APPROVED" | "REJECTED";
  hasil?: { position: number; teamOrPlayer: string; note?: string }[];
}) {
  let submissionId: string | null = null;

  if (input.submissionStatus) {
    const submission = await prisma.tournamentSubmission.create({
      data: {
        submittedBy: idPengguna,
        gameId: idGame,
        title: `Pengajuan ${input.title}`,
        organizerName: "Penyelenggara Uji",
        description: "Deskripsi pengajuan.",
        startDate: input.startDate,
        endDate: input.endDate,
        status: input.submissionStatus,
      },
      select: { id: true },
    });
    submissionId = submission.id;
  }

  const turnamen = await prisma.tournament.create({
    data: {
      submissionId,
      gameId: idGame,
      managerId: idPengguna,
      title: input.title,
      slug: `uji-turnamen-${input.kunci}`,
      organizerName: "Penyelenggara Uji",
      description: `Deskripsi ${input.title}.`,
      startDate: input.startDate,
      endDate: input.endDate,
      format: "5v5, single elimination",
      prizePool: "Rp5.000.000",
      isPublished: input.isPublished ?? true,
      publishedAt: input.isPublished === false ? null : new Date(),
      results: input.hasil
        ? {
            create: input.hasil.map((h) => ({
              position: h.position,
              teamOrPlayer: h.teamOrPlayer,
              note: h.note ?? null,
              updatedBy: idPengguna,
              submittedBy: idPengguna,
              status: "APPROVED",
              reviewedBy: idPengguna,
              reviewedAt: new Date(),
            })),
          }
        : undefined,
    },
    select: { id: true, slug: true },
  });

  slug[input.kunci] = turnamen.slug;
  return turnamen;
}

beforeAll(async () => {
  await bersihkanData();

  const pengguna = await buatPengguna({
    email: "penyelenggara@playora.test",
    username: "penyelenggara",
  });
  idPengguna = pengguna.id;

  const game = await buatGame({ title: "Game Turnamen", genre: "MOBA" });
  idGame = game.id;

  await buatTurnamen({
    kunci: "mendatang",
    title: "Kejuaraan Mendatang",
    startDate: geser(14),
    endDate: geser(16),
    submissionStatus: "APPROVED",
    hasil: [
      { position: 1, teamOrPlayer: "Tim Alpha", note: "Juara 1" },
      { position: 2, teamOrPlayer: "Tim Beta" },
      { position: 3, teamOrPlayer: "Tim Gamma" },
    ],
  });

  await buatTurnamen({
    kunci: "berlangsung",
    title: "Turnamen Berlangsung",
    startDate: geser(-1),
    endDate: geser(1),
    submissionStatus: "APPROVED",
  });

  await buatTurnamen({
    kunci: "selesai",
    title: "Turnamen Selesai",
    startDate: geser(-30),
    endDate: geser(-28),
    submissionStatus: "APPROVED",
  });

  await buatTurnamen({
    kunci: "tanpa-pengajuan",
    title: "Turnamen Buatan Admin",
    startDate: geser(30),
    endDate: geser(31),
  });

  await buatTurnamen({
    kunci: "belum-terbit",
    title: "Turnamen Belum Terbit",
    startDate: geser(20),
    endDate: geser(21),
    isPublished: false,
    submissionStatus: "APPROVED",
  });

  await buatTurnamen({
    kunci: "pengajuan-pending",
    title: "Turnamen Pengajuan Pending",
    startDate: geser(25),
    endDate: geser(26),
    isPublished: true,
    submissionStatus: "PENDING",
  });

  await buatTurnamen({
    kunci: "pengajuan-ditolak",
    title: "Turnamen Pengajuan Ditolak",
    startDate: geser(27),
    endDate: geser(28),
    isPublished: true,
    submissionStatus: "REJECTED",
  });
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe("GET /api/v1/tournaments", () => {
  it("hanya menampilkan turnamen terpublikasi dengan pengajuan disetujui atau tanpa pengajuan", async () => {
    const res = await agent.get("/api/v1/tournaments").expect(200);

    const judul = res.body.data.items.map((t: { title: string }) => t.title);
    expect(judul).toContain("Kejuaraan Mendatang");
    expect(judul).toContain("Turnamen Berlangsung");
    expect(judul).toContain("Turnamen Selesai");
    expect(judul).toContain("Turnamen Buatan Admin");

    expect(judul).not.toContain("Turnamen Belum Terbit");
    expect(judul).not.toContain("Turnamen Pengajuan Pending");
    expect(judul).not.toContain("Turnamen Pengajuan Ditolak");
    expect(res.body.meta.total).toBe(4);
  });

  it("menyertakan status turunan dan data game", async () => {
    const res = await agent.get("/api/v1/tournaments").expect(200);
    const item = res.body.data.items.find(
      (t: { title: string }) => t.title === "Kejuaraan Mendatang",
    );

    expect(item.status).toBe("upcoming");
    expect(item.game.title).toBe("Game Turnamen");
    expect(item.game.slug).toBeTruthy();
    expect(item.organizerName).toBe("Penyelenggara Uji");
  });

  it("mengurutkan berdasarkan tanggal mulai terdekat", async () => {
    const res = await agent.get("/api/v1/tournaments").expect(200);
    const tanggal = res.body.data.items.map((t: { startDate: string }) =>
      new Date(t.startDate).getTime(),
    );
    const terurut = [...tanggal].sort((a, b) => a - b);
    expect(tanggal).toEqual(terurut);
  });

  it("memfilter status upcoming", async () => {
    const res = await agent.get("/api/v1/tournaments?status=upcoming").expect(200);

    const judul = res.body.data.items.map((t: { title: string }) => t.title);
    expect(judul).toEqual(
      expect.arrayContaining(["Kejuaraan Mendatang", "Turnamen Buatan Admin"]),
    );
    expect(judul).not.toContain("Turnamen Berlangsung");
    expect(judul).not.toContain("Turnamen Selesai");
    expect(res.body.data.items.every((t: { status: string }) => t.status === "upcoming")).toBe(true);
  });

  it("memfilter status ongoing", async () => {
    const res = await agent.get("/api/v1/tournaments?status=ongoing").expect(200);

    expect(res.body.data.items).toHaveLength(1);
    expect(res.body.data.items[0].title).toBe("Turnamen Berlangsung");
    expect(res.body.data.items[0].status).toBe("ongoing");
  });

  it("memfilter status finished", async () => {
    const res = await agent.get("/api/v1/tournaments?status=finished").expect(200);

    expect(res.body.data.items).toHaveLength(1);
    expect(res.body.data.items[0].title).toBe("Turnamen Selesai");
    expect(res.body.data.items[0].status).toBe("finished");
  });

  it("mengembalikan daftar kosong untuk status tanpa data", async () => {
    await prisma.tournament.updateMany({
      where: { slug: slug.selesai },
      data: { isPublished: false },
    });

    const res = await agent.get("/api/v1/tournaments?status=finished").expect(200);
    expect(res.body.data.items).toHaveLength(0);
    expect(res.body.meta.total).toBe(0);

    await prisma.tournament.updateMany({
      where: { slug: slug.selesai },
      data: { isPublished: true },
    });
  });

  it("menolak status yang tidak dikenal", async () => {
    const res = await agent.get("/api/v1/tournaments?status=selesai-banget").expect(400);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
  });

  it("membagi hasil dengan pagination", async () => {
    const halaman1 = await agent.get("/api/v1/tournaments?limit=2&page=1").expect(200);
    const halaman2 = await agent.get("/api/v1/tournaments?limit=2&page=2").expect(200);

    expect(halaman1.body.data.items).toHaveLength(2);
    expect(halaman1.body.meta).toEqual({ page: 1, limit: 2, total: 4 });
    expect(halaman2.body.data.items).toHaveLength(2);
    expect(halaman2.body.meta.page).toBe(2);
  });

  it("menolak limit dan halaman di luar batas", async () => {
    expect((await agent.get("/api/v1/tournaments?limit=100").expect(400)).body.error.code).toBe(
      "VALIDATION_ERROR",
    );
    expect((await agent.get("/api/v1/tournaments?page=0").expect(400)).body.error.code).toBe(
      "VALIDATION_ERROR",
    );
  });
});

describe("GET /api/v1/tournaments/:slug", () => {
  it("mengembalikan detail lengkap beserta game dan hasil terurut", async () => {
    const res = await agent.get(`/api/v1/tournaments/${slug.mendatang}`).expect(200);
    const turnamen = res.body.data.tournament;

    expect(turnamen.title).toBe("Kejuaraan Mendatang");
    expect(turnamen.status).toBe("upcoming");
    expect(turnamen.game.title).toBe("Game Turnamen");
    expect(turnamen.organizerName).toBe("Penyelenggara Uji");
    expect(turnamen.prizePool).toBe("Rp5.000.000");
    expect(turnamen.results).toHaveLength(3);
    expect(turnamen.results.map((h: { position: number }) => h.position)).toEqual([1, 2, 3]);
    expect(turnamen.results[0].teamOrPlayer).toBe("Tim Alpha");
    expect(turnamen.results[0].note).toBe("Juara 1");
  });

  it("tidak membocorkan data internal pengajuan", async () => {
    const res = await agent.get(`/api/v1/tournaments/${slug.mendatang}`).expect(200);
    expect(res.body.data.tournament).not.toHaveProperty("submissionId");
    expect(res.body.data.tournament).not.toHaveProperty("managerId");
    expect(res.body.data.tournament).not.toHaveProperty("publishedBy");
    expect(res.body.data.tournament.canManage).toBe(false);
  });

  it("mengembalikan hasil kosong untuk turnamen tanpa hasil", async () => {
    const res = await agent.get(`/api/v1/tournaments/${slug.berlangsung}`).expect(200);
    expect(res.body.data.tournament.results).toEqual([]);
  });

  it("mengembalikan 404 untuk turnamen yang belum dipublikasikan", async () => {
    const res = await agent.get(`/api/v1/tournaments/${slug["belum-terbit"]}`).expect(404);
    expect(res.body.error.code).toBe("NOT_FOUND");
  });

  it("mengembalikan 404 untuk turnamen dengan pengajuan PENDING", async () => {
    const res = await agent
      .get(`/api/v1/tournaments/${slug["pengajuan-pending"]}`)
      .expect(404);
    expect(res.body.error.code).toBe("NOT_FOUND");
  });

  it("mengembalikan 404 untuk turnamen dengan pengajuan REJECTED", async () => {
    const res = await agent
      .get(`/api/v1/tournaments/${slug["pengajuan-ditolak"]}`)
      .expect(404);
    expect(res.body.error.code).toBe("NOT_FOUND");
  });

  it("mengembalikan 404 untuk slug yang tidak ada", async () => {
    const res = await agent.get("/api/v1/tournaments/turnamen-tidak-ada").expect(404);
    expect(res.body.error.code).toBe("NOT_FOUND");
  });

  it("dapat membuka turnamen buatan admin tanpa pengajuan", async () => {
    const res = await agent.get(`/api/v1/tournaments/${slug["tanpa-pengajuan"]}`).expect(200);
    expect(res.body.data.tournament.title).toBe("Turnamen Buatan Admin");
  });
});
