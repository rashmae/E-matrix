const SESSION_KEY = 'ie_matrix_session';

export interface SessionUser {
  uid: string;
  fullName: string;
  idNumber: string;
  yearLevel: string;
  email: string | null;
  role: 'student' | 'admin';
  photoURL: string | null;
  loginTime: string;
}

export function getSession(): SessionUser | null {
  try {
    const raw =
      sessionStorage.getItem(SESSION_KEY) ||
      localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as SessionUser;
  } catch {
    return null;
  }
}

export function setSession(data: SessionUser): void {
  const json = JSON.stringify(data);
  sessionStorage.setItem(SESSION_KEY, json);
  localStorage.setItem(SESSION_KEY, json);
}

export function updateSession(partial: Partial<SessionUser>): void {
  const current = getSession();
  if (!current) return;
  setSession({ ...current, ...partial });
}

export function clearSession(): void {
  sessionStorage.removeItem(SESSION_KEY);
  localStorage.removeItem(SESSION_KEY);
}
