import type { Role } from "@prisma/client";

export interface AuthUser {
  id: string;
  name: string;
  username: string;
  email: string;
  role: Role;
  avatarUrl: string | null;
  bio: string | null;
  createdAt: Date;
}
