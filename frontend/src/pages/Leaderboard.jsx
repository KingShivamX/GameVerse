import React, { useEffect, useState, useRef, useLayoutEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { gsap } from 'gsap';
// --- 3D IMPORTS ---
import { Canvas } from '@react-three/fiber';
import { Stars, Sparkles, Environment } from '@react-three/drei';
// ------------------
import { useTheme } from '../context/ThemeContext';
import {
    Trophy,
    Medal,
    Crown,
    LayoutDashboard,
    Users,
    LogOut,
    Sword,
    Target,
    MessageSquare,
    Gamepad2,
    Crosshair,
    Shield,
    Palette
} from 'lucide-react';

// --- COMPONENT: 3D BACKGROUND (FIXED VISIBILITY) ---
const Background3D = ({ colors }) => {
    return (
        // FIXED: z-[-1] ensures it stays behind all content
        <div className="fixed inset-0 z-[-1] pointer-events-none bg-game-dark">
            <Canvas camera={{ position: [0, 0, 1] }} gl={{ alpha: true }}>
                {/* Fog helps blend the stars into the distance */}
                <fog attach="fog" args={[colors['--bg-core'], 5, 20]} />

                <Stars radius={50} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
                <Sparkles count={50} scale={[12, 12, 10]} size={6} speed={0.4} opacity={0.5} color={colors['--primary']} />
                <Sparkles count={100} scale={[20, 20, 10]} size={2} speed={0.2} opacity={0.2} color={colors['--secondary']} />
                <Environment preset="night" />
            </Canvas>
        </div>
    );
};

export default function Leaderboard() {
    const navigate = useNavigate();
    const { theme, cycleTheme } = useTheme();
    const mainRef = useRef(null);
    const cursorRef = useRef(null);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    // --- DATA FETCHING ---
    useEffect(() => {
        axios.get('/api/users/leaderboard')
            .then(res => {
                setUsers(res.data);
                setLoading(false);
            })
            .catch(err => {
                console.error("Leaderboard fetch failed", err);
                // Fallback mock
                const mockUsers = Array.from({ length: 15 }).map((_, i) => ({
                    id: i,
                    username: `AGENT_${100 + i}`,
                    rankBadge: i < 3 ? 'RADIANT' : i < 8 ? 'IMMORTAL' : 'DIAMOND',
                    wins: Math.floor(Math.random() * 50) + 10,
                    losses: Math.floor(Math.random() * 20),
                    snakeHighScore: Math.floor(Math.random() * 5000) + 1000,
                    totalXp: Math.floor(Math.random() * 100000) + 50000,
                    avatarColor: [theme.colors['--primary'], theme.colors['--secondary'], '#00E0B8'][i % 3]
                }));
                setUsers(mockUsers);
                setLoading(false);
            });
    }, [theme]); // Re-generate mock colors on theme change if using mock

    // --- ANIMATIONS & CURSOR ---
    useLayoutEffect(() => {
        if (loading) return;

        const cursor = cursorRef.current;
        const hasCursor = !!cursor;

        const moveCursor = (e) => {
            if (hasCursor) gsap.to(cursor, { x: e.clientX, y: e.clientY, duration: 0.1, ease: 'power2.out' });
        };
        const scaleUp = () => gsap.to(cursor, { scale: 2, borderColor: theme.colors['--secondary'], ease: 'elastic.out' });
        const scaleDown = () => gsap.to(cursor, { scale: 1, borderColor: theme.colors['--primary'], ease: 'power2.out' });

        window.addEventListener('mousemove', moveCursor);
        document.querySelectorAll('button, a').forEach(el => {
            el.addEventListener('mouseenter', scaleUp);
            el.addEventListener('mouseleave', scaleDown);
        });

        const ctx = gsap.context(() => {
            // Sidebar Entrance
            gsap.fromTo('.hud-element',
                { x: -20, opacity: 0 },
                { x: 0, opacity: 1, duration: 1.2, stagger: 0.1, ease: 'power3.out' }
            );

            // Header Entrance
            gsap.fromTo('.header-content',
                { y: -50, opacity: 0 },
                { y: 0, opacity: 1, duration: 1, ease: 'power4.out', delay: 0.2 }
            );

            // Table Rows Stagger (Using fromTo for reliability)
            gsap.fromTo('.leaderboard-row',
                { x: 50, opacity: 0 },
                {
                    x: 0,
                    opacity: 1,
                    duration: 0.6,
                    stagger: 0.05,
                    ease: 'power2.out',
                    delay: 0.5
                }
            );

        }, mainRef);

        return () => {
            ctx.revert();
            window.removeEventListener('mousemove', moveCursor);
            document.querySelectorAll('button, a').forEach(el => {
                el.removeEventListener('mouseenter', scaleUp);
                el.removeEventListener('mouseleave', scaleDown);
            });
        };
    }, [loading, theme]);

    const getWinRate = (user) => {
        const total = (user.wins || 0) + (user.losses || 0);
        return total > 0 ? Math.round((user.wins / total) * 100) + '%' : '0%';
    };

    const handleLogout = () => navigate('/login');

    return (
        <div ref={mainRef} className="min-h-screen bg-game-dark text-game-white font-sans overflow-hidden flex cursor-none selection:bg-game-red selection:text-black relative">

            {/* --- 3D BACKGROUND (Z-Index Fixed) --- */}
            <Background3D colors={theme.colors} />

            {/* CROSSHAIR CURSOR */}
            <div ref={cursorRef} className="fixed top-0 left-0 w-8 h-8 pointer-events-none z-[9999] -translate-x-1/2 -translate-y-1/2 border-2 border-game-red bg-transparent rounded-full mix-blend-difference flex items-center justify-center">
                <div className="w-1 h-1 bg-game-red rounded-full" />
            </div>

            {/* SIDEBAR HUD */}
            <aside className="w-24 border-r border-game-border flex flex-col items-center py-10 z-50 bg-game-surface backdrop-blur-md relative">
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
                            className={`hud-element group relative flex justify-center w-full py-2 hover:bg-white/5 transition-colors ${item.path === '/leaderboard' ? 'border-r-2 border-game-red' : ''}`}
                        >
                            <item.icon className={`w-6 h-6 transition-colors duration-300 ${item.path === '/leaderboard' ? 'text-game-red' : 'text-game-gray group-hover:text-game-white'}`} />
                            {item.path !== '/leaderboard' && <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-1 bg-game-yellow rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />}
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

            {/* MAIN CONTENT (Z-10 ensures it's above background) */}
            <main className="flex-1 relative overflow-y-auto p-10 lg:p-20 z-10 scrollbar-hide">
                <div className="max-w-6xl mx-auto">

                    {/* Header */}
                    <div className="flex items-end justify-between mb-12 border-b border-white/10 pb-6 header-content">
                        <div>
                            <div className="text-xs text-game-red font-mono tracking-[0.2em] mb-2 flex items-center gap-2">
                                <Trophy className="w-4 h-4" /> GLOBAL RANKINGS
                            </div>
                            <h1 className="text-6xl font-black uppercase tracking-tighter mb-2">
                                TOP <span className="text-stroke-primary">AGENTS</span>
                            </h1>
                            <p className="text-game-gray font-mono text-sm">SEASON 4 // EPISODE 2</p>
                        </div>
                        <div className="hidden md:block text-right">
                            <div className="text-2xl font-bold font-mono text-game-yellow">STATUS: ACTIVE</div>
                            <div className="text-xs text-game-gray tracking-widest">UPDATING LIVE</div>
                        </div>
                    </div>

                    {/* Leaderboard Table */}
                    <div className="bg-game-surface backdrop-blur-md border border-white/10 relative overflow-hidden clip-path-slant">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-game-red to-transparent" />

                        {/* Table Header */}
                        <div className="grid grid-cols-12 p-5 text-xs font-bold uppercase tracking-widest text-game-gray border-b border-white/10 bg-black/20">
                            <div className="col-span-1 text-center">#</div>
                            <div className="col-span-4">Agent</div>
                            <div className="col-span-2 text-center">Rank</div>
                            <div className="col-span-1 text-center text-game-yellow">XP</div>
                            <div className="col-span-2 text-center text-game-red">Snake HS</div>
                            <div className="col-span-2 text-center">Win %</div>
                        </div>

                        {/* Table Rows */}
                        <div className="max-h-[60vh] overflow-y-auto">
                            {users.map((user, i) => (
                                <div key={user.id} className="leaderboard-row grid grid-cols-12 p-6 items-center hover:bg-white/5 transition-all duration-300 border-b border-white/5 group cursor-default relative">
                                    {/* Hover Highlight */}
                                    <div className="absolute left-0 top-0 h-full w-1 bg-game-red opacity-0 group-hover:opacity-100 transition-opacity" />

                                    {/* Rank Number */}
                                    <div className="col-span-1 text-center font-black text-xl text-game-dim group-hover:text-game-white">
                                        {i === 0 ? <Crown className="w-6 h-6 text-game-yellow mx-auto animate-bounce-slow" /> :
                                            i === 1 ? <Medal className="w-6 h-6 text-gray-300 mx-auto" /> :
                                                i === 2 ? <Medal className="w-6 h-6 text-orange-400 mx-auto" /> :
                                                    `0${i + 1}`}
                                    </div>

                                    {/* User Info */}
                                    <div className="col-span-4 flex items-center gap-4">
                                        <div className="relative">
                                            <div className="w-10 h-10 bg-gray-800 rounded-sm border border-white/10 group-hover:border-game-red transition-colors" />
                                            {/* Style assumes avatarColor is valid hex */}
                                            <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundColor: user.avatarColor || theme.colors['--primary'] }} />
                                        </div>
                                        <span className="font-bold text-lg tracking-wide group-hover:text-game-red transition-colors">{user.username}</span>
                                    </div>

                                    {/* Rank Badge */}
                                    <div className="col-span-2 text-center flex justify-center items-center gap-2">
                                        <Shield className={`w-4 h-4 ${i < 3 ? 'text-game-yellow' : 'text-game-dim'}`} />
                                        <span className="text-sm font-bold text-gray-300 group-hover:text-white">{user.rankBadge || 'Unranked'}</span>
                                    </div>

                                    {/* Stats */}
                                    <div className="col-span-1 text-center font-mono text-lg text-game-yellow group-hover:scale-110 transition-transform">{user.totalXp?.toLocaleString() || 0}</div>
                                    <div className="col-span-2 text-center font-mono text-game-red font-bold">{user.snakeHighScore?.toLocaleString() || 0}</div>
                                    <div className="col-span-2 text-center font-mono text-green-400">{getWinRate(user)}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </main>

            <style>{`
                .clip-path-slant {
                    clip-path: polygon(
                        0 0, 100% 0, 
                        100% calc(100% - 20px), calc(100% - 20px) 100%, 
                        0 100%
                    );
                }
                .text-stroke-primary {
                    -webkit-text-stroke: 1px var(--primary);
                    color: transparent;
                }
                .scrollbar-hide::-webkit-scrollbar {
                    display: none;
                }
                .animate-bounce-slow {
                    animation: bounce 3s infinite;
                }
            `}</style>
        </div>
    );
}