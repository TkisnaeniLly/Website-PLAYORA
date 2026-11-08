export type NotificationType =
  | "SUBMISSION_CREATED"
  | "SUBMISSION_STATUS_CHANGED"
  | "SUBMISSION_APPROVED"
  | "SUBMISSION_REJECTED"
  | "SUBMISSION_NEEDS_REVISION"
  | "RESULT_APPROVED"
  | "RESULT_REJECTED"
  | "CHANGE_REQUEST_APPROVED"
  | "CHANGE_REQUEST_REJECTED";

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  referenceId: string | null;
  isRead: boolean;
  createdAt: string;
}

export interface NotificationsPageResult {
  items: AppNotification[];
  unreadCount: number;
  total: number;
  page: number;
  limit: number;
}

export interface NotificationsQuery {
  unreadOnly?: boolean;
  page?: number;
  limit?: number;
}

export interface ProfileUser {
  id: string;
  name: string;
  username: string;
  email: string;
  role: "USER" | "ADMIN";
  avatarUrl: string | null;
  bio: string | null;
  createdAt: string;
}

export interface ProfileFormValues {
  name: string;
  username: string;
  bio?: string;
  avatarUrl?: string;
}

export interface PasswordFormValues {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}
