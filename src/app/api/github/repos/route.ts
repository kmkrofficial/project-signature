import { NextResponse } from "next/server";

export interface GitHubRepoItem {
    id: number;
    name: string;
    description: string | null;
    html_url: string;
    stargazers_count: number;
    forks_count: number;
    language: string | null;
    topics: string[];
    updated_at: string;
}

// Fallback data in case of GitHub API rate-limits or network failure
const FALLBACK_REPOS: GitHubRepoItem[] = [
    {
        id: 1,
        name: "project-signature",
        description: "An editorial technical publication and systems architecture journal built with Next.js and Firebase.",
        html_url: "https://github.com/kmkrofficial/project-signature",
        stargazers_count: 0,
        forks_count: 0,
        language: "TypeScript",
        topics: ["nextjs", "typescript", "architecture", "firebase"],
        updated_at: new Date().toISOString(),
    },
    {
        id: 2,
        name: "project-nook",
        description: "Personal computing and systems automation workspace utilities.",
        html_url: "https://github.com/kmkrofficial/project-nook",
        stargazers_count: 0,
        forks_count: 0,
        language: "Python",
        topics: ["python", "automation", "tools"],
        updated_at: new Date().toISOString(),
    }
];

export async function GET() {
    try {
        const response = await fetch(
            "https://api.github.com/users/kmkrofficial/repos?sort=updated&per_page=8",
            {
                headers: {
                    Accept: "application/vnd.github.v3+json",
                    "User-Agent": "The-Signature-Publication",
                },
                next: { revalidate: 3600 }, // Cache on Next.js edge for 1 hour
            }
        );

        if (!response.ok) {
            console.warn(`GitHub API returned status ${response.status}. Using fallback repositories.`);
            return NextResponse.json({ repos: FALLBACK_REPOS, source: "fallback" });
        }

        const rawData = await response.json();

        if (!Array.isArray(rawData)) {
            return NextResponse.json({ repos: FALLBACK_REPOS, source: "fallback" });
        }

        const repos: GitHubRepoItem[] = rawData
            .filter((repo: { fork?: boolean; name?: string }) => repo.name !== "kmkrofficial")
            .map((repo: {
                id: number;
                name: string;
                description: string | null;
                html_url: string;
                stargazers_count: number;
                forks_count: number;
                language: string | null;
                topics?: string[];
                updated_at: string;
            }) => ({
                id: repo.id,
                name: repo.name,
                description: repo.description || "Open-source software module and architectural implementation.",
                html_url: repo.html_url,
                stargazers_count: repo.stargazers_count || 0,
                forks_count: repo.forks_count || 0,
                language: repo.language || "Code",
                topics: Array.isArray(repo.topics) ? repo.topics : [],
                updated_at: repo.updated_at,
            }));

        return NextResponse.json({
            repos: repos.length > 0 ? repos : FALLBACK_REPOS,
            source: "github_live"
        });
    } catch (error) {
        console.error("Failed to fetch live repositories from GitHub:", error);
        return NextResponse.json({ repos: FALLBACK_REPOS, source: "fallback" });
    }
}
