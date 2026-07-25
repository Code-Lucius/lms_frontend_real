"use client";

import { useState, useTransition } from "react";
import { Arch } from "@/components/icons";
import { login } from "@/app/actions/auth";
import type { Role } from "@/types/next-auth";

interface LoginFormProps {
  title: string;
  subtitle: string;
  slugLabel: string;
  endpoint: string;
  role: Role;
  parishSlug?: string;
  footer?: React.ReactNode;
}

export function LoginForm({ title, subtitle, slugLabel, endpoint, role, parishSlug, footer }: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    startTransition(async () => {
      const result = await login({ email, password, endpoint, role, parishSlug });
      // On success, login() redirects server-side and never returns here.
      if (result && !result.success) {
        setError(result.message ?? "Something went wrong. Please try again.");
      }
    });
  }

  return (
    <section className="screen active">
      <div id="login-bg">
        <div className="login-card">
          <Arch style={{ margin: "-2px auto 0" }} />
          <div className="crest">&#10013;</div>
          <h1 className="parish-name">{title}</h1>
          <div className="parish-sub">{subtitle}</div>
          <div className="slug-chip">
            &#128205; yourdomain.org / <b>{slugLabel}</b> / login
          </div>

          <form onSubmit={handleSubmit}>
            <div className="field">
              <label htmlFor="email">Email address</label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isPending}
                required
              />
            </div>
            <div className="field" style={{ marginBottom: 10 }}>
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isPending}
                required
              />
            </div>

            {error && (
              <div role="alert" style={{ color: "#b91c1c", fontSize: 12.5, marginBottom: 14 }}>
                {error}
              </div>
            )}

            <div style={{ textAlign: "right", marginBottom: 18 }}>
              <a href="#" onClick={(e) => e.preventDefault()} style={{ fontSize: 12.5, color: "var(--plum)", textDecoration: "none", fontWeight: 600 }}>
                Forgot password?
              </a>
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: "100%" }} disabled={isPending}>
              {isPending ? "Signing in\u2026" : "Sign in"}
            </button>
          </form>

          {footer}
        </div>
      </div>
    </section>
  );
}
