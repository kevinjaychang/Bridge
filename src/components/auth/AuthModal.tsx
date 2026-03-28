"use client";

import { type FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { CircleAlert, LockKeyhole, X } from "lucide-react";
import {
  AUTH_MODAL_EVENT,
  signInUser,
  signInWithGoogle,
  signUpUser,
} from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const GOOGLE_SCRIPT_ID = "google-identity-services";
const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

const emptyAuthForm = {
  username: "",
  email: "",
  password: "",
};

function parseJwtPayload(credential: string) {
  const payload = credential.split(".")[1];
  if (!payload) {
    return null;
  }

  try {
    const decoded = window.atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(decoded) as {
      sub?: string;
      email?: string;
      name?: string;
      picture?: string;
    };
  } catch {
    return null;
  }
}

export default function AuthModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signin");
  const [authForm, setAuthForm] = useState(emptyAuthForm);
  const [authError, setAuthError] = useState("");
  const googleButtonRef = useRef<HTMLDivElement | null>(null);

  const googleReady = useMemo(() => Boolean(GOOGLE_CLIENT_ID), []);

  useEffect(() => {
    function handleOpen(event: Event) {
      const customEvent = event as CustomEvent<{ mode?: "signin" | "signup" }>;
      setAuthMode(customEvent.detail?.mode ?? "signin");
      setAuthError("");
      setIsOpen(true);
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    window.addEventListener(AUTH_MODAL_EVENT, handleOpen as EventListener);
    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener(AUTH_MODAL_EVENT, handleOpen as EventListener);
      window.removeEventListener("keydown", handleEscape);
    };
  }, []);

  useEffect(() => {
    if (!isOpen) {
      document.body.style.overflow = "";
      return;
    }

    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || !googleReady || !googleButtonRef.current) {
      return;
    }

    let cancelled = false;

    function renderGoogleButton() {
      if (cancelled || !googleButtonRef.current || !window.google || !GOOGLE_CLIENT_ID) {
        return;
      }

      googleButtonRef.current.innerHTML = "";
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: ({ credential }) => {
          if (!credential) {
            setAuthError("Google sign-in did not return a valid credential.");
            return;
          }

          const payload = parseJwtPayload(credential);
          if (!payload?.sub || !payload.email || !payload.name) {
            setAuthError("Google sign-in returned incomplete profile details.");
            return;
          }

          const result = signInWithGoogle({
            googleId: payload.sub,
            email: payload.email,
            name: payload.name,
            picture: payload.picture,
          });

          if ("error" in result) {
            setAuthError(result.error);
            return;
          }

          setAuthForm(emptyAuthForm);
          setAuthError("");
          setIsOpen(false);
        },
      });
      window.google.accounts.id.renderButton(googleButtonRef.current, {
        theme: "outline",
        size: "large",
        shape: "pill",
        text: "continue_with",
        width: 320,
        logo_alignment: "left",
      });
    }

    if (window.google) {
      renderGoogleButton();
      return;
    }

    const existingScript = document.getElementById(GOOGLE_SCRIPT_ID) as HTMLScriptElement | null;
    if (existingScript) {
      existingScript.addEventListener("load", renderGoogleButton, { once: true });
      return () => {
        cancelled = true;
        existingScript.removeEventListener("load", renderGoogleButton);
      };
    }

    const script = document.createElement("script");
    script.id = GOOGLE_SCRIPT_ID;
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = renderGoogleButton;
    document.head.appendChild(script);

    return () => {
      cancelled = true;
      script.removeEventListener("load", renderGoogleButton);
    };
  }, [googleReady, isOpen]);

  function closeModal() {
    setIsOpen(false);
    setAuthError("");
  }

  function handleAuthSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const result =
      authMode === "signup"
        ? signUpUser(authForm)
        : signInUser({ email: authForm.email, password: authForm.password });

    if ("error" in result) {
      setAuthError(result.error);
      return;
    }

    setAuthError("");
    setAuthForm(emptyAuthForm);
    setIsOpen(false);
  }

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 px-4 py-8 backdrop-blur-sm">
      <div className="absolute inset-0" onClick={closeModal} />
      <Card className="relative z-10 w-full max-w-md border-white/40 bg-white/95 shadow-[0_30px_100px_-45px_rgba(15,23,42,0.7)]">
        <CardHeader className="space-y-4 pb-4">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 rounded-full bg-sky-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-sky-800">
                <LockKeyhole className="h-3.5 w-3.5" />
                Account access
              </div>
              <CardTitle className="text-2xl">
                {authMode === "signup" ? "Create your account" : "Sign in to Bridge"}
              </CardTitle>
              <CardDescription>
                Use Google for one-click access, or continue with a browser-local demo account.
              </CardDescription>
            </div>
            <Button variant="ghost" size="icon" aria-label="Close sign-in modal" onClick={closeModal}>
              <X className="h-5 w-5" />
            </Button>
          </div>

          <div className="inline-flex rounded-full border border-slate-200 bg-slate-100 p-1">
            <button
              type="button"
              onClick={() => {
                setAuthMode("signin");
                setAuthError("");
              }}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                authMode === "signin" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600"
              }`}
            >
              Sign in
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthMode("signup");
                setAuthError("");
              }}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                authMode === "signup" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600"
              }`}
            >
              Create account
            </button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div ref={googleButtonRef} className="min-h-11" />
            {!googleReady ? (
              <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                Google sign-in is disabled until <code>NEXT_PUBLIC_GOOGLE_CLIENT_ID</code> is set.
              </div>
            ) : null}
          </div>

          <div className="flex items-center gap-3 text-xs uppercase tracking-[0.18em] text-slate-400">
            <span className="h-px flex-1 bg-slate-200" />
            Or continue with email
            <span className="h-px flex-1 bg-slate-200" />
          </div>

          <form onSubmit={handleAuthSubmit} className="space-y-4">
            {authMode === "signup" ? (
              <div className="space-y-2">
                <Label htmlFor="signup-username">Username</Label>
                <Input
                  id="signup-username"
                  value={authForm.username}
                  onChange={(event) => setAuthForm((current) => ({ ...current, username: event.target.value }))}
                  placeholder="Casey"
                />
              </div>
            ) : null}

            <div className="space-y-2">
              <Label htmlFor="auth-email">Email</Label>
              <Input
                id="auth-email"
                type="email"
                value={authForm.email}
                onChange={(event) => setAuthForm((current) => ({ ...current, email: event.target.value }))}
                placeholder="casey@example.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="auth-password">Password</Label>
              <Input
                id="auth-password"
                type="password"
                value={authForm.password}
                onChange={(event) => setAuthForm((current) => ({ ...current, password: event.target.value }))}
                placeholder={authMode === "signup" ? "Create a password" : "Enter your password"}
              />
            </div>

            {authError ? (
              <div className="flex items-start gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{authError}</span>
              </div>
            ) : null}

            <div className="rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-900">
              Demo note: email/password accounts stay in this browser only. Google sign-in also creates a local session
              for this app after Google returns profile details.
            </div>

            <Button type="submit" variant="secondary" className="w-full">
              {authMode === "signup" ? "Create account" : "Sign in"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
