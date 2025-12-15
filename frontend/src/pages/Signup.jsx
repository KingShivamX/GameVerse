import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { gsap } from 'gsap';
import { ArrowLeft, User, Lock, Mail, ArrowRight, AlertCircle, Cpu, Hexagon, Palette } from 'lucide-react';
import axios from 'axios';
import { useTheme } from '../context/ThemeContext';

export default function Signup() {
    const navigate = useNavigate();
    const { theme, cycleTheme } = useTheme();
    const containerRef = useRef(null);
    const formRef = useRef(null);

    // Form State
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        // HUD Entry Animation
        const tl = gsap.timeline();

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
                { x: 0, opacity: 1, stagger: 0.08, duration: 0.5, ease: "power2.out" }
            );

    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        if (error) setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.password !== formData.confirmPassword) {
            setError("PASSPHRASE MISMATCH");
            // Error Shake
            gsap.to(formRef.current, { x: [-5, 5, -5, 5, 0], duration: 0.2, ease: "rough" });
            return;
        }

        setLoading(true);
        setError('');

        try {
            const { confirmPassword, ...signupData } = formData;

            const response = await axios.post('/api/auth/signup', signupData, {
                headers: { 'Content-Type': 'application/json' }
            });

            if (response.status === 200 || response.status === 201) {
                // Success - Glitch out
                gsap.to(formRef.current, {
                    skewX: -20,
                    opacity: 0,
                    duration: 0.3,
                    onComplete: () => navigate('/login')
                });
            }
        } catch (err) {
            console.error("Signup failed:", err);
            setError('REGISTRATION FAILED. IDENTITY TAKEN.');

            // Error Shake
            gsap.to(formRef.current, { x: [-10, 10, -10, 10, 0], duration: 0.2, ease: "rough" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div ref={containerRef} className="min-h-screen bg-game-dark text-game-white flex items-center justify-center relative overflow-hidden p-6 font-sans">

            {/* Background Grid */}
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 pointer-events-none" />
            <div className="absolute inset-0 z-0 bg-grid-pattern opacity-20"
                style={{ backgroundImage: "linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px)", backgroundSize: "40px 40px" }}
            />

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

            {/* Signup HUD */}
            <div ref={formRef} className="relative z-20 w-full max-w-md bg-game-surface border border-game-border p-10 md:p-12 shadow-2xl backdrop-blur-sm clip-path-hud">

                {/* HUD Corners */}
                <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-game-yellow" />
                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-game-yellow" />

                <div className="hud-item mb-10 text-center relative">
                    <div className="inline-flex items-center justify-center w-16 h-16 mb-4 relative">
                        <Hexagon className="w-full h-full text-game-white/5 absolute animate-spin-reverse-slow" />
                        <Cpu className="w-8 h-8 text-game-yellow relative z-10" />
                    </div>
                    <h2 className="text-3xl font-black uppercase tracking-tighter text-game-white">
                        New <span className="text-transparent bg-clip-text bg-gradient-to-l from-game-red to-game-yellow">Recruit</span>
                    </h2>
                    <p className="text-game-gray font-mono text-xs mt-3 tracking-widest">INITIALIZING PROFILE CREATION</p>
                </div>

                {error && (
                    <div className="hud-item mb-6 p-3 bg-red-500/10 border-l-4 border-red-500 flex items-center gap-3 text-red-400 text-xs font-mono tracking-wide">
                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">

                    <div className="hud-item space-y-1 group">
                        <label className="text-[10px] font-bold text-game-gray uppercase tracking-[0.2em] group-focus-within:text-game-yellow transition-colors">Username</label>
                        <div className="relative">
                            <input
                                type="text"
                                name="username"
                                value={formData.username}
                                onChange={handleChange}
                                className="w-full bg-game-input border border-game-border py-3.5 px-4 text-game-white placeholder-gray-500 outline-none focus:border-game-yellow focus:bg-game-surface transition-all font-mono text-sm clip-path-input"
                                placeholder="CODENAME"
                                required
                            />
                            <div className="absolute right-0 top-0 h-full w-1 bg-game-yellow scale-y-0 group-focus-within:scale-y-100 transition-transform origin-bottom duration-300" />
                        </div>
                    </div>

                    <div className="hud-item space-y-1 group">
                        <label className="text-[10px] font-bold text-game-gray uppercase tracking-[0.2em] group-focus-within:text-game-yellow transition-colors">Digital Mail</label>
                        <div className="relative">
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className="w-full bg-game-input border border-game-border py-3.5 px-4 text-game-white placeholder-gray-500 outline-none focus:border-game-yellow focus:bg-game-surface transition-all font-mono text-sm clip-path-input"
                                placeholder="LINK@SERVER.NET"
                                required
                            />
                            <div className="absolute right-0 top-0 h-full w-1 bg-game-yellow scale-y-0 group-focus-within:scale-y-100 transition-transform origin-bottom duration-300" />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="hud-item space-y-1 group">
                            <label className="text-[10px] font-bold text-game-gray uppercase tracking-[0.2em] group-focus-within:text-game-yellow transition-colors">Passcode</label>
                            <div className="relative">
                                <input
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    className="w-full bg-game-input border border-game-border py-3.5 px-4 text-game-white placeholder-gray-500 outline-none focus:border-game-yellow focus:bg-game-surface transition-all font-mono text-sm clip-path-input"
                                    placeholder="•••••"
                                    required
                                />
                                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-game-yellow scale-x-0 group-focus-within:scale-x-100 transition-transform origin-left duration-300" />
                            </div>
                        </div>

                        <div className="hud-item space-y-1 group">
                            <label className="text-[10px] font-bold text-game-gray uppercase tracking-[0.2em] group-focus-within:text-game-yellow transition-colors">Confirm</label>
                            <div className="relative">
                                <input
                                    type="password"
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    className="w-full bg-game-input border border-game-border py-3.5 px-4 text-game-white placeholder-gray-500 outline-none focus:border-game-yellow focus:bg-game-surface transition-all font-mono text-sm clip-path-input"
                                    placeholder="•••••"
                                    required
                                />
                                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-game-yellow scale-x-0 group-focus-within:scale-x-100 transition-transform origin-left duration-300" />
                            </div>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="hud-item w-full py-4 mt-4 bg-white text-black font-black uppercase tracking-widest hover:bg-game-yellow hover:text-black transition-all clip-path-slant relative overflow-hidden group disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <span className="relative z-10 flex items-center justify-center gap-2">
                            {loading ? "PROCESSING..." : "CONFIRM IDENTITY"}
                            {!loading && <ArrowRight className="w-4 h-4" />}
                        </span>
                        <div className="absolute inset-0 bg-black/10 translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-300" />
                    </button>

                </form>

                <div className="hud-item mt-8 text-center border-t border-white/10 pt-6">
                    <p className="text-xs text-game-gray font-mono">
                        ALREADY OPERATIONAL?{' '}
                        <Link to="/login" className="text-game-white font-bold hover:text-game-red transition-colors tracking-wider decoration-game-red underline underline-offset-4">
                            SYSTEM LOGIN
                        </Link>
                    </p>
                </div>
            </div>

            <style>{`
                .clip-path-hud {
                    clip-path: polygon(
                        0 0, calc(100% - 20px) 0, 100% 20px, 
                        100% 100%, 20px 100%, 0 calc(100% - 20px)
                    );
                }
                .clip-path-input {
                     clip-path: polygon(0 0, 100% 0, 100% 100%, 10px 100%, 0 calc(100% - 10px));
                }
                 .clip-path-slant {
                    clip-path: polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px);
                }
                 @keyframes spin-slow {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                @keyframes spin-reverse-slow {
                    from { transform: rotate(360deg); }
                    to { transform: rotate(0deg); }
                }
                .animate-spin-slow { animation: spin-slow 10s linear infinite; }
                .animate-spin-reverse-slow { animation: spin-reverse-slow 10s linear infinite; }
            `}</style>
        </div>
    );
}
