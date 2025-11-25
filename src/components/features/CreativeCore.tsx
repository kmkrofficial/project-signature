"use client";

import React, { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, PerspectiveCamera, Environment, MeshDistortMaterial, Sparkles, Cloud } from "@react-three/drei";
import * as THREE from "three";
import { useTheme } from "@/components/layout/ThemeProvider";

function OrganicShape({ position, color, speed }: { position: [number, number, number], color: string, speed: number }) {
    const meshRef = useRef<THREE.Mesh>(null);

    useFrame((state) => {
        if (meshRef.current) {
            meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * speed) * 0.2;
            meshRef.current.rotation.y = Math.cos(state.clock.elapsedTime * speed * 0.5) * 0.2;
        }
    });

    return (
        <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
            <mesh ref={meshRef} position={position}>
                <sphereGeometry args={[1, 64, 64]} />
                <MeshDistortMaterial
                    color={color}
                    envMapIntensity={1}
                    clearcoat={1}
                    clearcoatRoughness={0}
                    metalness={0.1}
                    roughness={0.1}
                    distort={0.4}
                    speed={2}
                />
            </mesh>
        </Float>
    );
}

function Scene() {
    return (
        <>
            <PerspectiveCamera makeDefault position={[0, 0, 10]} />
            <ambientLight intensity={1} />
            <pointLight position={[10, 10, 10]} intensity={2} color="#ffffff" />
            <pointLight position={[-10, -10, -10]} intensity={1} color="#ff99cc" />
            <spotLight position={[0, 10, 0]} intensity={1} penumbra={1} />

            {/* Organic Floating Shapes */}
            <OrganicShape position={[-4, 2, -5]} color="#A7C7E7" speed={0.5} /> {/* Pastel Blue */}
            <OrganicShape position={[4, -2, -3]} color="#FDFD96" speed={0.4} /> {/* Pastel Yellow */}
            <OrganicShape position={[0, 0, -8]} color="#C1E1C1" speed={0.3} /> {/* Pastel Green */}

            {/* Background Elements */}
            <Cloud opacity={0.3} speed={0.2} bounds={[10, 2, 2]} segments={20} position={[0, -5, -10]} color="#ffffff" />
            <Sparkles count={100} scale={12} size={4} speed={0.4} opacity={0.5} color="#B39EB5" />

            <Environment preset="city" />
        </>
    );
}

export default function CreativeCore() {
    const { theme } = useTheme();

    // Robust check to ensure it renders in light modes
    // If theme is explicitly "deepSystem", do not render.
    // Otherwise (including undefined/loading), render to prevent flickering.
    if (theme === "deepSystem") return null;

    return (
        <div className="w-full h-full absolute inset-0 -z-10 opacity-80 bg-gradient-to-br from-blue-50 via-white to-purple-50">
            <Canvas dpr={[1, 2]}>
                <Scene />
            </Canvas>
        </div>
    );
}
