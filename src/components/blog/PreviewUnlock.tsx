"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { Loader2 } from "lucide-react";
import { auth } from "@/lib/firebase";
import { unlockPreview } from "@/app/admin/actions";

/** Google sign-in for an email-locked draft preview. Only the verified email is used; nothing else is kept. */
export function PreviewUnlock({ token }: { token: string }) {
    const router = useRouter();
    const [state, setState] = useState<"idle" | "working" | "denied" | "error">("idle");

    const handleSignIn = async () => {
        setState("working");
        const wasSignedIn = auth.currentUser !== null;
        try {
            const { user } = await signInWithPopup(auth, new GoogleAuthProvider());
            const outcome = await unlockPreview(token, await user.getIdToken());
            if (outcome === "ok") {
                router.refresh();
                return;
            }
            setState("denied");
        } catch {
            setState("error");
        } finally {
            // Reviewers don't stay signed in to the site once the server has the answer
            if (!wasSignedIn) await signOut(auth).catch(() => undefined);
        }
    };

    return (
        <div className="space-y-3">
            <button
                type="button"
                onClick={handleSignIn}
                disabled={state === "working"}
                className="press inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-60 cursor-pointer"
            >
                {state === "working" && <Loader2 size={14} className="animate-spin" />}
                Sign in with Google
            </button>
            <p className="min-h-4 text-xs text-red-400" role="alert">
                {state === "denied" && "That account doesn't have access to this draft."}
                {state === "error" && "Sign-in didn't complete. Please try again."}
            </p>
        </div>
    );
}
