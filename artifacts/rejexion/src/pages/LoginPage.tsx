import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useLogin, getGetMeQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";

const isDev = import.meta.env.DEV;

export default function LoginPage() {
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();
  const login = useLogin();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [devLoading, setDevLoading] = useState(false);

  const handleDevLogin = async () => {
    setDevLoading(true);
    try {
      await queryClient.refetchQueries({ queryKey: getGetMeQueryKey() });
      navigate("/timeline");
    } finally {
      setDevLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    login.mutate(
      { data: { email, password } },
      {
        onSuccess: async () => {
          await queryClient.refetchQueries({ queryKey: getGetMeQueryKey() });
          navigate("/timeline");
        },
        onError: (err: any) => {
          setError(err?.data?.error ?? "Invalid email or password");
        },
      }
    );
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b border-border">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 h-14 flex items-center">
          <Link href="/">
            <span className="font-serif text-xl font-medium text-foreground tracking-tight cursor-pointer hover:text-primary transition-colors">RejeXion</span>
          </Link>
        </div>
      </header>

      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm space-y-8">
          <div className="space-y-2">
            <h1 className="font-serif text-3xl font-light text-foreground">Welcome back</h1>
            <p className="text-sm text-muted-foreground">Sign in to your private reflection space</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="px-4 py-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                {error}
              </div>
            )}
            <div className="space-y-1.5">
              <label htmlFor="email" className="block text-sm font-medium text-foreground">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-input bg-card text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-shadow"
                placeholder="you@example.com"
              />
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="block text-sm font-medium text-foreground">
                  Password
                </label>
                <Link href="/forgot-password">
                  <span className="text-xs text-primary hover:underline cursor-pointer">Forgot password?</span>
                </Link>
              </div>
              <input
                id="password"
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-input bg-card text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-shadow"
                placeholder="••••••••"
              />
            </div>
            <button
              type="submit"
              disabled={login.isPending}
              className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {login.isPending ? "Signing in..." : "Sign in"}
            </button>
          </form>

          {isDev && (
            <div className="pt-2 border-t border-border">
              <button
                type="button"
                onClick={handleDevLogin}
                disabled={devLoading}
                className="w-full py-2.5 rounded-lg border border-border bg-secondary text-secondary-foreground text-sm font-medium hover:bg-secondary/80 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {devLoading ? "Signing in..." : "Dev login (skip auth)"}
              </button>
              <p className="text-xs text-center text-muted-foreground mt-2">Development only — not visible in production</p>
            </div>
          )}

          <p className="text-sm text-center text-muted-foreground">
            No account?{" "}
            <Link href="/register">
              <span className="text-primary hover:underline cursor-pointer">Create one</span>
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
