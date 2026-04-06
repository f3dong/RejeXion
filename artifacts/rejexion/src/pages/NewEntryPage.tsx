import { useState } from "react";
import { useLocation } from "wouter";
import { useCreateEntry, getListEntriesQueryKey, getGetStatsQueryKey, getGetPointsQueryKey, getGetProfileQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Layout } from "@/components/Layout";
import { format } from "date-fns";

type Category = "academic" | "career";
type Step = 1 | 2 | 3 | 4;

interface Prompt {
  id: string;
  category: Category;
  promptText: string;
  orderIndex: number;
}

const PROMPTS: Record<Category, Prompt[]> = {
  academic: [
    { id: "9dd3827e-cc09-4c7a-be4c-5a5e024a19a0", category: "academic", orderIndex: 1, promptText: "What did you learn about yourself, your coursework, your research, or your academic strengths through this application process?" },
    { id: "6d0a1217-c0d9-4d35-83ea-4e70d8428ac9", category: "academic", orderIndex: 2, promptText: "What were you hoping to gain from this program, fellowship, or institution, and what does this rejection mean for your academic goals right now?" },
    { id: "22a9a239-c169-4299-8d06-c33149871d68", category: "academic", orderIndex: 3, promptText: "What external factors — such as the school's program priorities, competition, or timing — may have influenced this admissions or scholarship decision?" },
    { id: "9eed3daf-5a2a-4a4a-b0db-9f0b5416857a", category: "academic", orderIndex: 4, promptText: "What is one concrete step you could take — whether retaking a course, seeking a professor's mentorship, or applying elsewhere — to continue pursuing your academic goals?" },
  ],
  career: [
    { id: "2a20c73a-72b1-478d-9a60-a4b1ed7862f9", category: "career", orderIndex: 1, promptText: "What were you hoping for from this opportunity, and what does this rejection feel like right now?" },
    { id: "3fa20c16-67a9-414d-8865-f15a3940e5e5", category: "career", orderIndex: 2, promptText: "What did you learn about yourself, your skills, or the role through this process?" },
    { id: "a2878ecc-2027-4092-bb88-0d9593cf69e2", category: "career", orderIndex: 3, promptText: "What factors outside your control may have played a role in this decision?" },
    { id: "73f4f9c4-c112-4906-8aa3-b62f4bdda48e", category: "career", orderIndex: 4, promptText: "What is one thing you want to focus on or try differently going forward?" },
  ],
};

