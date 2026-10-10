import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { storage } from "@/lib/firebase";

const MAX_DIMENSION = 1600;
const QUALITY = 0.82;

export interface UploadedImage {
    name: string;
    url: string;
    fullPath: string;
    /** Human readable size after compression, e.g. "84.3 KB". */
    size: string;
}

/** Downscales to at most 1600px on the long edge and re-encodes (PNG stays PNG, everything else becomes WebP). */
function compressImage(file: File): Promise<Blob> {
    return new Promise((resolve) => {
        const objectUrl = URL.createObjectURL(file);
        const img = new window.Image();

        img.onload = () => {
            let { width, height } = img;
            if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
                if (width > height) {
                    height = Math.round((height * MAX_DIMENSION) / width);
                    width = MAX_DIMENSION;
                } else {
                    width = Math.round((width * MAX_DIMENSION) / height);
                    height = MAX_DIMENSION;
                }
            }

            const canvas = document.createElement("canvas");
            canvas.width = width;
            canvas.height = height;
            canvas.getContext("2d")?.drawImage(img, 0, 0, width, height);
            canvas.toBlob(
                (blob) => {
                    URL.revokeObjectURL(objectUrl);
                    resolve(blob || file);
                },
                file.type === "image/png" ? "image/png" : "image/webp",
                QUALITY
            );
        };

        // Undecodable file: upload it untouched and let the storage rules decide
        img.onerror = () => {
            URL.revokeObjectURL(objectUrl);
            resolve(file);
        };

        img.src = objectUrl;
    });
}

/** Compresses an image in the browser and uploads it to `media/` in Firebase Storage. */
export async function uploadImage(file: File, onProgress?: (fraction: number) => void): Promise<UploadedImage> {
    const blob = await compressImage(file);

    const cleanName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const fullPath = `media/${Date.now()}_${cleanName}`;
    const fileRef = ref(storage, fullPath);

    const task = uploadBytesResumable(fileRef, blob);
    await new Promise<void>((resolve, reject) => {
        task.on(
            "state_changed",
            (snapshot) => onProgress?.(snapshot.bytesTransferred / snapshot.totalBytes),
            reject,
            () => resolve()
        );
    });

    return {
        name: file.name,
        url: await getDownloadURL(fileRef),
        fullPath,
        size: (blob.size / 1024).toFixed(1) + " KB",
    };
}
