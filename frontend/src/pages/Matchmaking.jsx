import React, { useState, useRef, useLayoutEffect, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { gsap } from 'gsap';
// --- 3D IMPORTS ---
import { Canvas } from '@react-three/fiber';
import { Stars, Sparkles, Environment } from '@react-three/drei';
// ------------------
import { useAudio } from '../context/AudioContext';
import { useTheme } from '../context/ThemeContext';
import {
    Radio,
    Search,
    Users,
    Clock,
    Zap,
    LayoutDashboard,
    Gamepad2,
    Sword,
    Trophy,
    Target,
    MessageSquare,
    LogOut,
    Crosshair,
    Volume2,
    VolumeX,
    Palette
} from 'lucide-react';

// --- COMPONENT: 3D BACKGROUND (Digital Void) ---
const Background3D = ({ colors }) => {
    return (
        <div className="absolute inset-0 z-0 pointer-events-none">
            <Canvas camera={{ position: [0, 0, 1] }}>
                <color attach="background" args={[colors['--bg-core']]} />
                <fog attach="fog" args={[colors['--bg-core'], 5, 20]} />
                <Stars radius={50} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
                <Sparkles count={50} scale={[12, 12, 10]} size={6} speed={0.4} opacity={0.5} color={colors['--primary']} />
                <Sparkles count={100} scale={[20, 20, 10]} size={2} speed={0.2} opacity={0.2} color={colors['--secondary']} />
                <Environment preset="night" />
            </Canvas>
        </div>
    );
};

export default function Matchmaking() {
    const { playHover, startBGM, stopBGM, toggleMute, isMuted } = useAudio();
    const { theme, cycleTheme } = useTheme();
    const navigate = useNavigate();
    const mainRef = useRef(null);
    const cursorRef = useRef(null);
    const [searching, setSearching] = useState(false);
    const [timer, setTimer] = useState(0);

    useEffect(() => {
        // Start Epic Cinematic BGM on entry
        startBGM('/assets/audio/matchmaking.mp3');
        return () => {
            stopBGM();
        };
    }, []);

    const startQueue = () => {
        setSearching(true);
        let t = 0;
        const interval = setInterval(() => {
            t += 1;
            setTimer(t);
            // Mock Match Found after 5s (You can replace this logic later)
            if (t > 4) {
                clearInterval(interval);
                alert("MATCH FOUND! (Connecting to Game Server...)");
                setSearching(false);
                setTimer(0);
                // navigate('/games/snake'); // Example redirection
            }
        }, 1000);

        // Radar Spinner Animation
        gsap.to(".radar-spin", { rotation: 360, repeat: -1, duration: 2, ease: "linear" });
    };

    const formatTime = (s) => {
        const min = Math.floor(s / 60);
        const sec = s % 60;
        return `${min}:${sec < 10 ? '0' : ''}${sec}`;
    };

    // Custom Cursor & Animations
    useLayoutEffect(() => {
        const cursor = cursorRef.current;
        const moveCursor = (e) => {
            gsap.to(cursor, { x: e.clientX, y: e.clientY, duration: 0.1, ease: 'power2.out' });
        };
        const scaleUp = () => gsap.to(cursor, { scale: 2, borderColor: theme.colors['--secondary'], ease: 'elastic.out' });
        const scaleDown = () => gsap.to(cursor, { scale: 1, borderColor: theme.colors['--primary'], ease: 'power2.out' });

        window.addEventListener('mousemove', moveCursor);
        document.querySelectorAll('a, button').forEach(el => {
            el.addEventListener('mouseenter', scaleUp);
            el.addEventListener('mouseleave', scaleDown);
        });

        const ctx = gsap.context(() => {
            // Sidebar Entrance
            gsap.from('.hud-element', {
                x: -20,
                opacity: 0,
                duration: 1.2,
                stagger: 0.1,
                ease: 'power3.out'
            });

            // Content Entrance
            gsap.from('.matchmaking-content', {
                scale: 0.9,
                opacity: 0,
                duration: 0.8,
                ease: 'back.out(1.7)',
                delay: 0.5
            });

        }, mainRef);

        return () => {
            ctx.revert();
            window.removeEventListener('mousemove', moveCursor);
            document.querySelectorAll('a, button').forEach(el => {
                el.removeEventListener('mouseenter', scaleUp);
                el.removeEventListener('mouseleave', scaleDown);
            });
        };
    }, [theme]);

    const handleLogout = () => navigate('/login');

    return (
        <div ref={mainRef} className="min-h-screen bg-game-dark text-game-white font-sans overflow-hidden flex cursor-none selection:bg-game-red selection:text-black relative">

            {/* --- 3D BACKGROUND --- */}
            <Background3D colors={theme.colors} />

            {/* CROSSHAIR CURSOR */}
            <div ref={cursorRef} className="fixed top-0 left-0 w-8 h-8 pointer-events-none z-[9999] -translate-x-1/2 -translate-y-1/2 border-2 border-game-red bg-transparent rounded-full mix-blend-difference flex items-center justify-center">
                <div className="w-1 h-1 bg-game-red rounded-full" />
            </div>

            {/* SIDEBAR HUD */}
            <aside className="w-24 border-r border-game-border flex flex-col items-center py-10 z-20 bg-game-surface backdrop-blur-md relative">
                <div className="absolute top-0 right-0 w-1 h-full bg-game-red/50 scale-y-0 hover:scale-y-100 transition-transform origin-top" />

                <div className="mb-20 hud-element">
                    <div className="w-12 h-12 border-2 border-game-red flex items-center justify-center relative group cursor-pointer">
                        <div className="absolute inset-0 bg-game-red opacity-0 group-hover:opacity-20 transition-opacity" />
                        <Crosshair className="w-6 h-6 text-game-white group-hover:rotate-90 transition-transform duration-500" />
                    </div>
                </div>

                <nav className="flex-1 flex flex-col gap-10 w-full">
                    {[
                        { icon: LayoutDashboard, path: '/dashboard' },
                        { icon: Gamepad2, path: '/games' },
                        { icon: Sword, path: '/matchmaking' },
                        { icon: Trophy, path: '/leaderboard' },
                        { icon: Target, path: '/reviews' },
                        { icon: Users, path: '/profile' },
                        { icon: MessageSquare, path: '/chat' },
                    ].map((item, i) => (
                        <button
                            key={i}
                            onClick={() => navigate(item.path)}
                            onMouseEnter={playHover}
                            className={`hud-element group relative flex justify-center w-full py-2 hover:bg-white/5 transition-colors ${item.path === '/matchmaking' ? 'border-r-2 border-game-red' : ''}`}
                        >
                            <item.icon className={`w-6 h-6 transition-colors duration-300 ${item.path === '/matchmaking' ? 'text-game-red' : 'text-game-gray group-hover:text-game-white'}`} />
                            {item.path !== '/matchmaking' && <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-1 bg-game-yellow rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />}
                        </button>
                    ))}
                </nav>

                <button
                    onClick={cycleTheme}
                    className="hud-element mb-6 text-game-gray hover:text-game-red transition-colors"
                    title={`Current Theme: ${theme.name}`}
                >
                    <Palette className="w-6 h-6" />
                </button>

                <button
                    onClick={toggleMute}
                    className="hud-element mb-6 text-game-gray hover:text-game-red transition-colors"
                    title={isMuted ? "Unmute" : "Mute"}
                >
                    {isMuted ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
                </button>

                <button onClick={handleLogout} onMouseEnter={playHover} className="hud-element mb-10 text-game-gray hover:text-game-red transition-colors">
                    <LogOut className="w-6 h-6" />
                </button>
            </aside>

            {/* MAIN CONTENT */}
            <main className="flex-1 flex flex-col items-center justify-center relative p-6 z-10">

                <div className="matchmaking-content w-full max-w-2xl text-center">

                    <h1 className="text-6xl font-black uppercase tracking-tighter mb-2 italic">
                        Ranked <span className="text-game-red">Queue</span>
                    </h1>
                    <p className="text-game-gray font-mono mb-12 flex items-center justify-center gap-2">
                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" /> SERVER: US-EAST-1 // TICK: 128
                    </p>

                    {/* RADAR UI */}
                    <div className="w-64 h-64 mx-auto bg-game-surface border border-white/20 rounded-full relative flex items-center justify-center mb-12 backdrop-blur-md shadow-[0_0_50px_rgba(255,70,85,0.2)]">
                        {searching && (
                            <>
                                <div className="radar-spin absolute inset-0 border-t-2 border-game-red rounded-full opacity-50" />
                                <div className="radar-spin absolute inset-2 border-r-2 border-game-yellow rounded-full opacity-30 animation-delay-500" />
                                <div className="absolute w-full h-1 bg-gradient-to-r from-transparent via-game-red to-transparent opacity-20 animate-pulse" />
                            </>
                        )}

                        <div className="text-center z-10">
                            {searching ? (
                                <>
                                    <div className="text-4xl font-mono font-bold animate-pulse text-white">{formatTime(timer)}</div>
                                    <div className="text-[10px] uppercase tracking-widest text-game-red mt-2 animate-bounce">Searching...</div>
                                </>
                            ) : (
                                <Zap className="w-16 h-16 text-white/20" />
                            )}
                        </div>
                    </div>

                    <button
                        onClick={startQueue}
                        disabled={searching}
                        onMouseEnter={playHover}
                        className={`px-12 py-6 bg-game-white text-black font-black text-2xl uppercase tracking-widest clip-path-slant transition-all hover:scale-105 active:scale-95 ${searching ? 'opacity-50 cursor-not-allowed bg-gray-500' : 'hover:bg-game-red hover:text-white hover:shadow-[0_0_30px_rgba(255,70,85,0.6)]'}`}
                    >
                        {searching ? "In Queue" : "Find Match"}
                    </button>

                    <div className="mt-16 grid grid-cols-3 gap-4 text-xs font-mono text-game-gray border-t border-white/10 pt-8">
                        <div className="flex flex-col items-center gap-2">
                            <Users className="w-5 h-5 text-game-red" />
                            <span>12,402 ONLINE</span>
                        </div>
                        <div className="flex flex-col items-center gap-2">
                            <Clock className="w-5 h-5 text-game-yellow" />
                            <span>EST. WAIT: 0:45</span>
                        </div>
                        <div className="flex flex-col items-center gap-2">
                            <Radio className="w-5 h-5 text-green-400" />
                            <span>PING: 14ms</span>
                        </div>
                    </div>

                </div>
            </main>

            <style>{`
                .clip-path-slant { clip-path: polygon(10% 0, 100% 0, 100% 70%, 90% 100%, 0 100%, 0 30%); }
            `}</style>
        </div>
    );
}