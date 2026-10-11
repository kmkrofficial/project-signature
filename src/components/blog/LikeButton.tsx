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

/** Count that rolls vertically: the old value slides out while the new one slides in. */
function RollingCount({ value }: { value: number }) {
    const [tracked, setTracked] = useState(value);
    const [leaving, setLeaving] = useState<{ value: number; up: boolean } | null>(null);

    if (tracked !== value) {
        setLeaving({ value: tracked, up: value > tracked });
        setTracked(value);
    }

    const roll = leaving ? (leaving.up ? "[--roll:60%]" : "[--roll:-60%]") : "";

    return (
        <span className="relative inline-grid overflow-hidden tabular-nums leading-tight">
            <span key={value} className={clsx(leaving && "roll-in", roll)}>
                {value}
            </span>
            {leaving && (
                <span
                    key={`out-${leaving.value}`}
                    aria-hidden="true"
                    className={clsx("roll-out absolute inset-0", roll)}
                    onAnimationEnd={() => setLeaving(null)}
                >
                    {leaving.value}
                </span>
            )}
        </span>
    );
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
    const [burst, setBurst] = useState(0);
    const [shaking, setShaking] = useState(false);

    const toggle = async () => {
        if (pending) return;
        const nextLiked = !liked;
        const previousLikes = likes;

        setPending(true);
        if (nextLiked) setBurst((count) => count + 1);
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
            setShaking(true);
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
            onAnimationEnd={(event) => event.target === event.currentTarget && setShaking(false)}
            className={clsx(
                "press inline-flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-medium cursor-pointer",
                shaking && "animate-shake",
                pending && "opacity-80",
                liked
                    ? "border-rose-500/40 bg-rose-500/10 text-rose-600 dark:text-rose-400"
                    : "border-border bg-card text-muted-foreground hover:text-foreground hover:border-primary/40"
            )}
        >
            <span className="relative grid place-items-center">
                {burst > 0 && liked && (
                    <span
                        key={`ring-${burst}`}
                        aria-hidden="true"
                        className="like-ring pointer-events-none absolute inset-0 rounded-full border-2 border-rose-500"
                    />
                )}
                <Heart
                    key={`heart-${liked ? burst : 0}`}
                    size={16}
                    className={clsx(liked && "fill-current", liked && burst > 0 && "heart-pop")}
                />
            </span>
            <RollingCount value={likes} />
        </button>
    );
}
