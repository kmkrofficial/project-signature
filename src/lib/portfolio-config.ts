import {
    Cpu,
    Globe,
    Layers,
    LayoutTemplate,
    Server,
    Shield,
    Terminal,
    Zap
} from "lucide-react";

export const PORTFOLIO_CONFIG = {
    personal: {
        name: "Keerthi Raajan K M",
        title: "Full-Stack AI Engineer",
        location: "Coimbatore",
        email: "contact@keerthiraajan.dev", // Placeholder email as none was provided
        summary: "Architecting high-availability systems for 10M+ users. Specializing in the intersection of scalable backend logic (Cache, Kafka, WebSockets) and AI integration (LLMs).",
        ctaPrimary: "INITIATE_PROTOCOL",
        ctaSecondary: "ESTABLISH_UPLINK",
        casual: {
            name: "Keerthi Raajan K M",
            title: "Creative Developer & AI Enthusiast",
            summary: "Hi! I build cool stuff with code. I love making apps that are fast, smart, and look great. I mix backend power with AI magic to create unique experiences.",
            ctaPrimary: "View Projects",
            ctaSecondary: "Contact Me"
        },
        social: {
            github: "https://github.com/keerthiraajan",
            linkedin: "https://linkedin.com/in/keerthiraajan",
        }
    },
    themes: {
        deepSystem: {
            name: "Deep System",
            colors: {
                background: "#0a0a0a", // Charcoal
                primary: "#06b6d4", // Neon Cyan
                secondary: "#64748b", // Slate
                accent: "#f59e0b", // Amber for warnings/alerts
            }
        },
        technicalBlueprint: {
            name: "Technical Blueprint",
            colors: {
                background: "#f0f9ff", // Drafting paper white/blue
                primary: "#0369a1", // Precision Blue
                secondary: "#94a3b8", // Grid lines
                accent: "#dc2626", // Red pen
            }
        }
    },
    skills: [
        {
            category: "AI / ML",
            items: [
                { name: "Python", projectCount: 12, proficiency: 95, icon: "python" },
                { name: "PyTorch", projectCount: 8, proficiency: 88, icon: "pytorch" },
                { name: "Langchain", projectCount: 5, proficiency: 85, icon: "langchain" },
                { name: "TensorFlow", projectCount: 4, proficiency: 80, icon: "tensorflow" },
                { name: "OpenCV", projectCount: 6, proficiency: 85, icon: "opencv" },
            ]
        },
        {
            category: "Backend Engineering",
            items: [
                { name: "Java", projectCount: 10, proficiency: 85, icon: "java" },
                { name: "FastAPI", projectCount: 7, proficiency: 90, icon: "fastapi" },
                { name: "Redis", projectCount: 5, proficiency: 90, icon: "redis" },
                { name: "Kafka", projectCount: 3, proficiency: 88, icon: "kafka" },
                { name: "PostgreSQL", projectCount: 8, proficiency: 90, icon: "postgresql" },
            ]
        },
        {
            category: "Frontend & Cloud",
            items: [
                { name: "Next.js", projectCount: 4, proficiency: 80, icon: "nextjs" },
                { name: "React", projectCount: 6, proficiency: 85, icon: "react" },
                { name: "Docker", projectCount: 15, proficiency: 92, icon: "docker" },
                { name: "GCP", projectCount: 5, proficiency: 85, icon: "gcp" },
                { name: "TypeScript", projectCount: 5, proficiency: 80, icon: "typescript" },
            ]
        }
    ],
    experience: [
        {
            id: "netapp-2024",
            company: "NetApp",
            role: "Software Intern",
            period: "2024 - Present",
            description: "Building an internal monitoring platform using FastAPI.",
            achievements: [
                "Decreased support tickets by 24% through automated alert correlation.",
                "Implemented real-time system health visualization.",
            ],
            tech: ["FastAPI", "Python", "React"]
        },
        {
            id: "zoho-2022",
            company: "Zoho Corporation",
            role: "Full Stack Developer",
            period: "2022 - 2024",
            description: "Scaling Browser-as-a-Service platforms for high concurrency.",
            achievements: [
                "Scaled service to support 100 concurrent sessions with 95% uptime.",
                "Optimized WebSocket communication for low-latency remote browsing.",
            ],
            tech: ["Java", "WebSockets", "Redis", "Linux"]
        },
        {
            id: "zoho-2021",
            company: "Zoho Corporation",
            role: "Backend Intern",
            period: "2021 - 2022",
            description: "Optimizing cache infrastructure for massive user bases.",
            achievements: [
                "Optimized cache servers supporting 10 million users.",
                "Reduced cache miss rates by implementing intelligent eviction policies.",
            ],
            tech: ["Java", "Redis", "Data Structures"]
        }
    ],
    projects: [
        {
            id: "log-sentinel",
            name: "Log-Sentinel",
            type: "AI Security Module",
            description: "Edge anomaly detection system for distributed networks.",
            metrics: {
                "F1-Score": "92.3%",
                "Latency": "<50ms",
                "Model": "Custom Transformer"
            },
            tech: ["Python", "PyTorch", "Edge Computing"],
            icon: Shield
        },
        {
            id: "vision360",
            name: "Vision360",
            type: "Computer Vision System",
            description: "Smart India Hackathon winning solution for automated surveillance.",
            metrics: {
                "Accuracy": "98.5%",
                "Streams": "16 Concurrent",
                "Award": "SIH Winner"
            },
            tech: ["OpenCV", "Deep Learning", "Flask"],
            icon: Globe
        },
        {
            id: "seas",
            name: "SEAS",
            type: "Anti-Piracy Engine",
            description: "ASEAN-India Hackathon winning model for content protection.",
            metrics: {
                "Detection Rate": "99.1%",
                "Award": "ASEAN Winner"
            },
            tech: ["AI/ML", "Web Scraping", "NLP"],
            icon: Server
        },
        {
            id: "chatty",
            name: "Chatty",
            type: "RAG Assistant",
            description: "Retrieval-Augmented Generation chatbot for enterprise knowledge bases.",
            metrics: {
                "Context Window": "16k",
                "Retrieval": "Hybrid Search"
            },
            tech: ["Langchain", "Vector DB", "LLMs"],
            icon: Terminal
        }
    ],
    education: [
        {
            degree: "M.Tech AI/ML",
            institution: "VIT",
            year: "2024",
            grade: "9.2 CGPA"
        },
        {
            degree: "B.E. Computer Science",
            institution: "SKCET",
            year: "2022",
            grade: "8.4 CGPA"
        }
    ],
    publications: [
        {
            title: "Bug Triaging Automation",
            publisher: "Elsevier",
            year: "2023",
            link: "#"
        }
    ]
};
