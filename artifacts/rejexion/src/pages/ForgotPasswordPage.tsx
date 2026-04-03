import { useState } from "react";
import { Link } from "wouter";
import { useForgotPassword } from "@workspace/api-client-react";

export default function ForgotPasswordPage() {
  const forgotPassword = useForgotPassword();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    forgotPassword.mutate(
      { data: { email } },
      {
        onSuccess: () => setSent(true),
        onError: () => setError("Something went wrong. Please try again."),
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
          {sent ? (
            <div className="space-y-4 text-center">
              <div className="w-12 h-12 rounded-full bg-accent mx-auto flex items-center justify-center">
                <svg className="w-5 h-5 text-accent-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h1 className="font-serif text-2xl font-light text-foreground">Check your email</h1>
              <p className="text-sm text-muted-foreground">
                If an account exists for {email}, we've sent a password reset link.
              </p>
              <Link href="/login">
                <span className="text-sm text-primary hover:underline cursor-pointer">Back to sign in</span>
              </Link>
            </div>
          ) : (
            <>
              <div className="space-y-2">
                <h1 className="font-serif text-3xl font-light text-foreground">Reset password</h1>
                <p className="text-sm text-muted-foreground">Enter your email and we'll send a reset link if your account exists</p>
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
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-lg border border-input bg-card text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-shadow"
                    placeholder="you@example.com"
                  />
                </div>
                <button
                  type="submit"
                  disabled={forgotPassword.isPending}
                  className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {forgotPassword.isPending ? "Sending..." : "Send reset link"}
                </button>
              </form>

              <p className="text-sm text-center text-muted-foreground">
                Remember it?{" "}
                <Link href="/login">
                  <span className="text-primary hover:underline cursor-pointer">Sign in</span>
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
