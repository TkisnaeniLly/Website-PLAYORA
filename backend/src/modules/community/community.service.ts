import type { Prisma } from "@prisma/client";
import { prisma } from "../../config/prisma";
import { ApiError } from "../../utils/ApiError";
import type { AuthUser } from "../../types/auth";
import type { CommentInput, CommunityListQuery, PostInput } from "./community.schema";

const PILIHAN_PENULIS = {
  id: true,
  name: true,
  username: true,
  avatarUrl: true,
} as const;

function bentukPost(
  post: {
    id: string;
    title: string;
    body: string;
    category: string;
    imageUrl: string | null;
    isHidden: boolean;
    createdAt: Date;
    updatedAt: Date;
    author: { id: string; name: string; username: string; avatarUrl: string | null };
    _count: { comments: number; likes: number };
  },
  likedByMe: boolean,
) {
  return {
    id: post.id,
    title: post.title,
    body: post.body,
    category: post.category,
    imageUrl: post.imageUrl,
    isHidden: post.isHidden,
    createdAt: post.createdAt,
    updatedAt: post.updatedAt,
    author: post.author,
    commentCount: post._count.comments,
    likeCount: post._count.likes,
    likedByMe,
  };
}

export async function daftarPost(query: CommunityListQuery, userId?: string) {
  const where: Prisma.CommunityPostWhereInput = {
    isHidden: false,
    ...(query.category ? { category: query.category } : {}),
    ...(query.q
      ? { OR: [{ title: { contains: query.q } }, { body: { contains: query.q } }] }
      : {}),
  };

  const skip = (query.page - 1) * query.limit;

  const [total, items] = await prisma.$transaction([
    prisma.communityPost.count({ where }),
    prisma.communityPost.findMany({
      where,
      orderBy:
        query.sort === "populer"
          ? [{ likes: { _count: "desc" } }, { createdAt: "desc" }]
          : { createdAt: "desc" },
      skip,
      take: query.limit,
      select: {
        id: true,
        title: true,
        body: true,
        category: true,
        imageUrl: true,
        isHidden: true,
        createdAt: true,
        updatedAt: true,
        author: { select: PILIHAN_PENULIS },
        _count: { select: { comments: true, likes: true } },
      },
    }),
  ]);

  const disukai = new Set<string>();
  if (userId && items.length > 0) {
    const likes = await prisma.communityPostLike.findMany({
      where: { userId, postId: { in: items.map((item) => item.id) } },
      select: { postId: true },
    });
    likes.forEach((like) => disukai.add(like.postId));
  }

  return {
    items: items.map((item) => bentukPost(item, disukai.has(item.id))),
    total,
    page: query.page,
    limit: query.limit,
  };
}

export async function detailPost(id: string, user?: AuthUser) {
  const post = await prisma.communityPost.findUnique({
    where: { id },
    select: {
      id: true,
      title: true,
      body: true,
      category: true,
      imageUrl: true,
      isHidden: true,
      createdAt: true,
      updatedAt: true,
      author: { select: PILIHAN_PENULIS },
      comments: {
        orderBy: { createdAt: "asc" },
        take: 200,
        select: {
          id: true,
          body: true,
          createdAt: true,
          author: { select: PILIHAN_PENULIS },
        },
      },
      _count: { select: { comments: true, likes: true } },
    },
  });

  if (!post) throw ApiError.notFound("Postingan tidak ditemukan.");

  if (
    post.isHidden &&
    (!user || (user.id !== post.author.id && user.role !== "ADMIN"))
  ) {
    throw ApiError.notFound("Postingan tidak ditemukan.");
  }

  const liked = user
    ? Boolean(
        await prisma.communityPostLike.findUnique({
          where: { postId_userId: { postId: id, userId: user.id } },
          select: { postId: true },
        }),
      )
    : false;

  return { ...bentukPost(post, liked), comments: post.comments };
}

export async function buatPost(user: AuthUser, input: PostInput) {
  const post = await prisma.communityPost.create({
    data: {
      authorId: user.id,
      title: input.title,
      body: input.body,
      category: input.category,
      imageUrl: input.imageUrl ? input.imageUrl : null,
    },
    select: {
      id: true,
      title: true,
      body: true,
      category: true,
      imageUrl: true,
      isHidden: true,
      createdAt: true,
      updatedAt: true,
      author: { select: PILIHAN_PENULIS },
      _count: { select: { comments: true, likes: true } },
    },
  });

  return bentukPost(post, false);
}

