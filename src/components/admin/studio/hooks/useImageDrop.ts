import { useCallback, useState } from "react";
import type { ClipboardEvent, Dispatch, DragEvent, SetStateAction } from "react";
import { useToast } from "@/context/ToastContext";
import { uploadImage } from "@/lib/upload-image";
import { altTextFor } from "../image-markdown";
import type { DraftPost } from "../types";

const isImage = (file: File) => file.type.startsWith("image/");

/**
 * Paste or drop images straight into the markdown editor. A placeholder goes in at the cursor right away
 * and is replaced with the final image markdown when the upload finishes.
 */
export function useImageDrop(setPost: Dispatch<SetStateAction<DraftPost>>, folder: string) {
    const { addToast } = useToast();
    const [dragging, setDragging] = useState(false);
    const [uploading, setUploading] = useState(0);

    const insert = useCallback(
        (files: File[], at: number) => {
            const jobs = files.map((file, index) => ({
                file,
                placeholder: `![Uploading ${altTextFor(file.name)}-${Date.now()}${index}…]()`,
            }));

            setPost((prev) => {
                const content = prev.content ?? "";
                const position = Math.min(Math.max(at, 0), content.length);
                const text = jobs.map((job) => job.placeholder).join("\n\n");
                return { ...prev, content: content.slice(0, position) + text + content.slice(position) };
            });

            for (const { file, placeholder } of jobs) {
                setUploading((count) => count + 1);
                uploadImage(file, undefined, folder)
                    .then(({ url }) => {
                        const markdown = `![${altTextFor(file.name)}](${url})`;
                        setPost((prev) => ({ ...prev, content: (prev.content ?? "").replace(placeholder, markdown) }));
                    })
                    .catch((err: unknown) => {
                        const msg = err instanceof Error ? err.message : String(err);
                        setPost((prev) => ({ ...prev, content: (prev.content ?? "").replace(placeholder, "") }));
                        addToast("Failed to upload image: " + msg, "error");
                    })
                    .finally(() => setUploading((count) => count - 1));
            }
        },
        [addToast, folder, setPost]
    );

    /** Where in the text the image should go: the editor's caret (or the end if it can't be found). */
    const caretOf = (wrapper: HTMLElement): number => {
        const area = wrapper.querySelector("textarea");
        return area ? area.selectionStart : Number.MAX_SAFE_INTEGER;
    };

    const onPaste = (event: ClipboardEvent<HTMLElement>) => {
        const files = [...event.clipboardData.files].filter(isImage);
        if (files.length === 0) return; // plain text paste: leave it to the editor
        event.preventDefault();
        insert(files, caretOf(event.currentTarget));
    };

    const onDragOver = (event: DragEvent<HTMLElement>) => {
        if (!event.dataTransfer.types.includes("Files")) return;
        event.preventDefault();
        setDragging(true);
    };

    const onDragLeave = () => setDragging(false);

    const onDrop = (event: DragEvent<HTMLElement>) => {
        setDragging(false);
        const files = [...event.dataTransfer.files].filter(isImage);
        if (files.length === 0) return;
        event.preventDefault();
        insert(files, caretOf(event.currentTarget));
    };

    return { dragging, uploading, handlers: { onPaste, onDragOver, onDragLeave, onDrop } };
}
