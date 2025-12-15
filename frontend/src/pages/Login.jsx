import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { gsap } from 'gsap';
import { ArrowLeft, User, Lock, ArrowRight, AlertCircle, Crosshair, Shield, Hexagon, Palette } from 'lucide-react';
import axios from 'axios';

import { useAudio } from '../context/AudioContext';
import { useTheme } from '../context/ThemeContext';
import EntrySequence from '../components/EntrySequence';

export default function Login() {
    const { playLoginSuccess } = useAudio();
    const { theme, cycleTheme } = useTheme();
    const navigate = useNavigate();
    const containerRef = useRef(null);
    const formRef = useRef(null);

    const [formData, setFormData] = useState({ username: '', password: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showEntry, setShowEntry] = useState(false);

    useEffect(() => {
        // HUD Entry Animation
        const tl = gsap.timeline();

        // Scanline effect
        gsap.to(".scanline", {
            y: "100%",
            duration: 2,
            repeat: -1,
            ease: "linear"
        });

        tl.fromTo(containerRef.current,
            { opacity: 0 },
            { opacity: 1, duration: 0.5 }
        )
            .fromTo(formRef.current,
                { scale: 0.9, opacity: 0, clipPath: "polygon(0 0, 100% 0, 100% 0, 0 0)" },
                { scale: 1, opacity: 1, clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%)", duration: 0.8, ease: "power4.out" }
            )
            .fromTo(".hud-item",
                { x: -20, opacity: 0 },
                { x: 0, opacity: 1, stagger: 0.1, duration: 0.5, ease: "power2.out" }
            );

    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        if (error) setError('');
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await axios.post('/api/auth/login', formData, {
                headers: { 'Content-Type': 'application/json' }
            });

            if (response.status === 200) {
                // Success - Store Session
                localStorage.setItem('username', response.data.username);
                playLoginSuccess();

                console.log("LOGIN SUCCESS. Triggering Glitch...");

                // SAFETY FALLBACK: If GSAP fails, force entry after 500ms
                const fallbackTimer = setTimeout(() => {
                    console.warn("GSAP stalled. Forcing Entry Sequence.");
                    setShowEntry(true);
                }, 500);

                // Glitch out
                gsap.to(formRef.current, {
                    skewX: 20,
                    opacity: 0,
                    duration: 0.3,
                    onStart: () => console.log("Glitch Started"),
                    onComplete: () => {
                        console.log("Glitch Complete. Showing Entry.");
                        clearTimeout(fallbackTimer);
                        setShowEntry(true);
                    }
                });
            }
        } catch (err) {
            console.error("Login failed:", err);
            setError('ACCESS DENIED. CHECK CREDENTIALS.');

            // Error Shake
            gsap.to(formRef.current, { x: [-10, 10, -10, 10, 0], duration: 0.2, ease: "rough" });
        } finally {
            setLoading(false);
        }
    };

    if (showEntry) {
        return <EntrySequence onComplete={() => navigate('/dashboard')} />;
    }

    return (
        <div ref={containerRef} className="min-h-screen bg-game-dark text-game-white flex items-center justify-center relative overflow-hidden p-6 font-sans">

            {/* Background Grid */}
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 pointer-events-none" />
            <div className="absolute inset-0 z-0 bg-grid-pattern opacity-20"
                style={{ backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px)`, backgroundSize: "40px 40px" }}
            />

            {/* Scanning Line */}
            <div className="scanline absolute top-0 left-0 w-full h-2 bg-game-red/20 blur pointer-events-none z-10 opactiy-50" />

            {/* Top Bar */}
            <div className="absolute top-8 left-8 right-8 flex justify-between items-center z-50">
                <Link to="/" className="flex items-center gap-2 text-game-gray hover:text-game-red transition-colors font-mono uppercase tracking-widest text-xs group">
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    Return to Base
                </Link>

                <button
                    onClick={cycleTheme}
                    className="text-game-gray hover:text-game-red transition-colors"
                    title={`Theme: ${theme.name}`}
                >
                    <Palette className="w-6 h-6" />
                </button>
            </div>

            {/* Login HUD */}
            <div ref={formRef} className="relative z-20 w-full max-w-md bg-game-surface border border-game-border p-10 md:p-12 shadow-2xl backdrop-blur-sm clip-path-hud">

                {/* HUD Corners */}
                <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-game-red" />
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-game-red" />
                <div className="absolute top-0 right-0 w-20 h-1 bg-white/10" />

                <div className="hud-item mb-10 text-center relative">
                    <div className="inline-flex items-center justify-center w-16 h-16 mb-6 relative">
                        <Hexagon className="w-full h-full text-white/5 absolute animate-spin-slow" />
                        <Shield className="w-8 h-8 text-game-red relative z-10" />
                    </div>
                    <h2 className="text-3xl font-black uppercase tracking-tighter text-game-white">
                        Agent <span className="text-transparent bg-clip-text bg-gradient-to-r from-game-red to-game-yellow">Login</span>
                    </h2>
                    <p className="text-game-gray font-mono text-xs mt-3 tracking-widest">SECURE CONNECTION REQUIRED</p>
                </div>

                {error && (
                    <div className="hud-item mb-6 p-3 bg-red-500/10 border-l-4 border-red-500 flex items-center gap-3 text-red-400 text-xs font-mono tracking-wide">
                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="hud-item space-y-1 group">
                        <label className="text-[10px] font-bold text-game-gray uppercase tracking-[0.2em] group-focus-within:text-game-red transition-colors">Identify</label>
                        <div className="relative">
                            <input
                                type="text"
                                name="username"
                                value={formData.username}
                                onChange={handleChange}
                                className="w-full bg-game-input border border-game-border py-4 px-4 text-game-white placeholder-gray-500 outline-none focus:border-game-red focus:bg-game-surface transition-all font-mono text-sm clip-path-input"
                                placeholder="USERNAME_ID"
                                required
                            />
                            <div className="absolute right-0 top-0 h-full w-1 bg-game-red scale-y-0 group-focus-within:scale-y-100 transition-transform origin-bottom duration-300" />
                        </div>
                    </div>

                    <div className="hud-item space-y-1 group">
                        <div className="flex justify-between items-end">
                            <label className="text-[10px] font-bold text-game-gray uppercase tracking-[0.2em] group-focus-within:text-game-red transition-colors">Passcode</label>
                            <a href="#" className="hidden text-[10px] text-game-yellow hover:underline font-mono">RECOVER?</a>
                        </div>
                        <div className="relative">
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                className="w-full bg-game-input border border-game-border py-4 px-4 text-game-white placeholder-gray-500 outline-none focus:border-game-red focus:bg-game-surface transition-all font-mono text-sm clip-path-input"
                                placeholder="••••••••"
                                required
                            />
                            <div className="absolute right-0 top-0 h-full w-1 bg-game-red scale-y-0 group-focus-within:scale-y-100 transition-transform origin-bottom duration-300" />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="hud-item w-full py-4 mt-4 bg-white text-black font-black uppercase tracking-widest hover:bg-game-red hover:text-white transition-all clip-path-slant relative overflow-hidden group disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <span className="relative z-10 flex items-center justify-center gap-2">
                            {loading ? "AUTHENTICATING..." : "ENTER SYSTEM"}
                            {!loading && <ArrowRight className="w-4 h-4" />}
                        </span>
                        <div className="absolute inset-0 bg-black/10 translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-300" />
                    </button>

                </form>

                <div className="hud-item mt-8 text-center border-t border-game-border pt-6">
                    <p className="text-xs text-game-gray font-mono">
                        NO CREDENTIALS?{' '}
                        <Link to="/signup" className="text-game-white font-bold hover:text-game-yellow transition-colors tracking-wider decoration-game-yellow underline underline-offset-4">
                            INITIATE REGISTRATION
                        </Link>
                    </p>
                </div>
            </div>

            <style>{`
                .clip-path-hud {
                    clip-path: polygon(
                        20px 0, 100% 0, 
                        100% calc(100% - 20px), calc(100% - 20px) 100%, 
                        0 100%, 0 20px
                    );
                }
                .clip-path-input {
                     clip-path: polygon(0 0, 100% 0, 100% 85%, 98% 100%, 0 100%);
                }
                 .clip-path-slant {
                    clip-path: polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px);
                }
            `}</style>
        </div>
    );
}
