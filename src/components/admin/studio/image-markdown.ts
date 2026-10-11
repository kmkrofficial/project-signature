/** Storage names are `<timestamp>_<random>_<original name>`; this shows just the original name. */
export function displayName(storedName: string): string {
    return storedName.replace(/^\d{10,}_(?:[a-z0-9]{4}_)?/, "");
}

/** Alt text for an image, taken from its file name ("Pasted image" for the generic "image.png"). */
export function altTextFor(fileName: string): string {
    const name = displayName(fileName)
        .replace(/\.[^.]+$/, "")
        .replace(/[-_]+/g, " ")
        .trim();
    return !name || name.toLowerCase() === "image" ? "Pasted image" : name;
}

export function imageMarkdown(fileName: string, url: string): string {
    return `![${altTextFor(fileName)}](${url})`;
}

/** Replaces `content[start, end)` with `text`, clamping the range to the content. */
export function insertAt(content: string, start: number, end: number, text: string): string {
    const from = Math.min(Math.max(start, 0), content.length);
    const to = Math.min(Math.max(end, from), content.length);
    return content.slice(0, from) + text + content.slice(to);
}
