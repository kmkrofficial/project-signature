"use client";

import React from "react";
import { Canvas } from "@react-three/fiber";

import { Sparkles, Environment, Float } from "@react-three/drei";

function DigitalAtmosphere() {
    return (
        <>
            {/* Layer 1: Subtle background particles (Slate) - Increased density */}
            <Sparkles
                count={400}
                scale={20}
                size={4}
                speed={0.4}
                opacity={0.4}
                color="#94a3b8"
            />

            {/* Layer 2: Active data particles (Sky Blue) - Increased density */}
            <Sparkles
                count={250}
                scale={12}
                size={6}
                speed={0.6}
                opacity={0.7}
                color="#0ea5e9"
            />

            {/* Layer 3: Floating larger elements for depth - Increased density */}
            <Float speed={1} rotationIntensity={0.5} floatIntensity={0.5}>
                <Sparkles
                    count={50}
                    scale={10}
                    size={10}
                    speed={0.3}
                    opacity={0.3}
                    color="#38bdf8"
                />
            </Float>

            <Environment preset="city" />
        </>
    );
}

export default function CreativeCore() {
    return (
        <div className="w-full h-full absolute inset-0 -z-10 opacity-80 bg-gradient-to-br from-white via-slate-50 to-white">
            <Canvas camera={{ position: [0, 0, 5] }} dpr={[1, 2]} gl={{ antialias: false }}>
                <DigitalAtmosphere />
            </Canvas>
        </div>
    );
}
