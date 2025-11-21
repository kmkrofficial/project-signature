"use client";

import React, { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { useTheme } from "@/components/layout/ThemeProvider";

function NetworkNode({ position, color }: { position: [number, number, number]; color: string }) {
    return (
        <mesh position={position}>
            <sphereGeometry args={[0.05, 16, 16]} />
            <meshStandardMaterial color={color} emissive={color} emissiveIntensity={2} />
        </mesh>
    );
}

function Connections({ points, color }: { points: THREE.Vector3[]; color: string }) {
    const geometry = useMemo(() => {
        const geo = new THREE.BufferGeometry().setFromPoints(points);
        return geo;
    }, [points]);

    return (
        <lineSegments geometry={geometry}>
            <lineBasicMaterial color={color} transparent opacity={0.3} />
        </lineSegments>
    );
}

function RotatingCore() {
    const groupRef = useRef<THREE.Group>(null);
    const { theme } = useTheme();

    const primaryColor = theme === "deepSystem" ? "#06b6d4" : "#0369a1";
    const secondaryColor = theme === "deepSystem" ? "#64748b" : "#94a3b8";

    // Generate random points on a sphere
    const { points, connections } = useMemo(() => {
        const count = 40;
        const pts: THREE.Vector3[] = [];
        const radius = 2;

        for (let i = 0; i < count; i++) {
            const phi = Math.acos(-1 + (2 * i) / count);
            const theta = Math.sqrt(count * Math.PI) * phi;

            const x = radius * Math.cos(theta) * Math.sin(phi);
            const y = radius * Math.sin(theta) * Math.sin(phi);
            const z = radius * Math.cos(phi);

            pts.push(new THREE.Vector3(x, y, z));
        }

        // Create connections between close points
        const conns: THREE.Vector3[] = [];
        for (let i = 0; i < pts.length; i++) {
            for (let j = i + 1; j < pts.length; j++) {
                if (pts[i].distanceTo(pts[j]) < 1.2) {
                    conns.push(pts[i]);
                    conns.push(pts[j]);
                }
            }
        }

        return { points: pts, connections: conns };
    }, []);

    useFrame((state) => {
        if (groupRef.current) {
            groupRef.current.rotation.y += 0.002;
            groupRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
        }
    });

    return (
        <group ref={groupRef}>
            {points.map((pt, i) => (
                <NetworkNode key={i} position={[pt.x, pt.y, pt.z]} color={primaryColor} />
            ))}
            <Connections points={connections} color={secondaryColor} />

            {/* Central Core */}
            <mesh>
                <icosahedronGeometry args={[1, 0]} />
                <meshStandardMaterial
                    color={primaryColor}
                    wireframe
                    transparent
                    opacity={0.1}
                />
            </mesh>
        </group>
    );
}

export function NetworkCore() {
    return (
        <div className="w-full h-full absolute inset-0 -z-10 opacity-60">
            <Canvas camera={{ position: [0, 0, 5] }}>
                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} />
                <RotatingCore />
                <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={0.5} />
            </Canvas>
        </div>
    );
}
