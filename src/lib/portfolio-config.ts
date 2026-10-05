import { Shield, Globe, Cpu, Database, Award, HardDrive } from "lucide-react";

export const PORTFOLIO_CONFIG = {
    personal: {
        name: "Keerthi Raajan K M",
        title: "Full Stack AI & Systems Engineer",
        publicationName: "Signature",
        location: "India",
        email: "contact@keerthiraajan.dev",
        tagline: "Bridging the gap between high-availability backend infrastructure and efficient, edge-deployed Large Language Models for millions of users.",
        summary: "I build robust, high-throughput distributed systems and deploy custom edge AI models. My publication, Signature, is an unfiltered technical journal capturing system design overcomings, architecture breakdowns, and learnings from the frontier of engineering.",
        status: "Available for high-impact systems & AI architecture",
        social: {
            github: "https://github.com/kmkrofficial",
            linkedin: "https://linkedin.com/in/keerthiraajan",
            email: "mailto:kmkrworks@gmail.com",
        }
    },
    metrics: [
        {
            value: "10M+",
            label: "Active Users Served",
            detail: "High-availability cache servers & distributed systems (Zoho)",
            icon: Globe
        },
        {
            value: "32 TB",
            label: "Storage Optimized",
            detail: "Enterprise NAS automated monitoring & cleanup (NetApp)",
            icon: HardDrive
        },
        {
            value: "1st Place",
            label: "ASEAN-India Hackathon",
            detail: "SEAS Maritime Defense AI with Indian Navy collaboration",
            icon: Award
        },
        {
            value: "124M",
            label: "Edge SLM Parameters",
            detail: "LiteGPT custom transformer trained on consumer hardware",
            icon: Cpu
        }
    ],
    themes: {
        burnishedGold: {
            name: "Burnished Gold / Topaz",
            colors: {
                background: "#0d0f12",
                primary: "#f59e0b", // Topaz Amber
                secondary: "#191c23",
                accent: "#d97706", // Citrine
            }
        }
    },
    arsenal: {
        ai_ml: [
            "PyTorch", "TensorFlow", "Hugging Face", "Transformers", "Edge SLMs", "OpenCV", "LangChain"
        ],
        cloud_devops: [
            "Google Cloud Platform", "Kubernetes", "Docker", "Databricks", "Firebase", "Zoho Catalyst", "CI/CD"
        ],
        web_systems: [
            "FastAPI", "Next.js", "React", "Gin", "Spring Boot", "Flask", "ExpressJS", "Django"
        ],
        data_infra: [
            "NetApp ONTAP", "PySpark", "Pandas", "Redis", "Kafka", "PostgreSQL", "PowerBI"
        ]
    },
    flagshipSystems: [
        {
            id: "seas",
            name: "SEAS — Coastal Surveillance & Defense AI",
            badge: "1st Place Winner • ASEAN-India Hackathon",
            summary: "Real-time Maritime Security & Coastal Surveillance AI developed in collaboration with defense and maritime researchers. Features computer vision vessel classification, restricted zone anomaly detection, and automated threat telemetry.",
            metrics: {
                "Accuracy": "99.1%",
                "Scope": "International ASEAN",
                "Domain": "Defense AI"
            },
            tech: ["Python", "Computer Vision", "PyTorch", "Radar Fusion", "FastAPI"],
            github: "https://github.com/kmkrofficial",
            icon: Shield
        },
        {
            id: "litegpt",
            name: "LiteGPT — 124M Parameter Edge SLM",
            badge: "Custom Edge Model",
            summary: "A 124M-parameter Small Language Model engineered and trained entirely from scratch on consumer hardware. Implements multi-head causal self-attention, rotary embeddings (RoPE), KV-caching, and low-latency inference pipelines.",
            metrics: {
                "Parameters": "124 Million",
                "Hardware": "Consumer GPU",
                "Latency": "<45ms token/s"
            },
            tech: ["PyTorch", "CUDA", "Transformer Architecture", "Tokenization"],
            github: "https://github.com/kmkrofficial",
            icon: Cpu
        },
        {
            id: "logsentinel",
            name: "LogSentinel — Edge AIOps & Telemetry Engine",
            badge: "Infrastructure Diagnostics",
            summary: "Distributed anomaly detection system powered by a fine-tuned LLaMA 3.2-1B model. Ingests high-frequency system logs from distributed clusters, isolates telemetry deviations, and correlates multi-service cascade failures in sub-50ms.",
            metrics: {
                "Inference": "<50ms",
                "F1-Score": "93.4%",
                "Model": "LLaMA 3.2-1B Quantized"
            },
            tech: ["LLaMA 3.2", "Python", "FastAPI", "Redis Streams", "AIOps"],
            github: "https://github.com/kmkrofficial",
            icon: Database
        }
    ],
    experience: [
        {
            id: "netapp-current",
            company: "NetApp",
            role: "Automation Engineer",
            period: "July 2025 — Present",
            description: "Architected and built an internal monitoring platform from the ground up for globally distributed enterprise NAS infrastructure. Implemented automated health checks, proactive alert triggers, and seamless SAML SSO integration.",
            highlights: [
                "Engineered automated system diagnostics that decreased support ticket volume by 24%.",
                "Automated enterprise NAS storage telemetry, recovering ~32 TB of storage infrastructure to date.",
                "Integrated enterprise-grade SSO SAML with zero downtime for internal infrastructure operators."
            ],
            tech: ["Python", "FastAPI", "ONTAP REST APIs", "SAML SSO", "Shell Scripting", "Distributed NAS"]
        },
        {
            id: "zoho-mts",
            company: "Zoho Corporation",
            role: "Member Technical Staff",
            period: "May 2022 — June 2024",
            description: "Architected and scaled low-latency Browser-as-a-Service remote isolation platforms and distributed microservices supporting enterprise security boundaries.",
            highlights: [
                "Scaled remote browser infrastructure to support high concurrency with consistent 95% SLA.",
                "Optimized bi-directional WebSocket and WebRTC pipelines to ensure low-latency remote user experience.",
                "Built granular role-based access control (RBAC) and security boundary enforcement across multi-tenant clusters."
            ],
            tech: ["Java", "WebSockets", "Redis", "Linux Systems", "Docker", "Microservices"]
        },
        {
            id: "zoho-trainee",
            company: "Zoho Corporation",
            role: "Project Trainee",
            period: "Dec 2021 — May 2022",
            description: "Engineered and benchmarked caching layers and memory eviction strategies across core infrastructure serving tens of millions of active users.",
            highlights: [
                "Optimized distributed cache architectures supporting 10M+ users with 99.9% reliability.",
                "Formulated adaptive cache eviction policies to slash cache miss ratios under peak traffic spikes."
            ],
            tech: ["Java", "Redis", "Distributed Caching", "Data Structures", "Benchmarking"]
        }
    ],
    education: [
        {
            degree: "M.Tech in Artificial Intelligence & Machine Learning",
            institution: "Vellore Institute of Technology (VIT)",
            year: "2024",
            detail: "Advanced Deep Learning, Distributed AI, Neural Networks"
        },
        {
            degree: "B.E. in Computer Science & Engineering",
            institution: "Sri Krishna College of Engineering & Technology (SKCET)",
            year: "2022",
            detail: "Operating Systems, High-Performance Computing, Algorithms"
        }
    ],
    publications: [
        {
            title: "Automated Software Bug Triaging & Predictive Categorization",
            publisher: "Elsevier",
            year: "2023",
            description: "Machine learning research on automated defect dispatching in large-scale software systems."
        }
    ]
};
