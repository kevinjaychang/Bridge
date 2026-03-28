import type { User } from "@/types/user";

const ACCOUNTS_KEY = "bridge-protocol.accounts";
const SESSION_KEY = "bridge-protocol.session";
export const AUTH_EVENT = "bridge-protocol-auth-changed";
export const AUTH_MODAL_EVENT = "bridge-protocol-auth-modal";

interface StoredAccount {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  authProvider: "local" | "google";
  password?: string;
  createdAt: Date;
}

const hasWindow = typeof window !== "undefined";

function emitAuthChange() {
  if (!hasWindow) {
    return;
  }

  window.dispatchEvent(new Event(AUTH_EVENT));
}

function readJson<T>(key: string, fallback: T): T {
  if (!hasWindow) {
    return fallback;
  }

  const rawValue = window.localStorage.getItem(key);
  if (!rawValue) {
    return fallback;
  }

  try {
    return JSON.parse(rawValue) as T;
  } catch {
    return fallback;
  }
}

function writeJson(key: string, value: unknown) {
  if (!hasWindow) {
    return;
  }

  window.localStorage.setItem(key, JSON.stringify(value));
}

function toStoredAccount(account: StoredAccount): StoredAccount {
  return {
    ...account,
    createdAt: new Date(account.createdAt),
  };
}

function sanitizeUser(account: StoredAccount): User {
  return {
    id: account.id,
    username: account.username,
    email: account.email,
    avatar: account.avatar,
    authProvider: account.authProvider,
    createdAt: new Date(account.createdAt),
  };
}

export function openAuthModal(mode: "signin" | "signup" = "signin") {
  if (!hasWindow) {
    return;
  }

  window.dispatchEvent(new CustomEvent(AUTH_MODAL_EVENT, { detail: { mode } }));
}

export function getStoredAccounts(): StoredAccount[] {
  return readJson<StoredAccount[]>(ACCOUNTS_KEY, []).map(toStoredAccount);
}

export function getSessionUser(): User | null {
  const storedUser = readJson<StoredAccount | null>(SESSION_KEY, null);

  if (!storedUser) {
    return null;
  }

  return sanitizeUser(toStoredAccount(storedUser));
}

export function signUpUser({
  username,
  email,
  password,
}: {
  username: string;
  email: string;
  password: string;
}) {
  const normalizedEmail = email.trim().toLowerCase();
  const trimmedUsername = username.trim();
  const trimmedPassword = password.trim();

  if (!trimmedUsername || !normalizedEmail || !trimmedPassword) {
    return { error: "Fill in username, email, and password." };
  }

  const accounts = getStoredAccounts();
  if (accounts.some((account) => account.email.toLowerCase() === normalizedEmail)) {
    return { error: "An account with that email already exists." };
  }

  const account: StoredAccount = {
    id: crypto.randomUUID(),
    username: trimmedUsername,
    email: normalizedEmail,
    authProvider: "local",
    password: trimmedPassword,
    createdAt: new Date(),
  };

  const nextAccounts = [account, ...accounts];
  writeJson(ACCOUNTS_KEY, nextAccounts);
  writeJson(SESSION_KEY, account);
  emitAuthChange();

  return { user: sanitizeUser(account) };
}

export function signInUser({ email, password }: { email: string; password: string }) {
  const normalizedEmail = email.trim().toLowerCase();
  const trimmedPassword = password.trim();
  const accounts = getStoredAccounts();

  const account = accounts.find(
    (entry) =>
      entry.authProvider === "local" &&
      entry.email.toLowerCase() === normalizedEmail &&
      entry.password === trimmedPassword,
  );

  if (!account) {
    return { error: "Email or password did not match a saved local user." };
  }

  writeJson(SESSION_KEY, account);
  emitAuthChange();

  return { user: sanitizeUser(account) };
}

export function signInWithGoogle({
  googleId,
  email,
  name,
  picture,
}: {
  googleId: string;
  email: string;
  name: string;
  picture?: string;
}) {
  const normalizedEmail = email.trim().toLowerCase();

  if (!googleId || !normalizedEmail || !name.trim()) {
    return { error: "Google did not return the required account details." };
  }

  const accounts = getStoredAccounts();
  const existingAccount = accounts.find((account) => account.email.toLowerCase() === normalizedEmail);

  const account: StoredAccount = existingAccount
    ? {
        ...existingAccount,
        username: name.trim(),
        email: normalizedEmail,
        avatar: picture,
        authProvider: "google",
      }
    : {
        id: googleId,
        username: name.trim(),
        email: normalizedEmail,
        avatar: picture,
        authProvider: "google",
        createdAt: new Date(),
      };

  const nextAccounts = [account, ...accounts.filter((entry) => entry.email.toLowerCase() !== normalizedEmail)];
  writeJson(ACCOUNTS_KEY, nextAccounts);
  writeJson(SESSION_KEY, account);
  emitAuthChange();

  return { user: sanitizeUser(account) };
}

export function signOutUser() {
  if (!hasWindow) {
    return;
  }

  window.localStorage.removeItem(SESSION_KEY);
  emitAuthChange();
}
