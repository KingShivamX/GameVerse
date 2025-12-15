import React, { useEffect, useRef, useState, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { PerspectiveCamera, Stars } from '@react-three/drei';
import * as THREE from 'three';
import { gsap } from 'gsap';
import { Zap, Hexagon, Aperture } from 'lucide-react';

// --- THE HERO EFFECT: HYPER WARP TUNNEL ---
// Replicates the neon light tunnel effect from your reference image.
const WarpTunnel = ({ progress }) => {
    const count = 2000; // Number of "light streaks"
    const meshRef = useRef(null);

    // Create dummy object for instance manipulation
    const dummy = useMemo(() => new THREE.Object3D(), []);

    // Initialize particles with random positions and colors
    const particles = useMemo(() => {
        const temp = [];
        const colors = ['#00F0FF', '#FF003C', '#FFFFFF']; // Cyberpunk palette: Cyan, Red, White

        for (let i = 0; i < count; i++) {
            // Random angle and radius for tunnel shape
            const angle = Math.random() * Math.PI * 2;
            const radius = 10 + Math.random() * 20; // Tunnel width

            temp.push({
                x: Math.cos(angle) * radius,
                y: Math.sin(angle) * radius,
                z: (Math.random() - 0.5) * 400, // Spread along Z-axis
                speed: Math.random() * 0.5 + 0.2, // Base speed
                color: new THREE.Color(colors[Math.floor(Math.random() * colors.length)]),
                length: Math.random() * 5 + 2 // Streak length
            });
        }
        return temp;
    }, [count]);

    useFrame((state) => {
        if (!meshRef.current) return;

        // Base speed accelerates massively as 'progress' goes from 0 to 1
        const speedMultiplier = 1 + (progress * 50);

        particles.forEach((p, i) => {
            // Move particle towards camera
            p.z += p.speed * speedMultiplier;

            // Reset if it passes the camera
            if (p.z > 20) {
                p.z = -200;
                // Randomize xy slightly on reset for variation
                const angle = Math.random() * Math.PI * 2;
                const radius = 10 + Math.random() * 20;
                p.x = Math.cos(angle) * radius;
                p.y = Math.sin(angle) * radius;
            }

            // Update dummy object position
            dummy.position.set(p.x, p.y, p.z);

            // Stretch the particle based on speed to look like a light streak
            // As speed increases, scale Z increases
            dummy.scale.set(0.1, 0.1, p.length * (1 + progress * 5));

            dummy.updateMatrix();
            meshRef.current.setMatrixAt(i, dummy.matrix);

            // Set color for this instance
            meshRef.current.setColorAt(i, p.color);
        });

        meshRef.current.instanceMatrix.needsUpdate = true;
        if (meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true;
    });

    return (
        <instancedMesh ref={meshRef} args={[null, null, count]}>
            <boxGeometry args={[1, 1, 1]} />
            <meshBasicMaterial
                toneMapped={false}
                transparent
                opacity={0.8}
            />
        </instancedMesh>
    );
};

// --- MAIN COMPONENT ---
export default function HyperLaunch({ onComplete }) {
    const [progress, setProgress] = useState(0);
    const [status, setStatus] = useState("IDENTITY VERIFIED");

    const containerRef = useRef(null);
    const cameraRef = useRef(null);

    useEffect(() => {
        console.log("HYPERLAUNCH SEQUENCE MOUNTED");
        const ctx = gsap.context(() => {
            const tl = gsap.timeline({
                onComplete: () => {
                    // Flash white and unmount
                    gsap.to(containerRef.current, { opacity: 0, duration: 0.2, onComplete });
                }
            });

            // PHASE 1: SPOOL UP (0s - 1.5s)
            // Initial slow movement, UI bars fill
            tl.to(".loading-bar", { width: "30%", duration: 1.5, ease: "power2.out" })
                .to({}, { duration: 1.5, onUpdate: function () { setProgress(this.progress() * 0.1) } }, "<") // Slow drift

                // PHASE 2: ENGAGE HYPERDRIVE (1.5s - 3.5s)
                // Camera shakes, particles stretch into lines
                .call(() => setStatus("INITIATING HYPER-JUMP..."))
                .to(".loading-bar", { width: "80%", duration: 2, ease: "expo.in" })
                .to({}, { duration: 2, onUpdate: function () { setProgress(0.1 + this.progress() * 0.8) } }, "<") // Rapid accel

                // PHASE 3: BREAKTHROUGH (3.5s - 4s)
                // Max speed, "Tunnel Vision" effect
                .call(() => setStatus("ARRIVAL IMMINENT"))
                .to(".loading-bar", { width: "100%", duration: 0.5, ease: "linear" })
                .to({}, { duration: 0.5, onUpdate: function () { setProgress(0.9 + this.progress() * 0.1) } }, "<")

                // PHASE 4: WHITE OUT (Impact)
                .to(".white-flash", { opacity: 1, duration: 0.1, ease: "power4.in" }, "-=0.1")

        }, containerRef);

        return () => ctx.revert();
    }, [onComplete]);

    return (
        <div ref={containerRef} className="fixed inset-0 z-[9999] bg-[#050505] cursor-none overflow-hidden font-sans">

            {/* 3D CANVAS */}
            <div className="absolute inset-0 z-0">
                <Canvas>
                    <PerspectiveCamera ref={cameraRef} makeDefault position={[0, 0, 0]} fov={75} />
                    <color attach="background" args={['#050505']} />

                    {/* Tunnel Effect */}
                    <WarpTunnel progress={progress} />

                    {/* Background Elements for depth */}
                    <Stars radius={300} depth={50} count={5000} factor={4} saturation={0} fade speed={5} />
                </Canvas>
            </div>

            {/* MINIMALIST HUD UI */}
            <div className="absolute inset-0 z-10 flex flex-col justify-between p-12 pointer-events-none mix-blend-screen">

                {/* Top Corners */}
                <div className="flex justify-between w-full opacity-80">
                    <div className="flex gap-2 items-center text-[10px] tracking-[0.2em] text-[#00F0FF]">
                        <Hexagon className="w-4 h-4 animate-spin-slow" /> SYSTEM_WARP
                    </div>
                    <div className="text-[10px] tracking-[0.2em] text-white">
                        V.4.0.2 // STABLE
                    </div>
                </div>

                {/* Center Content */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full text-center">
                    {/* Reticle - Helps focus the eye in the center of the tunnel */}
                    <div className="w-[300px] h-[300px] border border-white/10 rounded-full absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-ping-slow" />
                    <div className="w-[50px] h-[50px] border-2 border-[#FF003C] rounded-full absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />

                    <div className="relative mt-[200px]">
                        <h2 className="text-white text-xs font-bold tracking-[0.5em] mb-4 animate-pulse text-shadow-glow">
                            {status}
                        </h2>

                        {/* Sexy Slim Loading Bar */}
                        <div className="w-64 h-[2px] bg-white/10 mx-auto overflow-hidden relative">
                            <div className="loading-bar absolute top-0 left-0 h-full w-0 bg-[#00F0FF] shadow-[0_0_15px_#00F0FF]" />
                        </div>
                    </div>
                </div>

                {/* Bottom Corners */}
                <div className="flex justify-between w-full opacity-80 items-end">
                    <div className="text-[10px] text-white font-mono">
                        VEL: {Math.round(progress * 299792)} KM/S<br />
                        DIST: CACHE_CLEARED
                    </div>
                    <div className="flex gap-2 text-[#FF003C]">
                        <Zap className="w-4 h-4" />
                        <Aperture className="w-4 h-4 animate-spin" />
                    </div>
                </div>
            </div>

            {/* IMPACT FLASH */}
            <div className="white-flash absolute inset-0 bg-white opacity-0 z-50 pointer-events-none" />

            {/* CSS ANIMATIONS */}
            <style>{`
                @keyframes spin-slow { 100% { transform: rotate(360deg); } }
                @keyframes ping-slow { 
                    0% { transform: translate(-50%, -50%) scale(0.8); opacity: 0.5; }
                    100% { transform: translate(-50%, -50%) scale(1.5); opacity: 0; }
                }
                .animate-spin-slow { animation: spin-slow 4s linear infinite; }
                .animate-ping-slow { animation: ping-slow 2s cubic-bezier(0, 0, 0.2, 1) infinite; }
                .text-shadow-glow { text-shadow: 0 0 10px rgba(0, 240, 255, 0.7); }
            `}</style>
        </div>
    );
}
