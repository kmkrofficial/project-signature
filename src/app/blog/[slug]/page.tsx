import React from "react";
import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { ArrowLeft, Calendar, Clock, Tag } from "lucide-react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";

// Mock Content Generator (In a real app, this would fetch from MDX files or a CMS)
const getPostContent = (slug: string) => {
    return {
        title: "Scaling WebSockets for 10 Million Users",
        date: "2024-03-15",
        readTime: "8 min read",
        tags: ["WebSockets", "Redis", "Scaling"],
        content: `
## Introduction

Building real-time applications that scale to millions of users requires a fundamental shift in how we think about state and connection management. In this log, I'll break down the architecture used to support 10M+ users at Zoho.

## The Challenge: Connection Limits

Traditional HTTP request-response cycles are stateless. WebSockets, however, maintain a persistent connection. A single server has a limit on the number of open file descriptors (sockets) it can handle.

\`\`\`python
# Standard limit check
ulimit -n
# Often defaults to 1024, needs to be raised to 65535+
\`\`\`

## Architecture: The Pub/Sub Layer

To scale horizontally, we cannot rely on sticky sessions alone. We need a way to broadcast messages across different server nodes.

### Redis Pub/Sub

We utilized Redis as a lightweight message broker. When a user connects to Node A, and a message needs to be sent to them from a process on Node B, Node B publishes to a Redis channel that Node A is subscribed to.

1. **Client** connects to **Load Balancer**
2. **Load Balancer** routes to **Socket Server Instance**
3. **Instance** subscribes to Redis channel \`user:{userId}\`

## Optimization Techniques

- **Heartbeat Tuning**: Adjusting ping/pong intervals to balance load vs. zombie connection detection.
- **Binary Formats**: Using Protobuf instead of JSON for high-frequency telemetry data reduced bandwidth by 40%.

## Conclusion

Scaling is not just about adding more servers; it's about reducing the state each server needs to hold and ensuring efficient inter-node communication.
    `
    };
};

export default function BlogPostPage({ params }: { params: { slug: string } }) {
    const post = getPostContent(params.slug);

    return (
        <div className="pt-20 min-h-screen">
            <Section>
                <Container className="max-w-4xl">
                    <Link
                        href="/blog"
                        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-8 transition-colors"
                    >
                        <ArrowLeft size={16} />
                        Return to Logs
                    </Link>

                    <header className="mb-12 border-b border-border pb-8">
                        <div className="flex flex-wrap gap-4 text-sm font-mono text-muted-foreground mb-4">
                            <div className="flex items-center gap-2">
                                <Calendar size={14} />
                                {post.date}
                            </div>
                            <div className="flex items-center gap-2">
                                <Clock size={14} />
                                {post.readTime}
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

                    <article className="prose prose-invert prose-lg max-w-none prose-headings:font-bold prose-headings:tracking-tight prose-a:text-primary prose-code:text-primary prose-pre:bg-secondary/30 prose-pre:border prose-pre:border-border">
                        <ReactMarkdown>{post.content}</ReactMarkdown>
                    </article>
                </Container>
            </Section>
        </div>
    );
}
