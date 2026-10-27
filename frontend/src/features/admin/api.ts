import { ApiError, apiFetch } from "@/lib/api";
import type { AdminOverview, AdminRegistration, AdminResult, RegistrationStatus } from "./types";

// Admin endpoints of the backend (backend/src/routes/admin.ts).
// The login token is kept in sessionStorage: it is gone when the tab closes and is sent only as
// an Authorization header (never a cookie), so other sites can't make requests with it.

const TOKEN_KEY = "udgam_admin_token";

interface StoredSession {
  token: string;
  expiresAt: number;
  role?: "admin" | "lead";
}

function readSession(): StoredSession | null {
  try {
    const raw = sessionStorage.getItem(TOKEN_KEY);
    if (!raw) return null;
    const s = JSON.parse(raw) as StoredSession;
    return s.expiresAt > Date.now() ? s : null;
  } catch {
    return null;
  }
}

function readToken(): string | null {
  return readSession()?.token ?? null;
}

function saveToken(value: StoredSession | null) {
  try {
    if (value) sessionStorage.setItem(TOKEN_KEY, JSON.stringify(value));
    else sessionStorage.removeItem(TOKEN_KEY);
  } catch {
    /* storage unavailable: the login just won't survive a reload */
  }
}

/** Calls an authenticated endpoint; a 401 clears the stored token. */
async function authed<T>(path: string, body?: unknown): Promise<AdminResult<T>> {
  const token = readToken();
  if (!token) return { ok: false, error: "unauthorized", message: "Please log in." };
  try {
    const res = await apiFetch<AdminResult<T>>(
      path,
      body === undefined ? { token } : { token, body },
    );
    if (!res.ok && res.error === "unauthorized") saveToken(null);
    return res;
  } catch (err) {
    return {
      ok: false,
      error: "error",
      message: err instanceof ApiError ? err.message : "Request failed.",
    };
  }
}

export async function loginAdmin({ data }: { data: { username: string; password: string } }) {
  const res = await apiFetch<
    | { ok: true; username: string; role: "admin" | "lead"; token: string; expiresAt: number }
    | { ok: false; message: string }
  >("/api/admin/login", { body: data });
  if (res.ok) saveToken({ token: res.token, expiresAt: res.expiresAt, role: res.role });
  return res;
}

export async function logoutAdmin() {
  saveToken(null);
  return { ok: true };
}

export async function getAdminSession(): Promise<{ username: string | null; role: "admin" | "lead" }> {
  const stored = readSession();
  if (!stored?.token) return { username: null, role: "admin" };
  const res = await apiFetch<{ username?: string; role?: "admin" | "lead" }>(
    "/api/admin/session",
    { token: stored.token },
  ).catch(() => null);
  if (!res?.username) {
    saveToken(null);
    return { username: null, role: "admin" };
  }
  // Update stored role from server (in case the token was issued before role was added)
  const role = res.role ?? stored.role ?? "admin";
  saveToken({ ...stored, role });
  return { username: res.username, role };
}

export const getAdminOverview = () => authed<AdminOverview>("/api/admin/overview");

export const getAdminEventRegistrations = ({
  data,
}: {
  data: { eventId: string; status: RegistrationStatus | "all" };
}) =>
  authed<AdminRegistration[]>(
    `/api/admin/events/${encodeURIComponent(data.eventId)}/registrations?status=${encodeURIComponent(data.status)}`,
  );

export const searchAdminRegistrations = ({ data }: { data: { q: string } }) =>
  authed<AdminRegistration[]>(`/api/admin/search?q=${encodeURIComponent(data.q.trim())}`);

export const runAdminBackupSync = () =>
  authed<{ configured: boolean; synced: number; failed: number; remaining: number }>(
    "/api/admin/backup-sync",
    {},
  );
