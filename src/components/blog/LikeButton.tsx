"use client";

import { useState, useSyncExternalStore } from "react";
import { Heart } from "lucide-react";
import { clsx } from "clsx";
import { useToast } from "@/context/ToastContext";

const LIKED_EVENT = "signature:liked-change";
const storageKey = (postId: string) => `liked_${postId}`;

function readLiked(postId: string): boolean {
    try {
        return localStorage.getItem(storageKey(postId)) === "1";
    } catch {
        return false;
    }
}

function writeLiked(postId: string, liked: boolean): void {
    try {
        if (liked) localStorage.setItem(storageKey(postId), "1");
        else localStorage.removeItem(storageKey(postId));
    } catch {
        // Storage unavailable; the server still deduplicates likes
    }
    window.dispatchEvent(new Event(LIKED_EVENT));
}

function subscribe(onChange: () => void): () => void {
    window.addEventListener("storage", onChange);
    window.addEventListener(LIKED_EVENT, onChange);
    return () => {
        window.removeEventListener("storage", onChange);
        window.removeEventListener(LIKED_EVENT, onChange);
    };
}

interface LikeButtonProps {
    postId: string;
    initialLikes: number;
}

export function LikeButton({ postId, initialLikes }: LikeButtonProps) {
    const { addToast } = useToast();
    const liked = useSyncExternalStore(subscribe, () => readLiked(postId), () => false);
    const [likes, setLikes] = useState(initialLikes);
    const [pending, setPending] = useState(false);

    const toggle = async () => {
        if (pending) return;
        const nextLiked = !liked;
        const previousLikes = likes;

        setPending(true);
        writeLiked(postId, nextLiked);
        setLikes((count) => Math.max(0, count + (nextLiked ? 1 : -1)));

        try {
            const res = await fetch("/api/likes", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ postId, action: nextLiked ? "like" : "unlike" }),
            });
            if (!res.ok) throw new Error(`Like request failed with ${res.status}`);
            const data: { likes: number; liked: boolean } = await res.json();
            setLikes(data.likes);
            writeLiked(postId, data.liked);
        } catch {
            setLikes(previousLikes);
            writeLiked(postId, !nextLiked);
            addToast("Couldn't update your like. Please try again.", "error");
        } finally {
            setPending(false);
        }
    };

    return (
        <button
            type="button"
            onClick={toggle}
            aria-pressed={liked}
            aria-label={liked ? "Unlike this article" : "Like this article"}
            className={clsx(
                "inline-flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-medium transition-colors cursor-pointer active:scale-95",
                liked
                    ? "border-rose-500/40 bg-rose-500/10 text-rose-600 dark:text-rose-400"
                    : "border-border bg-card text-muted-foreground hover:text-foreground hover:border-primary/40"
            )}
        >
            <Heart size={16} className={clsx("transition-transform", liked && "fill-current scale-110")} />
            <span className="tabular-nums">{likes}</span>
        </button>
    );
}
