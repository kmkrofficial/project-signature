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
}

/** Recently updated public repositories, cached for a day (an hour when falling back). */
export async function getRecentRepos(limit = 6): Promise<GitHubRepo[]> {
    "use cache";
    cacheLife("days");

    try {
        const res = await fetch(`https://api.github.com/users/${GITHUB_USER}/repos?sort=updated&per_page=20`, {
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
            }));
        return repos.length > 0 ? repos : FALLBACK_REPOS;
    } catch (error) {
        console.warn("[github] Using fallback repositories:", error);
        cacheLife("hours");
        return FALLBACK_REPOS;
    }
}
