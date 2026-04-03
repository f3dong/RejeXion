import { Link } from "wouter";
import { useAuth } from "@/lib/auth-context";
import { Redirect } from "wouter";

export default function LandingPage() {
  const { isAuthenticated, isLoading } = useAuth();

  if (!isLoading && isAuthenticated) {
    return <Redirect to="/timeline" />;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b border-border">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <span className="font-serif text-xl font-medium text-foreground tracking-tight">RejeXion</span>
          <div className="flex items-center gap-2">
            <Link href="/login">
              <span className="px-4 py-1.5 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors cursor-pointer">
                Sign in
              </span>
            </Link>
            <Link href="/register">
              <span className="px-4 py-1.5 rounded-md text-sm font-medium bg-primary text-primary-foreground hover:opacity-90 transition-opacity cursor-pointer">
                Get started
              </span>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col">
        <section className="flex-1 flex flex-col items-center justify-center text-center px-4 py-20">
          <div className="max-w-xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent text-accent-foreground text-xs font-medium uppercase tracking-wider mb-4">
              Private by design
            </div>
            <h1 className="font-serif text-4xl sm:text-5xl font-light text-foreground leading-tight">
              A private space to process rejection
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Rejection is part of every worthwhile pursuit. RejeXion gives you a calm, structured place to reflect — and revisit your growth over time.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <Link href="/register">
                <span className="w-full sm:w-auto px-6 py-3 rounded-lg bg-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity cursor-pointer inline-block text-center">
                  Start reflecting
                </span>
              </Link>
              <Link href="/login">
                <span className="w-full sm:w-auto px-6 py-3 rounded-lg border border-border text-foreground font-medium hover:bg-secondary transition-colors cursor-pointer inline-block text-center">
                  Sign in
                </span>
              </Link>
            </div>
          </div>
        </section>

        <section className="border-t border-border bg-card/50 px-4 py-16">
          <div className="max-w-3xl mx-auto">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
              <div className="space-y-2">
                <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center text-accent-foreground text-sm font-medium">1</div>
                <h3 className="font-medium text-foreground">Log the rejection</h3>
                <p className="text-sm text-muted-foreground">Record what happened and when, with guided prompts that help you reflect meaningfully.</p>
              </div>
              <div className="space-y-2">
                <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center text-accent-foreground text-sm font-medium">2</div>
                <h3 className="font-medium text-foreground">Reflect honestly</h3>
                <p className="text-sm text-muted-foreground">Answer four thoughtful prompts tailored to academic or career rejection — no judgment, just reflection.</p>
              </div>
              <div className="space-y-2">
                <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center text-accent-foreground text-sm font-medium">3</div>
                <h3 className="font-medium text-foreground">Revisit and grow</h3>
                <p className="text-sm text-muted-foreground">Come back to old entries and add growth notes as your perspective shifts over time.</p>
              </div>
            </div>
          </div>
        </section>

        <footer className="border-t border-border px-4 py-6">
          <div className="max-w-3xl mx-auto flex items-center justify-between">
            <span className="font-serif text-sm text-muted-foreground">RejeXion</span>
            <span className="text-sm text-muted-foreground">Private by default. Your data belongs to you.</span>
          </div>
        </footer>
      </main>
    </div>
  );
}