export default function NewEntryPage() {
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();
  const createEntry = useCreateEntry();

  const [step, setStep] = useState<Step>(1);
  const [category, setCategory] = useState<Category | null>(null);
  const [title, setTitle] = useState("");
  const [rejectionDate, setRejectionDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [description, setDescription] = useState("");
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [error, setError] = useState("");

  const prompts = category ? PROMPTS[category] : undefined;

  const handleSelectCategory = (cat: Category) => {
    setCategory(cat);
    setStep(2);
  };

  const handleStep2Next = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !rejectionDate) {
      setError("Title and date are required");
      return;
    }
    setError("");
    setStep(3);
  };

  const handleStep3Next = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompts || prompts.length === 0) return;
    const allAnswered = prompts.every((p) => responses[p.id]?.trim());
    if (!allAnswered) {
      setError("Please answer all prompts");
      return;
    }
    setError("");
    setStep(4);
  };

  const handleSubmit = () => {
    if (!category || !prompts) return;

    const entryResponses = prompts.map((p) => ({
      promptId: p.id,
      responseText: responses[p.id] ?? "",
    }));

    createEntry.mutate(
      {
        data: {
          category,
          title,
          rejectionDate,
          description,
          responses: entryResponses,
        },
      },
      {
        onSuccess: (entry) => {
          queryClient.invalidateQueries({ queryKey: getListEntriesQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetStatsQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetPointsQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetProfileQueryKey() });
          navigate(`/entries/${entry.id}`);
        },
        onError: (err: any) => {
          setError(err?.data?.error ?? "Something went wrong. Please try again.");
        },
      }
    );
  };

  return (
    <Layout>
      <div className="max-w-xl mx-auto space-y-8">
        <div className="flex items-center gap-3">
          <button
            onClick={() => step > 1 ? setStep((step - 1) as Step) : navigate("/timeline")}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            ← Back
          </button>
          <div className="flex items-center gap-1.5 ml-auto">
            {([1, 2, 3, 4] as Step[]).map((s) => (
              <div
                key={s}
                className={`h-1.5 rounded-full transition-all ${
                  s <= step ? "bg-primary w-6" : "bg-secondary w-3"
                }`}
              />
            ))}
          </div>
        </div>

        {step === 1 && (
          <div className="space-y-6">
            <div>
              <h1 className="font-serif text-2xl font-light text-foreground">What kind of rejection?</h1>
              <p className="text-sm text-muted-foreground mt-1">This helps us give you the right prompts</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                onClick={() => handleSelectCategory("academic")}
                className="p-6 rounded-xl border-2 border-border hover:border-primary text-left transition-all group"
              >
                <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center mb-3">
                  <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 14l9-5-9-5-9 5 9 5z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                  </svg>
                </div>
                <h3 className="font-medium text-foreground group-hover:text-primary transition-colors">Academic</h3>
                <p className="text-xs text-muted-foreground mt-1">Programs, scholarships, research, awards</p>
              </button>
              <button
                onClick={() => handleSelectCategory("career")}
                className="p-6 rounded-xl border-2 border-border hover:border-primary text-left transition-all group"
              >
                <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center mb-3">
                  <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="font-medium text-foreground group-hover:text-primary transition-colors">Career</h3>
                <p className="text-xs text-muted-foreground mt-1">Jobs, internships, interviews, promotions</p>
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <form onSubmit={handleStep2Next} className="space-y-6">
            <div>
              <h1 className="font-serif text-2xl font-light text-foreground">Tell us what happened</h1>
              <p className="text-sm text-muted-foreground mt-1">Just the basics — title, date, and a brief description</p>
            </div>
            {error && (
              <div className="px-4 py-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">{error}</div>
            )}
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-foreground">Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg border border-input bg-card text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-shadow"
                  placeholder={category === "academic" ? "e.g. Harvard PhD Application, NSF Fellowship, Honor Society" : "e.g. Google SWE Interview, Marketing Manager at Acme"}
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-foreground">Rejection date</label>
                <input
                  type="date"
                  required
                  value={rejectionDate}
                  onChange={(e) => setRejectionDate(e.target.value)}
                  max={format(new Date(), "yyyy-MM-dd")}
                  className="w-full px-3 py-2.5 rounded-lg border border-input bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-shadow"
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-foreground">Brief description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2.5 rounded-lg border border-input bg-card text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-shadow resize-none"
                  placeholder="A few words about what this opportunity was..."
                />
              </div>
            </div>
            <button
              type="submit"
              className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
            >
              Continue
            </button>
          </form>
        )}

        {step === 3 && (
          <form onSubmit={handleStep3Next} className="space-y-6">
            <div>
              <h1 className="font-serif text-2xl font-light text-foreground">Reflect honestly</h1>
              <p className="text-sm text-muted-foreground mt-1">Take your time. These are just for you.</p>
            </div>
            {error && (
              <div className="px-4 py-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">{error}</div>
            )}
            <div className="space-y-6">
              {prompts?.map((prompt, i) => (
                <div key={prompt.id} className="space-y-2">
                  <label className="block text-sm font-medium text-foreground">
                    <span className="text-muted-foreground mr-2">{i + 1}.</span>
                    {prompt.promptText}
                  </label>
                  <textarea
                    value={responses[prompt.id] ?? ""}
                    onChange={(e) => setResponses((prev) => ({ ...prev, [prompt.id]: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2.5 rounded-lg border border-input bg-card text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-shadow resize-none"
                    placeholder="Write your thoughts here..."
                  />
                </div>
              ))}
            </div>
            <button
              type="submit"
              className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
            >
              Review entry
            </button>
          </form>
        )}

        {step === 4 && (
          <div className="space-y-6">
            <div>
              <h1 className="font-serif text-2xl font-light text-foreground">Review your entry</h1>
              <p className="text-sm text-muted-foreground mt-1">Once saved, reflection answers cannot be edited</p>
            </div>
            {error && (
              <div className="px-4 py-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">{error}</div>
            )}

            <div className="rounded-xl border border-border bg-card p-5 space-y-4">
              <div className="flex items-center gap-2">
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                  category === "academic" ? "bg-blue-50 text-blue-700" : "bg-amber-50 text-amber-700"
                }`}>
                  {category}
                </span>
                <span className="text-xs text-muted-foreground">
                  {format(new Date(rejectionDate + "T00:00:00"), "MMMM d, yyyy")}
                </span>
              </div>
              <div>
                <h3 className="font-medium text-foreground">{title}</h3>
                {description && <p className="text-sm text-muted-foreground mt-1">{description}</p>}
              </div>
              <div className="border-t border-border pt-4 space-y-4">
                {prompts?.map((prompt, i) => (
                  <div key={prompt.id} className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{i + 1}. {prompt.promptText}</p>
                    <p className="text-sm text-foreground">{responses[prompt.id]}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep(3)}
                className="flex-1 py-2.5 rounded-lg border border-border text-foreground text-sm font-medium hover:bg-secondary transition-colors"
              >
                Edit
              </button>
              <button
                onClick={handleSubmit}
                disabled={createEntry.isPending}
                className="flex-1 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {createEntry.isPending ? "Saving..." : "Save entry (+5 pts)"}
              </button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
