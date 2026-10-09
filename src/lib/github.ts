import "server-only";
import { cacheLife } from "next/cache";

export interface GitHubRepo {
    id: number;
    name: string;
    description: string;
    url: string;
    stars: number;
    forks: number;
    language: string | null;
    topics: string[];
    /** When code was last pushed (ISO date), or null when unknown. */
    pushedAt: string | null;
}

const GITHUB_USER = "kmkrofficial";

// Shown when the GitHub API is rate-limited or unreachable
const FALLBACK_REPOS: GitHubRepo[] = [
    {
        id: 1,
        name: "project-signature",
        description: "An editorial technical publication and systems architecture journal built with Next.js and Firebase.",
        url: `https://github.com/${GITHUB_USER}/project-signature`,
        stars: 0,
        forks: 0,
        language: "TypeScript",
        topics: ["nextjs", "typescript", "firebase"],
        pushedAt: null,
    },
];

interface GitHubApiRepo {
    id: number;
    name: string;
    description: string | null;
    html_url: string;
    stargazers_count: number;
    forks_count: number;
    language: string | null;
    topics?: string[];
    fork?: boolean;
    pushed_at: string | null;
}

/**
 * The most recently updated public repositories, newest first, cached for a day (an hour when falling back).
 * "Updated" means last pushed: GitHub's `sort=updated` follows `updated_at`, which does not change on a push,
 * so a repo pushed yesterday can rank below ones untouched for months.
 */
export async function getRecentRepos(limit = 4): Promise<GitHubRepo[]> {
    "use cache";
    cacheLife("days");

    try {
        const res = await fetch(`https://api.github.com/users/${GITHUB_USER}/repos?sort=pushed&direction=desc&per_page=30`, {
            headers: { Accept: "application/vnd.github+json", "User-Agent": "signature-blog" },
        });
        if (!res.ok) throw new Error(`GitHub API responded ${res.status}`);

        const data: GitHubApiRepo[] = await res.json();
        const repos = data
            .filter((repo) => !repo.fork && repo.name !== GITHUB_USER)
            .slice(0, limit)
            .map((repo) => ({
                id: repo.id,
                name: repo.name,
                description: repo.description || "Open-source project.",
                url: repo.html_url,
                stars: repo.stargazers_count,
                forks: repo.forks_count,
                language: repo.language,
                topics: repo.topics ?? [],
                pushedAt: repo.pushed_at,
            }));
        return repos.length > 0 ? repos : FALLBACK_REPOS;
    } catch (error) {
        console.warn("[github] Using fallback repositories:", error);
        cacheLife("hours");
        return FALLBACK_REPOS;
    }
}
