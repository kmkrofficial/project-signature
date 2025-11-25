"use client";

import React, { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Stars, Float } from "@react-three/drei";
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
            <lineBasicMaterial color={color} transparent opacity={0.2} />
        </lineSegments>
    );
}

function DataPacket({ path, speed, color }: { path: [THREE.Vector3, THREE.Vector3], speed: number, color: string }) {
    const meshRef = useRef<THREE.Mesh>(null);
    const [start, end] = path;
    const progress = useRef(Math.random());

    useFrame((state, delta) => {
        if (meshRef.current) {
            progress.current += delta * speed;
            if (progress.current > 1) progress.current = 0;

            meshRef.current.position.lerpVectors(start, end, progress.current);
        }
    });

    return (
        <mesh ref={meshRef}>
            <sphereGeometry args={[0.03, 8, 8]} />
            <meshBasicMaterial color={color} />
        </mesh>
    );
}

function RotatingCore() {
    const groupRef = useRef<THREE.Group>(null);
    const coreRef = useRef<THREE.Mesh>(null);
    const { theme } = useTheme();

    const primaryColor = theme === "deepSystem" ? "#06b6d4" : "#0369a1";
    const secondaryColor = theme === "deepSystem" ? "#64748b" : "#94a3b8";

    // Generate random points on a sphere
    const { points, connections, packetPaths } = useMemo(() => {
        const count = 50;
        const pts: THREE.Vector3[] = [];
        const radius = 2.5;

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
        const paths: [THREE.Vector3, THREE.Vector3][] = [];

        for (let i = 0; i < pts.length; i++) {
            for (let j = i + 1; j < pts.length; j++) {
                if (pts[i].distanceTo(pts[j]) < 1.5) {
                    conns.push(pts[i]);
                    conns.push(pts[j]);

                    // Add some paths for data packets (randomly)
                    if (Math.random() > 0.8) {
                        paths.push([pts[i], pts[j]]);
                    }
                }
            }
        }

        return { points: pts, connections: conns, packetPaths: paths };
    }, []);

    useFrame((state) => {
        if (groupRef.current) {
            groupRef.current.rotation.y += 0.001;
            groupRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.2) * 0.05;
        }
        if (coreRef.current) {
            // Pulsing effect
            const scale = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.05;
            coreRef.current.scale.set(scale, scale, scale);
            coreRef.current.rotation.y -= 0.005;
            coreRef.current.rotation.z += 0.002;
        }
    });

    return (
        <group ref={groupRef}>
            {points.map((pt, i) => (
                <NetworkNode key={i} position={[pt.x, pt.y, pt.z]} color={primaryColor} />
            ))}
            <Connections points={connections} color={secondaryColor} />

            {/* Data Packets */}
            {packetPaths.map((path, i) => (
                <DataPacket key={`packet-${i}`} path={path} speed={0.5 + Math.random() * 0.5} color="#ffffff" />
            ))}

            {/* Central Core */}
            <Float speed={2} rotationIntensity={0.2} floatIntensity={0.2}>
                <mesh ref={coreRef}>
                    <icosahedronGeometry args={[1.2, 1]} />
                    <meshStandardMaterial
                        color={primaryColor}
                        wireframe
                        transparent
                        opacity={0.15}
                        emissive={primaryColor}
                        emissiveIntensity={0.2}
                    />
                </mesh>
            </Float>
        </group>
    );
}

export default function NetworkCore() {
    return (
        <div className="w-full h-full absolute inset-0 -z-10 opacity-80">
            <Canvas camera={{ position: [0, 0, 6] }} dpr={[1, 2]}>
                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} intensity={1} />
                <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
                {/* <RotatingCore /> */}
                <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={0.5} enablePan={false} />
            </Canvas>
        </div>
    );
}
