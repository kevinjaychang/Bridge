import type { User as SupabaseUser } from "@supabase/supabase-js";
import type { User } from "@/types/user";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export const AUTH_EVENT = "bridge-protocol-auth-changed";
export const AUTH_MODAL_EVENT = "bridge-protocol-auth-modal";

let authSubscriptionBound = false;

function hasWindow() {
  return typeof window !== "undefined";
}

function emitAuthChange() {
  if (!hasWindow()) {
    return;
  }

  window.dispatchEvent(new Event(AUTH_EVENT));
}

function deriveUsername(user: SupabaseUser) {
  const metadata = user.user_metadata ?? {};
  const candidate =
    metadata.username ??
    metadata.user_name ??
    metadata.full_name ??
    metadata.name ??
    user.email?.split("@")[0] ??
    "Bridge User";

  return String(candidate).trim() || "Bridge User";
}

function deriveProvider(user: SupabaseUser): User["authProvider"] {
  const provider =
    user.app_metadata?.provider ??
    user.identities?.[0]?.provider ??
    "email";

  return provider === "google" ? "google" : "email";
}

function mapSupabaseUser(user: SupabaseUser): User {
  return {
    id: user.id,
    username: deriveUsername(user),
    email: user.email ?? "",
    avatar: user.user_metadata?.avatar_url ?? user.user_metadata?.picture,
    authProvider: deriveProvider(user),
    createdAt: new Date(user.created_at),
  };
}

function ensureAuthSubscription() {
  if (!hasWindow() || authSubscriptionBound) {
    return;
  }

  const supabase = getSupabaseBrowserClient();
  if (!supabase) {
    return;
  }

  supabase.auth.onAuthStateChange(() => {
    emitAuthChange();
  });

  authSubscriptionBound = true;
}

export function openAuthModal(mode: "signin" | "signup" = "signin") {
  if (!hasWindow()) {
    return;
  }

  ensureAuthSubscription();
  window.dispatchEvent(new CustomEvent(AUTH_MODAL_EVENT, { detail: { mode } }));
}

export async function getSessionUser() {
  ensureAuthSubscription();

  const supabase = getSupabaseBrowserClient();
  if (!supabase) {
    return null;
  }

  const {
    data: { session },
  } = await supabase.auth.getSession();

  return session?.user ? mapSupabaseUser(session.user) : null;
}

export async function signUpUser({
  username,
  email,
  password,
}: {
  username: string;
  email: string;
  password: string;
}) {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) {
    return { error: "Supabase auth is not configured." };
  }

  const normalizedEmail = email.trim().toLowerCase();
  const trimmedUsername = username.trim();
  const trimmedPassword = password.trim();

  if (!trimmedUsername || !normalizedEmail || !trimmedPassword) {
    return { error: "Fill in username, email, and password." };
  }

  const { data, error } = await supabase.auth.signUp({
    email: normalizedEmail,
    password: trimmedPassword,
    options: {
      data: {
        username: trimmedUsername,
      },
    },
  });

  if (error) {
    return { error: error.message };
  }

  emitAuthChange();

  if (!data.user) {
    return { error: "Account created, but the session user could not be loaded yet." };
  }

  return { user: mapSupabaseUser(data.user) };
}

export async function signInUser({ email, password }: { email: string; password: string }) {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) {
    return { error: "Supabase auth is not configured." };
  }

  const normalizedEmail = email.trim().toLowerCase();
  const trimmedPassword = password.trim();

  const { data, error } = await supabase.auth.signInWithPassword({
    email: normalizedEmail,
    password: trimmedPassword,
  });

  if (error) {
    return { error: error.message };
  }

  emitAuthChange();

  if (!data.user) {
    return { error: "Sign-in succeeded, but the session user could not be loaded." };
  }

  return { user: mapSupabaseUser(data.user) };
}

export async function signInWithGoogle() {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) {
    return { error: "Supabase auth is not configured." };
  }

  const redirectTo = hasWindow() ? window.location.href : undefined;

  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo,
      queryParams: {
        prompt: "select_account",
      },
    },
  });

  if (error) {
    return { error: error.message };
  }

  return { ok: true };
}

export async function signOutUser() {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) {
    return;
  }

  await supabase.auth.signOut();
  emitAuthChange();
}
