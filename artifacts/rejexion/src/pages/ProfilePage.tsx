import { useState } from "react";
import { useLocation } from "wouter";
import { useGetProfile, getGetProfileQueryKey, useDeleteAccount, getGetMeQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Layout } from "@/components/Layout";
import { format } from "date-fns";

export default function ProfilePage() {
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();
  const { data: profile, isLoading } = useGetProfile({
    query: { queryKey: getGetProfileQueryKey() },
  });
  const deleteAccount = useDeleteAccount();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleDeleteAccount = () => {
    deleteAccount.mutate(undefined, {
      onSuccess: () => {
        queryClient.clear();
        navigate("/");
      },
    });
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="space-y-4">
          <div className="h-8 w-48 rounded-lg bg-secondary animate-pulse" />
          <div className="h-32 rounded-xl bg-secondary animate-pulse" />
        </div>
      </Layout>
    );
  }

  if (!profile) {
    return (
      <Layout>
        <p className="text-muted-foreground">Could not load profile.</p>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-8">
        <div>
          <h1 className="font-serif text-2xl font-light text-foreground">Profile</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Member since {format(new Date(profile.createdAt), "MMMM yyyy")}</p>
        </div>

        <div className="rounded-xl border border-border bg-card p-5 space-y-3">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Name</p>
            <p className="text-sm text-foreground mt-0.5">{profile.name}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Email</p>
            <p className="text-sm text-foreground mt-0.5">{profile.email}</p>
          </div>
        </div>

        <div className="space-y-3">
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Your progress</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="rounded-xl border border-border bg-card p-4 text-center">
              <p className="text-2xl font-serif font-light text-foreground">{profile.totalPoints}</p>
              <p className="text-xs text-muted-foreground mt-1">Total points</p>
            </div>
            <div className="rounded-xl border border-border bg-card p-4 text-center">
              <p className="text-2xl font-serif font-light text-foreground">{profile.entryCount}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {profile.entryCount === 1 ? "Entry" : "Entries"} <span className="text-accent-foreground">+5 ea.</span>
              </p>
            </div>
            <div className="rounded-xl border border-border bg-card p-4 text-center">
              <p className="text-2xl font-serif font-light text-foreground">{profile.growthNoteCount}</p>
              <p className="text-xs text-muted-foreground mt-1">
                Growth notes <span className="text-accent-foreground">+2 ea.</span>
              </p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Points reward reflection — {profile.entryCount * 5} from entries, {profile.growthNoteCount * 2} from growth notes.
          </p>
        </div>

        <div className="space-y-3 pt-4 border-t border-border">
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Privacy</h2>
          <p className="text-sm text-muted-foreground">
            Your data is private and never shared. You can delete your account and all associated data at any time.
          </p>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="px-4 py-2 rounded-lg border border-destructive/30 text-sm text-destructive hover:bg-destructive/10 transition-colors"
          >
            Delete account
          </button>
        </div>
      </div>

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl p-6 max-w-sm w-full space-y-4 shadow-xl">
            <h3 className="font-serif text-xl font-light text-foreground">Delete your account?</h3>
            <p className="text-sm text-muted-foreground">
              This will permanently delete your account and all your entries, reflections, and growth notes. This cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 py-2.5 rounded-lg border border-border text-foreground text-sm font-medium hover:bg-secondary transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleteAccount.isPending}
                className="flex-1 py-2.5 rounded-lg bg-destructive text-destructive-foreground text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-60"
              >
                {deleteAccount.isPending ? "Deleting..." : "Delete everything"}
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