async function pastikanPemilikAtauAdmin(user: AuthUser, postId: string) {
  const post = await prisma.communityPost.findUnique({
    where: { id: postId },
    select: { id: true, authorId: true },
  });

  if (!post) throw ApiError.notFound("Postingan tidak ditemukan.");

  if (user.role !== "ADMIN" && post.authorId !== user.id) {
    throw ApiError.forbidden("Anda hanya dapat mengubah postingan sendiri.");
  }

  return post;
}

export async function ubahPost(user: AuthUser, id: string, input: PostInput) {
  await pastikanPemilikAtauAdmin(user, id);

  const post = await prisma.communityPost.update({
    where: { id },
    data: {
      title: input.title,
      body: input.body,
      category: input.category,
      imageUrl: input.imageUrl ? input.imageUrl : null,
    },
    select: {
      id: true,
      title: true,
      body: true,
      category: true,
      imageUrl: true,
      isHidden: true,
      createdAt: true,
      updatedAt: true,
      author: { select: PILIHAN_PENULIS },
      _count: { select: { comments: true, likes: true } },
    },
  });

  return bentukPost(post, false);
}

export async function hapusPost(user: AuthUser, id: string) {
  await pastikanPemilikAtauAdmin(user, id);
  await prisma.communityPost.delete({ where: { id } });
  return { id };
}

export async function tambahKomentar(user: AuthUser, postId: string, input: CommentInput) {
  const post = await prisma.communityPost.findUnique({
    where: { id: postId },
    select: { id: true, isHidden: true },
  });

  if (!post || post.isHidden) throw ApiError.notFound("Postingan tidak ditemukan.");

  const komentar = await prisma.communityComment.create({
    data: { postId, authorId: user.id, body: input.body },
    select: {
      id: true,
      body: true,
      createdAt: true,
      author: { select: PILIHAN_PENULIS },
    },
  });

  return komentar;
}

export async function hapusKomentar(user: AuthUser, id: string) {
  const komentar = await prisma.communityComment.findUnique({
    where: { id },
    select: { id: true, authorId: true },
  });

  if (!komentar) throw ApiError.notFound("Komentar tidak ditemukan.");

  if (user.role !== "ADMIN" && komentar.authorId !== user.id) {
    throw ApiError.forbidden("Anda hanya dapat menghapus komentar sendiri.");
  }

  await prisma.communityComment.delete({ where: { id } });
  return { id };
}

export async function toggleLike(user: AuthUser, postId: string) {
  const post = await prisma.communityPost.findUnique({
    where: { id: postId },
    select: { id: true, isHidden: true },
  });

  if (!post || post.isHidden) throw ApiError.notFound("Postingan tidak ditemukan.");

  const ada = await prisma.communityPostLike.findUnique({
    where: { postId_userId: { postId, userId: user.id } },
    select: { postId: true },
  });

  if (ada) {
    await prisma.communityPostLike.delete({
      where: { postId_userId: { postId, userId: user.id } },
    });
  } else {
    await prisma.communityPostLike.create({ data: { postId, userId: user.id } });
  }

  const likeCount = await prisma.communityPostLike.count({ where: { postId } });

  return { liked: !ada, likeCount };
}

export async function aturSembunyi(postId: string, isHidden: boolean) {
  const post = await prisma.communityPost.findUnique({
    where: { id: postId },
    select: { id: true },
  });

  if (!post) throw ApiError.notFound("Postingan tidak ditemukan.");

  await prisma.communityPost.update({ where: { id: postId }, data: { isHidden } });

  return { id: postId, isHidden };
}

export async function daftarPostUntukAdmin(query: CommunityListQuery) {
  const where: Prisma.CommunityPostWhereInput = {
    ...(query.category ? { category: query.category } : {}),
    ...(query.q ? { title: { contains: query.q } } : {}),
  };

  const skip = (query.page - 1) * query.limit;

  const [total, items] = await prisma.$transaction([
    prisma.communityPost.count({ where }),
    prisma.communityPost.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: query.limit,
      select: {
        id: true,
        title: true,
        body: true,
        category: true,
        imageUrl: true,
        isHidden: true,
        createdAt: true,
        updatedAt: true,
        author: { select: PILIHAN_PENULIS },
        _count: { select: { comments: true, likes: true } },
      },
    }),
  ]);

  return { items: items.map((item) => bentukPost(item, false)), total, page: query.page, limit: query.limit };
}
