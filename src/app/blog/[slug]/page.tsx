"use client";

import React, { useEffect, useState } from "react";
import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { ArrowLeft, Calendar, Clock, Tag, Loader2 } from "lucide-react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { useThemeLanguage } from "@/hooks/useThemeLanguage";
import { useTheme } from "@/components/layout/ThemeProvider";
import { useParams } from "next/navigation";

interface BlogPost {
    id: string;
    title: string;
    slug: string;
    content: string;
    date: string;
    readTime: string;
    tags: string[];
}

export default function BlogPostPage() {
    const params = useParams();
    const slug = params.slug as string;
    const t = useThemeLanguage();
    const { theme } = useTheme();
    const [post, setPost] = useState<BlogPost | null>(null);
    const [loading, setLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);

    useEffect(() => {
        const fetchPost = async () => {
            try {
                const q = query(collection(db, "blog"), where("slug", "==", slug));
                const querySnapshot = await getDocs(q);

                if (querySnapshot.empty) {
                    setNotFound(true);
                } else {
                    const doc = querySnapshot.docs[0];
                    const data = doc.data();
                    setPost({
                        id: doc.id,
                        title: data.title,
                        slug: data.slug,
                        content: data.content,
                        tags: data.tags || [],
                        date: data.createdAt ? new Date(data.createdAt.seconds * 1000).toLocaleDateString() : "Unknown",
                        readTime: `${Math.max(1, Math.ceil((data.content?.split(/\s+/).length || 0) / 200))} min read`,
                    });
                }
            } catch (error) {
                console.error("Error fetching post:", error);
                setNotFound(true);
            } finally {
                setLoading(false);
            }
        };

        if (slug) {
            fetchPost();
        }
    }, [slug]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center pt-20">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="animate-spin text-primary" size={40} />
                    <p className="font-mono text-muted-foreground">{t.blog.loading}</p>
                </div>
            </div>
        );
    }

    if (notFound || !post) {
        return (
            <div className="min-h-screen flex items-center justify-center pt-20">
                <div className="text-center">
                    <h1 className="text-4xl font-bold mb-4 text-red-500">{t.blog.notFound}</h1>
                    <Link href="/blog" className="text-primary hover:underline">
                        {t.blog.backToLogs}
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="pt-20 min-h-screen">
            <Section className="py-12 md:py-16">
                <Container className="max-w-4xl">
                    <Link
                        href="/blog"
                        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-8 transition-colors"
                    >
                        <ArrowLeft size={16} />
                        {t.blog.backToLogs}
                    </Link>

                    <header className="mb-8 border-b border-border pb-6">
                        <div className="flex flex-wrap gap-4 text-sm font-mono text-muted-foreground mb-4">
                            <div className="flex items-center gap-2">
                                <Calendar size={14} />
                                {post.date}
                            </div>
                            <div className="flex items-center gap-2">
                                <Clock size={14} />
                                {post.readTime.replace("read", "").trim()} {t.blog.readTime}
                            </div>
                        </div>

                        <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
                            {post.title}
                        </h1>

                        <div className="flex gap-2">
                            {post.tags.map(tag => (
                                <span key={tag} className="flex items-center gap-1 text-xs font-mono px-2 py-1 rounded bg-primary/10 text-primary border border-primary/20">
                                    <Tag size={10} />
                                    {tag}
                                </span>
                            ))}
                        </div>
                    </header>

                    <article className={`prose prose-lg max-w-none prose-headings:font-bold prose-headings:tracking-tight prose-a:text-primary prose-code:text-primary prose-pre:bg-secondary/30 prose-pre:border prose-pre:border-border ${theme === 'deepSystem' ? 'prose-invert' : ''}`}>
                        <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            components={{
                                code({ node, inline, className, children, ...props }: any) {
                                    const match = /language-(\w+)/.exec(className || '');
                                    return !inline && match ? (
                                        <SyntaxHighlighter
                                            style={atomDark}
                                            language={match[1]}
                                            PreTag="div"
                                            {...props}
                                        >
                                            {String(children).replace(/\n$/, '')}
                                        </SyntaxHighlighter>
                                    ) : (
                                        <code className={className} {...props}>
                                            {children}
                                        </code>
                                    );
                                },
                                table({ children }) {
                                    return (
                                        <div className="overflow-x-auto my-8 border border-border rounded-lg">
                                            <table className="w-full text-left text-sm">
                                                {children}
                                            </table>
                                        </div>
                                    );
                                },
                                thead({ children }) {
                                    return (
                                        <thead className="bg-secondary/50 text-primary font-mono uppercase text-xs tracking-wider border-b border-border">
                                            {children}
                                        </thead>
                                    );
                                },
                                th({ children }) {
                                    return (
                                        <th className="px-6 py-3 font-bold">
                                            {children}
                                        </th>
                                    );
                                },
                                td({ children }) {
                                    return (
                                        <td className="px-6 py-4 border-b border-border/50 whitespace-nowrap">
                                            {children}
                                        </td>
                                    );
                                },
                                img({ src, alt }) {
                                    return (
                                        <div className="my-8">
                                            <div className="relative rounded-lg overflow-hidden border border-border group">
                                                <img
                                                    src={src}
                                                    alt={alt}
                                                    className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-105"
                                                />
                                                <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/10 transition-colors pointer-events-none" />
                                            </div>
                                            {alt && (
                                                <p className="text-center text-xs text-muted-foreground mt-2 font-mono">
                                                    // {alt}
                                                </p>
                                            )}
                                        </div>
                                    );
                                },
                                blockquote({ children }) {
                                    return (
                                        <blockquote className="border-l-4 border-primary pl-4 italic text-muted-foreground my-6 bg-secondary/10 py-2 pr-4 rounded-r">
                                            {children}
                                        </blockquote>
                                    );
                                }
                            }}
                        >
                            {post.content}
                        </ReactMarkdown>
                    </article>
                </Container>
            </Section>
        </div>
    );
}
