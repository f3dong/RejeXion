import { useState } from "react";
import { Link } from "wouter";
import { useListEntries, getListEntriesQueryKey } from "@workspace/api-client-react";
import { Layout } from "@/components/Layout";
import { format } from "date-fns";

type Category = "all" | "academic" | "career";

export default function TimelinePage() {
  const [filter, setFilter] = useState<Category>("all");

  const { data: entries, isLoading } = useListEntries(
    filter !== "all" ? { category: filter } : {},
    { query: { queryKey: getListEntriesQueryKey(filter !== "all" ? { category: filter } : {}) } }
  );

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-serif text-2xl font-light text-foreground">Your timeline</h1>
            <p className="text-sm text-muted-foreground mt-0.5">A private record of where you've been</p>
          </div>
          <Link href="/entries/new">
            <span className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity cursor-pointer">
              New entry
            </span>
          </Link>
        </div>

        <div className="flex items-center gap-1 p-1 rounded-lg bg-secondary/50 w-fit">
          {(["all", "academic", "career"] as Category[]).map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors capitalize ${
                filter === cat
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 rounded-xl bg-secondary/50 animate-pulse" />
            ))}
          </div>
        ) : !entries || entries.length === 0 ? (
          <div className="text-center py-16 space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-accent mx-auto flex items-center justify-center">
              <svg className="w-7 h-7 text-accent-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <h3 className="font-medium text-foreground">No entries yet</h3>
              <p className="text-sm text-muted-foreground mt-1">
                {filter === "all"
                  ? "When you experience a rejection worth reflecting on, add it here."
                  : `No ${filter} entries yet.`}
              </p>
            </div>
            <Link href="/entries/new">
              <span className="inline-block px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity cursor-pointer">
                Add your first entry
              </span>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {entries.map((entry) => (
              <Link key={entry.id} href={`/entries/${entry.id}`}>
                <div className="group p-5 rounded-xl border border-border bg-card hover:border-primary/30 hover:shadow-sm transition-all cursor-pointer">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1 flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          entry.category === "academic"
                            ? "bg-blue-50 text-blue-700"
                            : "bg-amber-50 text-amber-700"
                        }`}>
                          {entry.category}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(entry.rejectionDate + "T00:00:00"), "MMM d, yyyy")}
                        </span>
                      </div>
                      <h3 className="font-medium text-foreground group-hover:text-primary transition-colors truncate">
                        {entry.title}
                      </h3>
                      <p className="text-sm text-muted-foreground line-clamp-1">{entry.description}</p>
                    </div>
                    <div className="flex flex-col items-end gap-2 shrink-0">
                      {entry.growthNoteCount > 0 && (
                        <span className="text-xs text-muted-foreground">
                          {entry.growthNoteCount} growth {entry.growthNoteCount === 1 ? "note" : "notes"}
                        </span>
                      )}
                      <svg className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
