import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { bersihkanData, prisma } from "../helpers/db";
import { ambilCsrf, klien, kirim } from "../helpers/api";

const SANDI = "Komunitas123!";
type Agent = ReturnType<typeof klien>;

let penulis: Agent, csrfPenulis = "";
let pembaca: Agent, csrfPembaca = "";
let admin: Agent, csrfAdmin = "";
let idAdmin = "";

async function daftar(email: string, username: string, name: string) {
  const agent = klien();
  const csrf = await ambilCsrf(agent);
  await kirim(agent, "post", "/api/v1/auth/register", csrf, {
    name,
    username,
    email,
    password: SANDI,
  }).expect(201);
  return agent;
}

beforeAll(async () => {
  await bersihkanData();
  const stempel = Date.now();

  penulis = await daftar(`kom.${stempel}@playora.test`, `kom_${stempel}`, "Penulis Uji");
  csrfPenulis = await ambilCsrf(penulis);

  pembaca = await daftar(`kom.pembaca.${stempel}@playora.test`, `kom_p_${stempel}`, "Pembaca Uji");
  csrfPembaca = await ambilCsrf(pembaca);

  admin = await daftar(`kom.admin.${stempel}@playora.test`, `kom_a_${stempel}`, "Admin Komunitas");
  idAdmin = (
    await prisma.user.findUniqueOrThrow({ where: { email: `kom.admin.${stempel}@playora.test` } })
  ).id;
  await prisma.user.update({ where: { id: idAdmin }, data: { role: "ADMIN" } });
  csrfAdmin = await ambilCsrf(admin);
});

afterAll(async () => {
  await prisma.$disconnect();
});

beforeEach(async () => {
  await prisma.communityPost.deleteMany({});
});

async function buatPost(judul = "Diskusi Game Favorit") {
  const res = await kirim(penulis, "post", "/api/v1/community/posts", csrfPenulis, {
    title: judul,
    body: "Menurut kalian game apa yang paling seru tahun ini? Yuk diskusi.",
    category: "DISKUSI",
  });
  return res;
}

describe("Komunitas — postingan", () => {
  it("tamu dapat membaca daftar postingan", async () => {
    const res = await klien().get("/api/v1/community/posts");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data.items)).toBe(true);
  });

  it("tamu tidak dapat membuat postingan", async () => {
    const res = await klien().post("/api/v1/community/posts").send({ title: "Halo", body: "Isi" });
    expect([401, 403]).toContain(res.status);
  });

  it("pengguna terdaftar dapat membuat postingan", async () => {
    const res = await buatPost("Postingan Pertama Saya");
    expect(res.status).toBe(201);
    expect(res.body.data.post.title).toBe("Postingan Pertama Saya");
    expect(res.body.data.post.author.name).toBe("Penulis Uji");
    expect(res.body.data.post.commentCount).toBe(0);
    expect(res.body.data.post.likeCount).toBe(0);
  });

  it("menolak postingan terlalu pendek (400)", async () => {
    const res = await kirim(penulis, "post", "/api/v1/community/posts", csrfPenulis, {
      title: "Hi",
      body: "pendek",
      category: "DISKUSI",
    });
    expect(res.status).toBe(400);
  });

  it("postingan baru muncul di daftar publik", async () => {
    await buatPost("Muncul di Daftar");
    const res = await klien().get("/api/v1/community/posts");
    expect(res.body.data.items.some((p: { title: string }) => p.title === "Muncul di Daftar")).toBe(
      true,
    );
    expect(res.body.meta.total).toBe(1);
  });

  it("filter kategori bekerja", async () => {
    await buatPost("Diskusi Umum");
    await kirim(penulis, "post", "/api/v1/community/posts", csrfPenulis, {
      title: "Tips Bermain",
      body: "Berikut tips bermain yang bisa kamu coba hari ini.",
      category: "TIPS",
    }).expect(201);

    const res = await klien().get("/api/v1/community/posts?category=TIPS");
    expect(res.body.data.items).toHaveLength(1);
    expect(res.body.data.items[0].title).toBe("Tips Bermain");
  });

  it("pencarian judul bekerja", async () => {
    await buatPost("Pencarian Unik Valorant");
    const res = await klien().get("/api/v1/community/posts?q=Unik");
    expect(res.body.data.items).toHaveLength(1);
  });

  it("pemilik dapat mengubah postingannya", async () => {
    const dibuat = await buatPost();
    const id = dibuat.body.data.post.id;

    const res = await kirim(penulis, "patch", `/api/v1/community/posts/${id}`, csrfPenulis, {
      title: "Judul Setelah Diubah",
      body: "Isi postingan yang sudah diperbarui oleh penulisnya.",
      category: "DISKUSI",
    });
    expect(res.status).toBe(200);
    expect(res.body.data.post.title).toBe("Judul Setelah Diubah");
  });

  it("pengguna lain tidak dapat mengubah postingan (403)", async () => {
    const dibuat = await buatPost();
    const res = await kirim(
      pembaca,
      "patch",
      `/api/v1/community/posts/${dibuat.body.data.post.id}`,
      csrfPembaca,
      { title: "Bajak", body: "Isi bajakan oleh pengguna lain.", category: "DISKUSI" },
    );
    expect(res.status).toBe(403);
  });

  it("pemilik dapat menghapus postingannya", async () => {
    const dibuat = await buatPost();
    const res = await kirim(
      penulis,
      "delete",
      `/api/v1/community/posts/${dibuat.body.data.post.id}`,
      csrfPenulis,
      {},
    );
    expect(res.status).toBe(200);
    expect(await prisma.communityPost.count()).toBe(0);
  });

  it("detail postingan memuat komentar", async () => {
    const dibuat = await buatPost();
    const id = dibuat.body.data.post.id;

    await kirim(pembaca, "post", `/api/v1/community/posts/${id}/comments`, csrfPembaca, {
      body: "Setuju, game itu seru!",
    }).expect(201);

    const res = await klien().get(`/api/v1/community/posts/${id}`);
    expect(res.status).toBe(200);
    expect(res.body.data.post.comments).toHaveLength(1);
    expect(res.body.data.post.commentCount).toBe(1);
  });
});

