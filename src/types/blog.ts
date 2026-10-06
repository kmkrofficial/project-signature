/** Firestore document shape as edited in the Admin Studio. */
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

/** Serializable post metadata used by public listings, feeds and search. */
export interface PostSummary {
    id: string;
    slug: string;
    title: string;
    excerpt: string;
    coverImage: string;
    category: string;
    tags: string[];
    featured: boolean;
    likes: number;
    readingTime: number;
    /** ISO 8601 */
    publishedAt: string;
    /** ISO 8601 */
    updatedAt: string;
}

export interface PostHeading {
    id: string;
    text: string;
    level: 2 | 3;
}

/** A published post with its sanitized, pre-rendered HTML. */
export interface Post extends PostSummary {
    html: string;
    headings: PostHeading[];
}

export interface AdjacentPosts {
    previous: PostSummary | null;
    next: PostSummary | null;
}

export interface SiteConfig {
    siteTitle: string;
    siteDescription: string;
    ogImageUrl: string;
    author: string;
    email: string;
    github: string;
    linkedin: string;
    twitter: string;
}

export interface SearchEntry {
    slug: string;
    title: string;
    excerpt: string;
    category: string;
    tags: string[];
    readingTime: number;
}
