import { prisma } from "../../config/prisma";
import { ApiError } from "../../utils/ApiError";

export async function daftarNotifikasi(
  userId: string,
  query: { unreadOnly: boolean; page: number; limit: number },
) {
  const where = {
    userId,
    ...(query.unreadOnly ? { isRead: false } : {}),
  };

  const skip = (query.page - 1) * query.limit;

  const [total, unreadCount, items] = await prisma.$transaction([
    prisma.notification.count({ where }),
    prisma.notification.count({ where: { userId, isRead: false } }),
    prisma.notification.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: query.limit,
      select: {
        id: true,
        type: true,
        title: true,
        message: true,
        referenceId: true,
        isRead: true,
        createdAt: true,
      },
    }),
  ]);

  return { items, total, unreadCount, page: query.page, limit: query.limit };
}

export async function tandaiDibaca(userId: string, notificationId: string): Promise<void> {
  const notifikasi = await prisma.notification.findFirst({
    where: { id: notificationId, userId },
    select: { id: true },
  });

  if (!notifikasi) {
    throw ApiError.notFound("Notifikasi tidak ditemukan.");
  }

  await prisma.notification.update({
    where: { id: notificationId },
    data: { isRead: true },
  });
}

export async function tandaiSemuaDibaca(userId: string): Promise<number> {
  const hasil = await prisma.notification.updateMany({
    where: { userId, isRead: false },
    data: { isRead: true },
  });

  return hasil.count;
}

export async function hitungBelumDibaca(userId: string): Promise<number> {
  return prisma.notification.count({ where: { userId, isRead: false } });
}
