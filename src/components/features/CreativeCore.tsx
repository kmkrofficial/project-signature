"use client";

import React from "react";
import { Canvas } from "@react-three/fiber";

import { Sparkles, Environment, Float } from "@react-three/drei";

function useReducedMotion() {
    const [reduced, setReduced] = React.useState(false);
    React.useEffect(() => {
        if (typeof window === "undefined") return;
        const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
        setReduced(mq.matches);
        const handler = (e: MediaQueryListEvent) => setReduced(e.matches);
        mq.addEventListener("change", handler);
        return () => mq.removeEventListener("change", handler);
    }, []);
    return reduced;
}

function useIsMobile() {
    const [mobile, setMobile] = React.useState(false);
    React.useEffect(() => {
        if (typeof window === "undefined") return;
        const mq = window.matchMedia("(max-width: 768px)");
        setMobile(mq.matches);
        const handler = (e: MediaQueryListEvent) => setMobile(e.matches);
        mq.addEventListener("change", handler);
        return () => mq.removeEventListener("change", handler);
    }, []);
    return mobile;
}

function DigitalAtmosphere({ counts }: { counts: { bg: number; data: number; large: number } }) {
    return (
        <>
            <Sparkles count={counts.bg} scale={20} size={4} speed={0.4} opacity={0.4} color="#94a3b8" />
            <Sparkles count={counts.data} scale={12} size={6} speed={0.6} opacity={0.7} color="#0ea5e9" />
            <Float speed={1} rotationIntensity={0.5} floatIntensity={0.5}>
                <Sparkles count={counts.large} scale={10} size={10} speed={0.3} opacity={0.3} color="#38bdf8" />
            </Float>
            <Environment preset="city" />
        </>
    );
}

export default function CreativeCore() {
    const reduced = useReducedMotion();
    const isMobile = useIsMobile();

    if (reduced) {
        return <div className="w-full h-full absolute inset-0 -z-10 bg-gradient-to-br from-white via-slate-50 to-white" />;
    }

    const counts = isMobile
        ? { bg: 80, data: 50, large: 10 }
        : { bg: 200, data: 100, large: 20 };

    return (
        <div className="w-full h-full absolute inset-0 -z-10 bg-gradient-to-br from-white via-slate-50 to-white">
            <Canvas
                camera={{ position: [0, 0, 5] }}
                dpr={[1, 1.5]}
                gl={{
                    antialias: !isMobile,
                    powerPreference: "high-performance",
                    failIfMajorPerformanceCaveat: false,
                }}
            >
                <DigitalAtmosphere counts={counts} />
            </Canvas>
        </div>
    );
}
