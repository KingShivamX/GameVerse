import React, { useEffect, useRef, useState, useLayoutEffect } from 'react';
import axios from 'axios';
import { gsap } from 'gsap';
import { useNavigate } from 'react-router-dom';
// --- 3D IMPORTS ---
import { Canvas } from '@react-three/fiber';
import { Stars, Sparkles, Environment } from '@react-three/drei';
// ------------------
import { useTheme } from '../context/ThemeContext';
import {
    User,
    Shield,
    Target,
    Edit3,
    Save,
    Hexagon,
    LayoutDashboard,
    Gamepad2,
    Sword,
    Trophy,
    MessageSquare,
    Users,
    LogOut,
    Crosshair,
    Activity,
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

export default function Profile() {
    const navigate = useNavigate();
    const { theme, cycleTheme } = useTheme();
    const mainRef = useRef(null);
    const cursorRef = useRef(null);

    // State
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [user, setUser] = useState({
        username: 'Agent',
        rankBadge: 'Unranked',
        bio: 'No bio available.',
        wins: 0,
        losses: 0,
        winRate: '0%',
        totalXp: 0,
        snakeHighScore: 0
    });
    const [matches, setMatches] = useState([]);

    // --- DATA FETCHING ---
    useEffect(() => {
        const fetchData = async () => {
            const username = localStorage.getItem('username');
            if (!username) {
                navigate('/login');
                return;
            }

            try {
                // Parallel Fetching
                const [statsRes, matchesRes] = await Promise.allSettled([
                    axios.get(`/api/users/${username}/stats`),
                    axios.get(`/api/matches/user/${username}`)
                ]);

                // Handle Stats
                if (statsRes.status === 'fulfilled') {
                    setUser(prev => ({ ...prev, ...statsRes.value.data }));
                }

                // Handle Matches
                if (matchesRes.status === 'fulfilled') {
                    setMatches(matchesRes.value.data);
                } else {
                    // Start with empty or mock if failed
                    console.warn("Could not fetch match history");
                }

                setLoading(false);
            } catch (err) {
                console.error("Profile data fetch error", err);
                setLoading(false);
            }
        };

        fetchData();
    }, [navigate]);

    // --- ANIMATIONS & CURSOR ---
    useLayoutEffect(() => {
        if (loading) return;

        const cursor = cursorRef.current;
        const moveCursor = (e) => {
            gsap.to(cursor, { x: e.clientX, y: e.clientY, duration: 0.1, ease: 'power2.out' });
        };
        const scaleUp = () => gsap.to(cursor, { scale: 2, borderColor: theme.colors['--secondary'], ease: 'elastic.out' });
        const scaleDown = () => gsap.to(cursor, { scale: 1, borderColor: theme.colors['--primary'], ease: 'power2.out' });

        window.addEventListener('mousemove', moveCursor);

        // Interactive Elements
        setTimeout(() => {
            document.querySelectorAll('button, a, .interactive-card').forEach(el => {
                el.addEventListener('mouseenter', scaleUp);
                el.addEventListener('mouseleave', scaleDown);
            });
        }, 100);

        const ctx = gsap.context(() => {
            // Sidebar Entrance
            gsap.from('.hud-element', {
                x: -20,
                opacity: 0,
                duration: 1.2,
                stagger: 0.1,
                ease: 'power3.out'
            });

            // Card Entrance
            gsap.from('.profile-card', {
                y: 50,
                opacity: 0,
                duration: 0.8,
                stagger: 0.2,
                ease: 'back.out(1.7)',
                delay: 0.2
            });

        }, mainRef);

        return () => {
            ctx.revert();
            window.removeEventListener('mousemove', moveCursor);
            document.querySelectorAll('button, a, .interactive-card').forEach(el => {
                el.removeEventListener('mouseenter', scaleUp);
                el.removeEventListener('mouseleave', scaleDown);
            });
        };
    }, [loading, theme]);

    const handleLogout = () => navigate('/login');

    const toggleEdit = async () => {
        if (isEditing) {
            // Save logic
            try {
                const username = localStorage.getItem('username');
                await axios.put(`/api/users/${username}/bio`, { bio: user.bio });
                // Optional: Play success sound if context available
                setIsEditing(false);
            } catch (err) {
                console.error("Failed to save bio", err);
                alert("Failed to save bio. Please try again.");
            }
        } else {
            setIsEditing(true);
        }
    };

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
                            className={`hud-element group relative flex justify-center w-full py-2 hover:bg-white/5 transition-colors ${item.path === '/profile' ? 'border-r-2 border-game-red' : ''}`}
                        >
                            <item.icon className={`w-6 h-6 transition-colors duration-300 ${item.path === '/profile' ? 'text-game-red' : 'text-game-gray group-hover:text-game-white'}`} />
                            {item.path !== '/profile' && <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-1 bg-game-yellow rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />}
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

                <button onClick={handleLogout} className="hud-element mb-10 text-game-gray hover:text-game-red transition-colors">
                    <LogOut className="w-6 h-6" />
                </button>
            </aside>

            {/* MAIN CONTENT */}
            <main className="flex-1 relative overflow-y-auto p-10 lg:p-20 z-10 scrollbar-hide">
                <div className="max-w-6xl mx-auto grid lg:grid-cols-12 gap-8">

                    {/* ID CARD */}
                    <div className="lg:col-span-4 profile-card bg-game-surface backdrop-blur-md border border-white/10 p-8 relative overflow-visible clip-path-hud shadow-[0_0_50px_rgba(0,0,0,0.5)]">
                        <div className="absolute top-0 right-0 p-2 text-game-yellow text-xs font-mono tracking-widest bg-black/40">ID_VERIFIED</div>

                        <div className="flex flex-col items-center text-center">
                            <div className="w-32 h-32 relative mb-6 group cursor-pointer">
                                <Hexagon className="w-full h-full text-game-red absolute animate-spin-slow opacity-20 group-hover:opacity-100 transition-opacity duration-700" />
                                <div className="w-full h-full rounded-full border-4 border-game-red flex items-center justify-center bg-black/50 overflow-hidden relative z-10">
                                    <User className="w-16 h-16 text-game-white" />
                                </div>
                            </div>

                            <h1 className="text-3xl font-black uppercase tracking-tighter mb-2">{user.username}</h1>
                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-game-red/10 border border-game-red/30 rounded text-game-red text-sm font-bold uppercase tracking-widest mb-6">
                                <Shield className="w-4 h-4" /> {user.rankBadge || 'Unranked'}
                            </div>

                            <div className="w-full space-y-4 text-left">
                                <div className="group">
                                    <label className="text-[10px] text-game-dim uppercase tracking-widest font-bold">Bio</label>
                                    {isEditing ? (
                                        <textarea
                                            className="w-full bg-black/30 border border-white/10 p-2 text-sm text-game-white focus:border-game-yellow outline-none h-24 resize-none font-mono"
                                            value={user.bio}
                                            onChange={(e) => setUser({ ...user, bio: e.target.value })}
                                        />
                                    ) : (
                                        <p className="text-sm text-gray-300 leading-relaxed border-l-2 border-white/10 pl-3 font-mono">{user.bio}</p>
                                    )}
                                </div>
                            </div>

                            <button onClick={toggleEdit} className="mt-8 w-full py-3 flex items-center justify-center gap-2 border border-white/20 hover:bg-game-red hover:text-white hover:border-game-red transition-all uppercase font-bold text-xs tracking-widest">
                                {isEditing ? <><Save className="w-4 h-4" /> Save Stats</> : <><Edit3 className="w-4 h-4" /> Edit Profile</>}
                            </button>
                        </div>
                    </div>

                    {/* STATS GRID */}
                    <div className="lg:col-span-8 space-y-8">
                        <div className="profile-card">
                            <h2 className="text-2xl font-black uppercase flex items-center gap-3 mb-6">
                                <Target className="text-game-yellow" /> Performance Analytics
                            </h2>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {[
                                    { label: 'Victory Rate', value: `${user.winRate}%` || '0%', color: 'text-game-yellow' },
                                    { label: 'Total Wins', value: user.wins, color: 'text-green-400' },
                                    { label: 'Total Losses', value: user.losses, color: 'text-red-400' },
                                ].map((stat, i) => (
                                    <div key={i} className="bg-game-surface backdrop-blur-md border border-white/10 p-6 relative group hover:border-game-red/50 transition-colors interactive-card">
                                        <div className="text-4xl font-black mb-2 font-mono group-hover:scale-105 transition-transform origin-left text-game-white">{stat.value}</div>
                                        <div className={`text-xs uppercase tracking-widest font-bold ${stat.color}`}>{stat.label}</div>
                                        <div className="absolute bottom-0 right-0 w-8 h-8 opacity-10 bg-white clip-path-triangle" />
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* RECENT MATCHES */}
                        <div className="profile-card bg-game-surface backdrop-blur-md border border-white/10 p-6 relative">
                            <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-game-red to-transparent" />
                            <h3 className="text-xs text-game-dim uppercase tracking-widest font-bold mb-6 flex items-center gap-2">
                                <Activity className="w-4 h-4" /> Recent Operations
                            </h3>

                            <div className="space-y-2 max-h-[300px] overflow-y-auto scrollbar-hide">
                                {matches.length > 0 ? (
                                    matches.map((match) => (
                                        <div key={match.id} className="flex items-center justify-between p-4 bg-black/20 hover:bg-white/5 cursor-pointer border-l-2 border-transparent hover:border-game-yellow transition-all interactive-card group">
                                            <div className="flex items-center gap-4">
                                                <div className={`w-2 h-2 rounded-full ${match.result === 'WIN' ? 'bg-green-500' : match.result === 'LOSS' ? 'bg-red-500' : 'bg-gray-500'} group-hover:scale-150 transition-transform`} />
                                                <span className="font-bold uppercase text-sm group-hover:text-game-white transition-colors">{match.game || 'Unknown Game'}</span>
                                            </div>
                                            <div className="font-mono text-sm text-game-dim">Score: {match.score}</div>
                                            <div className={`font-bold text-sm ${match.result === 'WIN' ? 'text-green-400' : match.result === 'LOSS' ? 'text-red-400' : 'text-game-dim'}`}>
                                                {match.result}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-8 text-game-dim font-mono text-sm">
                                        NO RECENT COMBAT RECORDS FOUND
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                </div>
            </main>

            <style>{`
                .clip-path-hud { clip-path: polygon(0 0, 100% 0, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0 100%); }
                .clip-path-triangle { clip-path: polygon(100% 0, 0 100%, 100% 100%); }
                .animate-spin-slow { animation: spin 10s linear infinite; }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                .scrollbar-hide::-webkit-scrollbar { display: none; }
            `}</style>
        </div>
    );
}
