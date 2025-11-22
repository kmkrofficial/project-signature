"use client";

import React, { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, PerspectiveCamera, Environment } from "@react-three/drei";
import * as THREE from "three";
import { useTheme } from "@/components/layout/ThemeProvider";

function FloatingShape({ position, color, scale, rotationSpeed }: any) {
    const meshRef = useRef<THREE.Mesh>(null);

    useFrame((state, delta) => {
        if (meshRef.current) {
            meshRef.current.rotation.x += delta * rotationSpeed;
            meshRef.current.rotation.y += delta * rotationSpeed * 0.5;
        }
    });

    return (
        <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
            <mesh ref={meshRef} position={position} scale={scale}>
                <dodecahedronGeometry args={[1, 0]} />
                <meshStandardMaterial
                    color={color}
                    roughness={0.1}
                    metalness={0.1}
                    transparent
                    opacity={0.8}
                />
            </mesh>
        </Float>
    );
}

function Scene() {
    return (
        <>
            <PerspectiveCamera makeDefault position={[0, 0, 10]} />
            <ambientLight intensity={0.8} />
            <pointLight position={[10, 10, 10]} intensity={1} />
            <pointLight position={[-10, -10, -10]} intensity={0.5} color="#ff99cc" />

            {/* Pastel/Soft Colors for Light Mode */}
            <FloatingShape position={[-4, 2, -5]} color="#A7C7E7" scale={1.5} rotationSpeed={0.2} /> {/* Pastel Blue */}
            <FloatingShape position={[4, -2, -3]} color="#FDFD96" scale={1.2} rotationSpeed={0.15} /> {/* Pastel Yellow */}
            <FloatingShape position={[0, 3, -8]} color="#C1E1C1" scale={2} rotationSpeed={0.1} /> {/* Pastel Green */}
            <FloatingShape position={[-3, -3, -6]} color="#FFB7B2" scale={1.0} rotationSpeed={0.25} /> {/* Pastel Red/Pink */}
            <FloatingShape position={[3, 1, -4]} color="#B39EB5" scale={0.8} rotationSpeed={0.3} /> {/* Pastel Purple */}

            <Environment preset="city" />
        </>
    );
}

export default function CreativeCore() {
    const { theme } = useTheme();

    // Only render if not in dark mode (deepSystem)
    if (theme === "deepSystem") return null;

    return (
        <div className="w-full h-full absolute inset-0 -z-10 opacity-60 bg-gradient-to-br from-white to-gray-100">
            <Canvas>
                <Scene />
            </Canvas>
        </div>
    );
}
