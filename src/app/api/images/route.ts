import { NextResponse } from 'next/server';
import { S3Client, ListObjectsV2Command, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import sharp from 'sharp';

// Initialize S3 Client for Supabase Storage
const s3Client = new S3Client({
    forcePathStyle: true, // Crucial for Supabase S3
    region: process.env.SUPABASE_REGION || "us-east-1",
    endpoint: process.env.SUPABASE_S3_ENDPOINT, // e.g., https://<project>.supabase.co/storage/v1/s3
    credentials: {
        accessKeyId: process.env.SUPABASE_ACCESS_KEY_ID || "",
        secretAccessKey: process.env.SUPABASE_SECRET_ACCESS_KEY || ""
    }
});

const BUCKET_NAME = process.env.SUPABASE_STORAGE_BUCKET || "portfolio-images";

export async function GET() {
    try {
        if (!process.env.SUPABASE_S3_ENDPOINT || !process.env.SUPABASE_ACCESS_KEY_ID) {
            console.error("Missing Supabase S3 Env Vars");
            return NextResponse.json({ error: 'Server Misconfigured: Missing S3 Env Vars' }, { status: 500 });
        }

        // List objects in the bucket
        // We filter for 'originals/' prefix to match our folder structure
        const command = new ListObjectsV2Command({
            Bucket: BUCKET_NAME,
            Prefix: 'originals/'
        });

        const data = await s3Client.send(command);

        if (!data.Contents) {
            return NextResponse.json([]);
        }

        const images = data.Contents
            .filter(item => item.Key && !item.Key.endsWith(".emptyFolderPlaceholder"))
            .map(item => {
                const key = item.Key!;
                const filename = key.replace('originals/', '');

                // Construct Public URLs
                // Supabase Public URL format: https://<project>.supabase.co/storage/v1/object/public/<bucket>/<key>
                // We can derive the base project URL from the S3 Endpoint.
                // S3 Endpoint: https://<project>.supabase.co/storage/v1/s3
                // Public Base: https://<project>.supabase.co/storage/v1/object/public

                let publicBaseUrl = "";
                if (process.env.SUPABASE_S3_ENDPOINT) {
                    publicBaseUrl = process.env.SUPABASE_S3_ENDPOINT.replace('/s3', '/object/public');
                }

                const publicUrl = `${publicBaseUrl}/${BUCKET_NAME}/${key}`;
                const thumbnailUrl = `${publicBaseUrl}/${BUCKET_NAME}/thumbnails/${filename}`;

                return {
                    name: filename,
                    url: publicUrl,
                    thumbnailUrl: thumbnailUrl,
                    fullPath: key,
                    timeCreated: item.LastModified,
                    size: item.Size
                };
            });

        // Sort by newest first
        images.sort((a, b) => (b.timeCreated?.getTime() ?? 0) - (a.timeCreated?.getTime() ?? 0));

        return NextResponse.json(images);
    } catch (error: any) {
        console.error("S3 List Error:", error);
        return NextResponse.json({ error: 'Failed to list images: ' + error.message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 });
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        // Clean filename
        const cleanName = file.name.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9.-]/g, '');
        const uniqueName = `${Date.now()}-${cleanName}`;

        // 1. Upload Original to 'originals/'
        const originalCommand = new PutObjectCommand({
            Bucket: BUCKET_NAME,
            Key: `originals/${uniqueName}`,
            Body: buffer,
            ContentType: file.type,
            CacheControl: 'max-age=3600',
            ACL: 'public-read' // Just in case, though Supabase relies on Bucket Policies mostly
        });
        await s3Client.send(originalCommand);

        // 2. Generate and Upload Thumbnail to 'thumbnails/'
        try {
            const thumbnailBuffer = await sharp(buffer)
                .resize(200, 200, { // Reduced size to 200px for optimization
                    fit: 'cover',
                    position: 'center'
                })
                .jpeg({ quality: 60 }) // Reduced quality to 60 for implementation
                .toBuffer();

            const thumbnailCommand = new PutObjectCommand({
                Bucket: BUCKET_NAME,
                Key: `thumbnails/${uniqueName}`,
                Body: thumbnailBuffer,
                ContentType: 'image/jpeg',
                CacheControl: 'max-age=3600',
                ACL: 'public-read'
            });
            await s3Client.send(thumbnailCommand);

        } catch (thumbError) {
            console.error("Thumbnail generation/upload failed:", thumbError);
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("S3 Upload Error:", error);
        return NextResponse.json({ error: 'Failed to upload image: ' + error.message }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        // Frontend might send the full Key (originals/foo.jpg) or just foo.jpg. 
        // Our GET returns `fullPath: originals/filename`.
        const key = searchParams.get('key');

        if (!key) {
            return NextResponse.json({ error: 'No key provided' }, { status: 400 });
        }

        const filename = key.replace(/^originals\//, '').replace(/^thumbnails\//, '');

        // Delete Original
        const deleteOriginal = new DeleteObjectCommand({
            Bucket: BUCKET_NAME,
            Key: `originals/${filename}`
        });

        // Delete Thumbnail
        const deleteThumbnail = new DeleteObjectCommand({
            Bucket: BUCKET_NAME,
            Key: `thumbnails/${filename}`
        });

        await Promise.all([
            s3Client.send(deleteOriginal),
            s3Client.send(deleteThumbnail)
        ]);

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("S3 Delete Error:", error);
        return NextResponse.json({ error: 'Failed to delete image: ' + error.message }, { status: 500 });
    }
}
