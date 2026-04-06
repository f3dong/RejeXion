import { useState } from "react";
import { useRoute, useLocation } from "wouter";
import {
  useGetEntry,
  getGetEntryQueryKey,
  useDeleteEntry,
  useUpdateEntry,
  useCreateGrowthNote,
  useDeleteGrowthNote,
  getListEntriesQueryKey,
  getGetStatsQueryKey,
  getGetPointsQueryKey,
  getGetProfileQueryKey,
  getListGrowthNotesQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Layout } from "@/components/Layout";
import { format } from "date-fns";

export default function EntryDetailPage() {
  const [, params] = useRoute("/entries/:id");
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();

  const id = params?.id ?? "";

  const { data: entry, isLoading } = useGetEntry(id, {
    query: { enabled: !!id, queryKey: getGetEntryQueryKey(id) },
  });

  const deleteEntry = useDeleteEntry();
  const updateEntry = useUpdateEntry();
  const createGrowthNote = useCreateGrowthNote();
  const deleteGrowthNote = useDeleteGrowthNote();

  const [growthNoteText, setGrowthNoteText] = useState("");
  const [noteError, setNoteError] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editDate, setEditDate] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editError, setEditError] = useState("");

  const [deletingNoteId, setDeletingNoteId] = useState<string | null>(null);

  const handleStartEdit = () => {
    if (!entry) return;
    setEditTitle(entry.title);
    setEditDate(entry.rejectionDate);
    setEditDescription(entry.description ?? "");
    setEditError("");
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditError("");
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTitle.trim() || !editDate) {
      setEditError("Title and date are required");
      return;
    }
    setEditError("");
    updateEntry.mutate(
      { id, data: { title: editTitle, rejectionDate: editDate, description: editDescription } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetEntryQueryKey(id) });
          queryClient.invalidateQueries({ queryKey: getListEntriesQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetStatsQueryKey() });
          setIsEditing(false);
        },
        onError: () => setEditError("Failed to save changes. Please try again."),
      }
    );
  };

  const handleAddGrowthNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!growthNoteText.trim()) {
      setNoteError("Please write something first");
      return;
    }
    setNoteError("");

    createGrowthNote.mutate(
      { entryId: id, data: { content: growthNoteText } },
      {
        onSuccess: () => {
          setGrowthNoteText("");
          queryClient.invalidateQueries({ queryKey: getGetEntryQueryKey(id) });
          queryClient.invalidateQueries({ queryKey: getListGrowthNotesQueryKey(id) });
          queryClient.invalidateQueries({ queryKey: getGetPointsQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetProfileQueryKey() });
        },
        onError: () => setNoteError("Failed to save growth note. Please try again."),
      }
    );
  };

  const handleDeleteGrowthNote = (noteId: string) => {
    setDeletingNoteId(noteId);
    deleteGrowthNote.mutate(
      { id: noteId },
      {
        onSuccess: () => {
          setDeletingNoteId(null);
          queryClient.invalidateQueries({ queryKey: getGetEntryQueryKey(id) });
          queryClient.invalidateQueries({ queryKey: getListGrowthNotesQueryKey(id) });
        },
        onError: () => {
          setDeletingNoteId(null);
          setNoteError("Failed to delete growth note. Please try again.");
        },
      }
    );
  };

  const handleDelete = () => {
    deleteEntry.mutate(
      { id },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListEntriesQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetStatsQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetPointsQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetProfileQueryKey() });
          navigate("/timeline");
        },
      }
    );
  };

  const handleExport = () => {
    const link = document.createElement("a");
    link.href = `/api/entries/${id}/export`;
    link.download = `rejexion-${id.slice(0, 8)}.txt`;
    link.click();
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="space-y-4">
          <div className="h-8 w-48 rounded-lg bg-secondary animate-pulse" />
          <div className="h-4 w-32 rounded-lg bg-secondary animate-pulse" />
          <div className="h-32 rounded-xl bg-secondary animate-pulse" />
        </div>
      </Layout>
    );
  }

  if (!entry) {
    return (
      <Layout>
        <div className="text-center py-16">
          <p className="text-muted-foreground">Entry not found</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-8">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2 flex-1">
            <button
              onClick={() => navigate("/timeline")}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              ← Back to timeline
            </button>
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                entry.category === "academic" ? "bg-blue-50 text-blue-700" : "bg-amber-50 text-amber-700"
              }`}>
                {entry.category}
              </span>
              <span className="text-sm text-muted-foreground">
                {format(new Date(entry.rejectionDate + "T00:00:00"), "MMMM d, yyyy")}
              </span>
            </div>
            <h1 className="font-serif text-2xl font-light text-foreground">{entry.title}</h1>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleStartEdit}
              className="px-3 py-1.5 rounded-lg border border-border text-sm text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
              title="Edit entry details"
            >
              Edit
            </button>
            <button
              onClick={handleExport}
              className="px-3 py-1.5 rounded-lg border border-border text-sm text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
              title="Export as text"
            >
              Export
            </button>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="px-3 py-1.5 rounded-lg border border-destructive/30 text-sm text-destructive hover:bg-destructive/10 transition-colors"
            >
              Delete
            </button>
          </div>
        </div>

        {entry.description && (
          <div className="p-4 rounded-xl bg-secondary/50 border border-border">
            <p className="text-sm text-muted-foreground mb-1 font-medium uppercase tracking-wider text-xs">Description</p>
            <p className="text-sm text-foreground">{entry.description}</p>
          </div>
        )}

        <div className="space-y-5">
          <h2 className="font-medium text-foreground text-sm uppercase tracking-wider text-muted-foreground">Reflection</h2>
          <div className="space-y-5">
            {entry.responses.map((r, i) => (
              <div key={r.id} className="space-y-2 p-4 rounded-xl border border-border bg-card">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {i + 1}. {r.promptText}
                </p>
                <p className="text-sm text-foreground leading-relaxed">{r.responseText}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="font-medium text-foreground text-sm uppercase tracking-wider text-muted-foreground">
              Growth notes
            </h2>
            <span className="text-xs text-muted-foreground">+2 points each</span>
          </div>

          <form onSubmit={handleAddGrowthNote} className="space-y-3">
            <textarea
              value={growthNoteText}
              onChange={(e) => setGrowthNoteText(e.target.value)}
              rows={3}
              className="w-full px-3 py-2.5 rounded-lg border border-input bg-card text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-shadow resize-none"
              placeholder="How has your perspective on this changed? What have you learned since?"
            />
            {noteError && <p className="text-xs text-destructive">{noteError}</p>}
            <button
              type="submit"
              disabled={createGrowthNote.isPending}
              className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {createGrowthNote.isPending ? "Saving..." : "Add growth note"}
            </button>
          </form>

          {entry.growthNotes.length > 0 ? (
            <div className="space-y-3">
              {entry.growthNotes.map((note) => (
                <div key={note.id} className="p-4 rounded-xl border border-border bg-card">
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-xs text-muted-foreground mb-2">
                      {format(new Date(note.createdAt), "MMMM d, yyyy")}
                    </p>
                    <button
                      onClick={() => handleDeleteGrowthNote(note.id)}
                      disabled={deletingNoteId === note.id}
                      className="text-xs text-muted-foreground hover:text-destructive transition-colors shrink-0 disabled:opacity-50"
                      title="Delete note"
                    >
                      {deletingNoteId === note.id ? "Deleting..." : "Delete"}
                    </button>
                  </div>
                  <p className="text-sm text-foreground leading-relaxed">{note.content}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground py-4 text-center">
              No growth notes yet. Come back and reflect on how this experience has shaped you.
            </p>
          )}
        </div>
      </div>

      {isEditing && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl p-6 max-w-sm w-full space-y-4 shadow-xl">
            <h3 className="font-serif text-xl font-light text-foreground">Edit entry details</h3>
            {editError && (
              <div className="px-3 py-2 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">{editError}</div>
            )}
            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-foreground">Title</label>
                <input
                  type="text"
                  required
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-shadow"
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-foreground">Rejection date</label>
                <input
                  type="date"
                  required
                  value={editDate}
                  onChange={(e) => setEditDate(e.target.value)}
                  max={format(new Date(), "yyyy-MM-dd")}
                  className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-shadow"
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-foreground">Description</label>
                <textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-shadow resize-none"
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="flex-1 py-2.5 rounded-lg border border-border text-foreground text-sm font-medium hover:bg-secondary transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updateEntry.isPending}
                  className="flex-1 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {updateEntry.isPending ? "Saving..." : "Save changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl p-6 max-w-sm w-full space-y-4 shadow-xl">
            <h3 className="font-serif text-xl font-light text-foreground">Delete this entry?</h3>
            <p className="text-sm text-muted-foreground">
              This will permanently delete the entry and all its growth notes. This cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 py-2.5 rounded-lg border border-border text-foreground text-sm font-medium hover:bg-secondary transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleteEntry.isPending}
                className="flex-1 py-2.5 rounded-lg bg-destructive text-destructive-foreground text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-60"
              >
                {deleteEntry.isPending ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
