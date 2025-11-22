"use client";

import React, { useState } from "react";
import { Database, Loader2, Check } from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, addDoc } from "firebase/firestore";

interface SampleDataButtonProps {
    onDataInserted?: () => void;
}

export function SampleDataButton({ onDataInserted }: SampleDataButtonProps) {
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState("");

    const sampleData = {
        // Projects - matching admin format (title, description, tech, link, github)
        portfolio: [
            {
                title: "AI-Powered Chat Application",
                description: "Real-time chat application with AI-powered responses using OpenAI GPT-4 and WebSockets",
                tech: ["Next.js", "TypeScript", "OpenAI API", "WebSocket", "TailwindCSS"],
                link: "https://ai-chat-demo.vercel.app",
                github: "https://github.com/example/ai-chat",
            },
            {
                title: "E-Commerce Platform",
                description: "Full-stack e-commerce solution with payment integration, inventory management, and admin dashboard",
                tech: ["React", "Node.js", "MongoDB", "Stripe", "Redis"],
                link: "https://shop-demo.com",
                github: "https://github.com/example/ecommerce",
            },
            {
                title: "Task Management System",
                description: "Collaborative project management tool with real-time updates, Kanban boards, and team collaboration features",
                tech: ["Vue.js", "Firebase", "Vuex", "Material-UI"],
                link: "https://tasks-demo.com",
                github: "https://github.com/example/task-manager",
            },
            {
                title: "Weather Forecast Dashboard",
                description: "Interactive weather dashboard with real-time data visualization and 7-day forecasts",
                tech: ["React", "D3.js", "Weather API", "Chart.js"],
                link: "https://weather-dashboard-demo.com",
                github: "https://github.com/example/weather-dashboard",
            },
            {
                title: "Portfolio Website Builder",
                description: "Drag-and-drop portfolio builder with custom templates and one-click deployment",
                tech: ["Next.js", "TypeScript", "Vercel", "TailwindCSS", "DND Kit"],
                link: "https://portfolio-builder-demo.com",
                github: "https://github.com/example/portfolio-builder",
            },
        ],

        // Skills - matching admin format (name, level, category)
        skills: [
            // Languages
            { name: "JavaScript", level: 5, category: "Languages" },
            { name: "TypeScript", level: 5, category: "Languages" },
            { name: "Python", level: 4, category: "Languages" },
            { name: "Java", level: 3, category: "Languages" },
            { name: "SQL", level: 4, category: "Languages" },

            // Frameworks
            { name: "React", level: 5, category: "Frameworks" },
            { name: "Next.js", level: 5, category: "Frameworks" },
            { name: "Node.js", level: 4, category: "Frameworks" },
            { name: "Express.js", level: 4, category: "Frameworks" },
            { name: "Django", level: 3, category: "Frameworks" },
            { name: "Vue.js", level: 3, category: "Frameworks" },

            // Tools
            { name: "Git", level: 5, category: "Tools" },
            { name: "Docker", level: 4, category: "Tools" },
            { name: "Webpack", level: 3, category: "Tools" },
            { name: "VS Code", level: 5, category: "Tools" },
            { name: "Postman", level: 4, category: "Tools" },

            // Cloud
            { name: "AWS", level: 4, category: "Cloud" },
            { name: "Google Cloud", level: 3, category: "Cloud" },
            { name: "Vercel", level: 5, category: "Cloud" },
            { name: "Firebase", level: 5, category: "Cloud" },
            { name: "Netlify", level: 4, category: "Cloud" },

            // Databases
            { name: "MongoDB", level: 4, category: "Databases" },
            { name: "PostgreSQL", level: 4, category: "Databases" },
            { name: "MySQL", level: 3, category: "Databases" },
            { name: "Redis", level: 3, category: "Databases" },
            { name: "Firestore", level: 5, category: "Databases" },
        ],

        // Blog posts - matching admin format (title, slug, excerpt, content, tags, published)
        blog: [
            {
                title: "Building Scalable Applications with Next.js 14",
                slug: "building-scalable-nextjs-14",
                excerpt: "Learn how to leverage Next.js 14's new features to build high-performance, scalable web applications",
                content: `# Building Scalable Applications with Next.js 14

Next.js 14 has introduced several groundbreaking features that make building scalable applications easier than ever.

## Server Components

Server Components allow you to render parts of your application on the server, reducing client-side JavaScript and improving performance.

## App Router

The new App Router provides better routing patterns and improved developer experience.

## Conclusion

Next.js 14 is a game-changer for building modern web applications.`,
                tags: ["Next.js", "React", "Web Development", "Performance"],
                published: true,
            },
            {
                title: "Mastering TypeScript for React Development",
                slug: "mastering-typescript-react",
                excerpt: "A comprehensive guide to using TypeScript effectively in React applications",
                content: `# Mastering TypeScript for React Development

TypeScript brings type safety and better developer experience to React applications.

## Why TypeScript?

TypeScript catches errors at compile time, provides better IDE support, and improves code maintainability.

## Best Practices

1. Use interfaces for props
2. Leverage generics for reusable components
3. Avoid 'any' type whenever possible

## Conclusion

TypeScript is essential for large-scale React applications.`,
                tags: ["TypeScript", "React", "JavaScript"],
                published: true,
            },
            {
                title: "Optimizing Web Performance: A Complete Guide",
                slug: "optimizing-web-performance",
                excerpt: "Essential techniques for improving website load times and user experience",
                content: `# Optimizing Web Performance

Web performance directly impacts user experience and SEO rankings.

## Key Metrics

- First Contentful Paint (FCP)
- Largest Contentful Paint (LCP)
- Time to Interactive (TTI)

## Optimization Techniques

1. Image optimization
2. Code splitting
3. Lazy loading
4. Caching strategies

## Tools

Use Lighthouse, WebPageTest, and Chrome DevTools for performance auditing.`,
                tags: ["Performance", "Web Development", "Optimization"],
                published: true,
            },
        ],

        // Research papers - matching admin format (title, authors, publication, year, doi, abstract, tags, published)
        papers: [
            {
                title: "Efficient Algorithms for Real-Time Data Processing",
                authors: ["Dr. John Smith", "Dr. Jane Doe"],
                publication: "IEEE Transactions on Computer Science",
                year: 2024,
                doi: "https://doi.org/10.1109/example.2024.001",
                abstract: "This paper presents novel algorithms for processing large-scale real-time data streams with low latency and high throughput. We demonstrate a 40% improvement over existing methods.",
                tags: ["Algorithms", "Data Processing", "Real-Time Systems"],
                published: true,
            },
            {
                title: "Machine Learning Applications in Web Development",
                authors: ["Dr. Sarah Johnson", "Dr. Michael Chen"],
                publication: "Journal of Web Technologies",
                year: 2023,
                doi: "https://doi.org/10.1234/jwt.2023.456",
                abstract: "We explore the integration of machine learning models into modern web applications, focusing on performance optimization and user experience enhancement.",
                tags: ["Machine Learning", "Web Development", "AI"],
                published: true,
            },
        ],
    };

    const insertSampleData = async () => {
        if (!confirm("This will insert sample data into all collections. Continue?")) {
            return;
        }

        try {
            setLoading(true);
            setError("");

            console.log("Starting data insertion...");

            // Insert projects
            console.log("Inserting projects...");
            for (const project of sampleData.portfolio) {
                await addDoc(collection(db, "portfolio"), project);
            }

            // Insert skills
            console.log("Inserting skills...");
            for (const skill of sampleData.skills) {
                await addDoc(collection(db, "skills"), skill);
            }

            // Insert blog posts
            console.log("Inserting blog posts...");
            for (const post of sampleData.blog) {
                await addDoc(collection(db, "blog"), post);
            }

            // Insert research papers
            console.log("Inserting papers...");
            for (const paper of sampleData.papers) {
                await addDoc(collection(db, "papers"), paper);
            }

            console.log("Data insertion complete!");
            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);

            // Notify parent to refresh counts
            if (onDataInserted) {
                onDataInserted();
            }
        } catch (err: any) {
            console.error("Error inserting sample data:", err);
            setError(err.message || "Failed to insert sample data");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative">
            <button
                onClick={insertSampleData}
                disabled={loading || success}
                className="flex items-center gap-2 px-4 py-2 border border-primary/30 text-primary hover:bg-primary/10 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {loading ? (
                    <>
                        <Loader2 size={18} className="animate-spin" />
                        <span>Inserting...</span>
                    </>
                ) : success ? (
                    <>
                        <Check size={18} />
                        <span>Data Inserted!</span>
                    </>
                ) : (
                    <>
                        <Database size={18} />
                        <span>Insert Sample Data</span>
                    </>
                )}
            </button>

            {error && (
                <div className="absolute top-full mt-2 right-0 px-4 py-2 rounded shadow-lg text-sm bg-red-500/10 text-red-500 border border-red-500/30 max-w-sm">
                    {error}
                </div>
            )}
        </div>
    );
}