describe("Komunitas — like", () => {
  it("like dan unlike mengubah jumlah suka", async () => {
    const dibuat = await buatPost();
    const id = dibuat.body.data.post.id;

    const suka = await kirim(pembaca, "post", `/api/v1/community/posts/${id}/like`, csrfPembaca, {});
    expect(suka.status).toBe(200);
    expect(suka.body.data.liked).toBe(true);
    expect(suka.body.data.likeCount).toBe(1);

    const batal = await kirim(
      pembaca,
      "post",
      `/api/v1/community/posts/${id}/like`,
      csrfPembaca,
      {},
    );
    expect(batal.body.data.liked).toBe(false);
    expect(batal.body.data.likeCount).toBe(0);
  });

  it("likedByMe hanya benar untuk pengguna yang menyukai", async () => {
    const dibuat = await buatPost();
    const id = dibuat.body.data.post.id;

    await kirim(pembaca, "post", `/api/v1/community/posts/${id}/like`, csrfPembaca, {}).expect(200);

    const res = await pembaca.get("/api/v1/community/posts");
    const post = res.body.data.items.find((p: { id: string }) => p.id === id);
    expect(post.likedByMe).toBe(true);
  });
});

describe("Komunitas — komentar", () => {
  it("pemilik komentar dapat menghapus komentarnya", async () => {
    const dibuat = await buatPost();
    const komentar = await kirim(
      pembaca,
      "post",
      `/api/v1/community/posts/${dibuat.body.data.post.id}/comments`,
      csrfPembaca,
      { body: "Komentar untuk dihapus." },
    ).expect(201);

    const res = await kirim(
      pembaca,
      "delete",
      `/api/v1/community/comments/${komentar.body.data.comment.id}`,
      csrfPembaca,
      {},
    );
    expect(res.status).toBe(200);
    expect(await prisma.communityComment.count()).toBe(0);
  });

  it("pengguna lain tidak dapat menghapus komentar orang (403)", async () => {
    const dibuat = await buatPost();
    const komentar = await kirim(
      pembaca,
      "post",
      `/api/v1/community/posts/${dibuat.body.data.post.id}/comments`,
      csrfPembaca,
      { body: "Komentar milik pembaca." },
    ).expect(201);

    const res = await kirim(
      penulis,
      "delete",
      `/api/v1/community/comments/${komentar.body.data.comment.id}`,
      csrfPenulis,
      {},
    );
    expect(res.status).toBe(403);
  });
});

describe("Komunitas — moderasi admin", () => {
  it("admin dapat menyembunyikan postingan", async () => {
    const dibuat = await buatPost("Postingan Perlu Moderasi");
    const id = dibuat.body.data.post.id;

    const res = await kirim(
      admin,
      "patch",
      `/api/v1/admin/community/posts/${id}/hide`,
      csrfAdmin,
      { isHidden: true },
    );
    expect(res.status).toBe(200);
    expect(res.body.data.isHidden).toBe(true);
  });

  it("postingan tersembunyi hilang dari daftar publik", async () => {
    const dibuat = await buatPost("Postingan Disembunyikan");
    const id = dibuat.body.data.post.id;

    await kirim(admin, "patch", `/api/v1/admin/community/posts/${id}/hide`, csrfAdmin, {
      isHidden: true,
    }).expect(200);

    const publik = await klien().get("/api/v1/community/posts");
    expect(publik.body.data.items).toHaveLength(0);

    const adminList = await admin.get("/api/v1/admin/community/posts");
    expect(adminList.body.data.items).toHaveLength(1);
  });

  it("pengguna biasa tidak dapat menyembunyikan postingan (403)", async () => {
    const dibuat = await buatPost();
    const res = await kirim(
      penulis,
      "patch",
      `/api/v1/admin/community/posts/${dibuat.body.data.post.id}/hide`,
      csrfPenulis,
      { isHidden: true },
    );
    expect(res.status).toBe(403);
  });
});
