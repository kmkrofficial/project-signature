"use client";

import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";

interface ArticleEnhancerProps {
    /** id of the element holding the rendered article HTML */
    contentId: string;
}

type ZoomedImage = { src: string; alt: string };

/**
 * Progressive enhancement for server-rendered article HTML:
 * copy buttons on code blocks and a native <dialog> image lightbox.
 */
export function ArticleEnhancer({ contentId }: ArticleEnhancerProps) {
    const dialogRef = useRef<HTMLDialogElement>(null);
    const [image, setImage] = useState<ZoomedImage | null>(null);

    useEffect(() => {
        const content = document.getElementById(contentId);
        if (!content) return;
        content.dataset.enhanced = "true";

        const handleClick = async (event: MouseEvent) => {
            const target = event.target as HTMLElement;

            const copyButton = target.closest<HTMLButtonElement>(".copy-code");
            if (copyButton) {
                const code = copyButton.closest(".code-block")?.querySelector("pre")?.textContent ?? "";
                try {
                    await navigator.clipboard.writeText(code);
                    copyButton.textContent = "Copied";
                } catch {
                    copyButton.textContent = "Failed";
                }
                setTimeout(() => (copyButton.textContent = "Copy"), 2000);
                return;
            }

            if (target instanceof HTMLImageElement && !target.closest("a")) {
                setImage({ src: target.currentSrc || target.src, alt: target.alt });
                dialogRef.current?.showModal();
            }
        };

        content.addEventListener("click", handleClick);
        return () => content.removeEventListener("click", handleClick);
    }, [contentId]);

    const close = () => dialogRef.current?.close();

    return (
        <dialog
            ref={dialogRef}
            onClose={() => setImage(null)}
            onClick={(event) => event.target === dialogRef.current && close()}
            aria-label={image?.alt || "Enlarged image"}
            className="lightbox m-auto max-w-[min(64rem,calc(100vw-2rem))] max-h-[calc(100vh-2rem)] bg-transparent p-0 backdrop:bg-black/85 backdrop:backdrop-blur-sm"
        >
            {image && (
                <figure className="relative flex flex-col items-center gap-3">
                    {/* eslint-disable-next-line @next/next/no-img-element -- already-loaded article image */}
                    <img src={image.src} alt={image.alt} className="max-h-[80vh] w-auto rounded-xl object-contain" />
                    {image.alt && <figcaption className="text-sm text-white/85 text-center">{image.alt}</figcaption>}
                    <button
                        type="button"
                        onClick={close}
                        autoFocus
                        aria-label="Close image"
                        className="absolute top-2 right-2 p-2 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors cursor-pointer"
                    >
                        <X size={18} />
                    </button>
                </figure>
            )}
        </dialog>
    );
}
