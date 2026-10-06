export interface BlogPost {
    id: string;
    slug: string;
    title: string;
    excerpt?: string;
    content?: string;
    coverImage?: string;
    date?: string;
    readTime?: string;
    readingTime?: number;
    category?: string;
    tags: string[];
    published?: boolean;
    featured?: boolean;
    likes?: number;
    createdAt?: { seconds: number; nanoseconds: number } | null;
    updatedAt?: { seconds: number; nanoseconds: number } | null;
}

export type SortOption = "newest" | "oldest" | "likes";
