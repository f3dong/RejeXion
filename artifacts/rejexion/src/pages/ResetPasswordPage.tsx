import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useResetPassword } from "@workspace/api-client-react";

export default function ResetPasswordPage() {
  const [, navigate] = useLocation();
  const resetPassword = useResetPassword();

  const token = new URLSearchParams(window.location.search).get("token") ?? "";
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    if (password !== confirm) {
      setError("Passwords don't match");
      return;
    }

    resetPassword.mutate(
      { data: { token, password } },
      {
        onSuccess: () => setSuccess(true),
        onError: (err: any) => {
          setError(err?.data?.error ?? "Invalid or expired reset link. Please try again.");
        },
      }
    );
  };

  if (success) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <header className="border-b border-border">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 h-14 flex items-center">
            <Link href="/">
              <span className="font-serif text-xl font-medium text-foreground tracking-tight cursor-pointer">RejeXion</span>
            </Link>
          </div>
        </header>
        <div className="flex-1 flex items-center justify-center px-4">
          <div className="text-center space-y-4">
            <h1 className="font-serif text-2xl font-light text-foreground">Password updated</h1>
            <p className="text-sm text-muted-foreground">Your password has been reset successfully.</p>
            <Link href="/login">
              <span className="inline-block px-6 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity cursor-pointer">
                Sign in
              </span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

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
            <h1 className="font-serif text-3xl font-light text-foreground">Set new password</h1>
            <p className="text-sm text-muted-foreground">Choose a strong password for your account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="px-4 py-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                {error}
              </div>
            )}
            <div className="space-y-1.5">
              <label htmlFor="password" className="block text-sm font-medium text-foreground">New password</label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-input bg-card text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-shadow"
                placeholder="At least 8 characters"
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="confirm" className="block text-sm font-medium text-foreground">Confirm password</label>
              <input
                id="confirm"
                type="password"
                required
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-input bg-card text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-shadow"
                placeholder="Repeat password"
              />
            </div>
            <button
              type="submit"
              disabled={resetPassword.isPending}
              className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {resetPassword.isPending ? "Updating..." : "Update password"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
