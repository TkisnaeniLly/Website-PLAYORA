import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import type { Role } from "@/types/api";

function LayarMemuat() {
  return (
    <section className="playora-container py-20" data-testid="auth-loading">
      <div className="mx-auto h-6 w-48 animate-pulse rounded bg-navy-100" />
    </section>
  );
}

export function RequireAuth({ children }: { children: ReactNode }) {
  const { data, isPending } = useAuth();
  const location = useLocation();

  if (isPending) return <LayarMemuat />;

  if (!data) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return <>{children}</>;
}

export function RequireRole({
  role,
  children,
}: {
  role: Role;
  children: ReactNode;
}) {
  const { data, isPending } = useAuth();
  const location = useLocation();

  if (isPending) return <LayarMemuat />;

  if (!data) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (data.role !== role) {
    return (
      <section className="playora-container py-20 text-center">
        <h1 className="text-2xl font-bold text-navy-800">Akses ditolak</h1>
        <p className="mt-2 text-sm text-muted">
          Halaman ini khusus administrator.
        </p>
      </section>
    );
  }

  return <>{children}</>;
}
