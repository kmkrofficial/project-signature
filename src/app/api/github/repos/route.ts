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
        name: "E-Commerce-Microservice",
        description: "Event-driven microservices architecture built with modern backend standards and resilient fault tolerance.",
        html_url: "https://github.com/keerthiraajan/E-Commerce-Microservice",
        stargazers_count: 0,
        forks_count: 0,
        language: "Java",
        topics: ["microservices", "spring-boot", "docker", "event-driven"],
        updated_at: new Date().toISOString(),
    },
    {
        id: 2,
        name: "Pharma-Chain-Vault",
        description: "Decentralized pharmaceutical supply chain verification system ensuring drug provenance and integrity.",
        html_url: "https://github.com/keerthiraajan/Pharma-Chain-Vault",
        stargazers_count: 0,
        forks_count: 0,
        language: "Solidity",
        topics: ["blockchain", "supply-chain", "smart-contracts"],
        updated_at: new Date().toISOString(),
    },
    {
        id: 3,
        name: "Battery-Failure-Prediction",
        description: "Predictive maintenance framework utilizing machine learning models to forecast lithium-ion battery anomalies.",
        html_url: "https://github.com/keerthiraajan/Battery-Failure-Prediction",
        stargazers_count: 0,
        forks_count: 0,
        language: "Python",
        topics: ["machine-learning", "predictive-maintenance", "telemetry"],
        updated_at: new Date().toISOString(),
    },
    {
        id: 4,
        name: "LiteGPT",
        description: "124M parameter edge Large Language Model engineered from scratch in PyTorch with custom tokenization & KV caching.",
        html_url: "https://github.com/keerthiraajan",
        stargazers_count: 12,
        forks_count: 3,
        language: "Python",
        topics: ["deep-learning", "transformers", "pytorch", "edge-ai"],
        updated_at: new Date().toISOString(),
    }
];

export async function GET() {
    try {
        const response = await fetch(
            "https://api.github.com/users/keerthiraajan/repos?sort=updated&per_page=8",
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
            .filter((repo: { fork?: boolean; name?: string }) => repo.name !== "keerthiraajan")
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
