import React, { useRef, useLayoutEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { gsap } from 'gsap';
// --- 3D IMPORTS ---
import { Canvas } from '@react-three/fiber';
import { Stars, Sparkles, Environment } from '@react-three/drei';
// ------------------
import { useTheme } from '../context/ThemeContext';
import {
    LayoutDashboard,
    Trophy,
    Users,
    LogOut,
    Sword,
    Target,
    MessageSquare,
    Gamepad2,
    Play,
    Crosshair,
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

export default function GamesPage() {
    const navigate = useNavigate();
    const { theme, cycleTheme } = useTheme();
    const mainRef = useRef(null);
    const cursorRef = useRef(null);

    // Custom Cursor & Animations
    useLayoutEffect(() => {
        const cursor = cursorRef.current;
        const moveCursor = (e) => {
            gsap.to(cursor, { x: e.clientX, y: e.clientY, duration: 0.1, ease: 'power2.out' });
        };
        const scaleUp = () => gsap.to(cursor, { scale: 2, borderColor: theme.colors['--secondary'], ease: 'elastic.out' });
        const scaleDown = () => gsap.to(cursor, { scale: 1, borderColor: theme.colors['--primary'], ease: 'power2.out' });

        window.addEventListener('mousemove', moveCursor);
        document.querySelectorAll('a, button, .game-card').forEach(el => {
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

            // Card Entrance
            gsap.fromTo('.game-card',
                { y: 50, opacity: 0 },
                {
                    y: 0,
                    opacity: 1,
                    duration: 0.8,
                    stagger: 0.2,
                    ease: 'back.out(1.7)',
                    delay: 0.5
                }
            );

            // Text Entrance
            gsap.from('.header-text', {
                y: 20,
                opacity: 0,
                duration: 1,
                ease: 'power4.out',
                delay: 0.2
            });

        }, mainRef);

        return () => {
            ctx.revert();
            window.removeEventListener('mousemove', moveCursor);
            document.querySelectorAll('a, button, .game-card').forEach(el => {
                el.removeEventListener('mouseenter', scaleUp);
                el.removeEventListener('mouseleave', scaleDown);
            });
        };
    }, [theme]);

    const handleLogout = () => {
        localStorage.removeItem('username');
        navigate('/login');
    };

    const games = [
        {
            id: 'snake',
            title: 'SNAKE PROTOCOL',
            desc: 'Navigate the grid. Consume data packets. Avoid termination.',
            path: '/games/snake',
            image: 'https://images.unsplash.com/photo-1634063182170-5c1755edfed8?q=80&w=764&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
            stats: 'HIGH SCORE TRACKED'
        },
        {
            id: 'tictactoe',
            title: 'TIC-TAC-TOE SIEGE',
            desc: 'Tactical grid domination. Outsmart the AI defense system.',
            path: '/games/tictactoe',
            image: 'https://images.unsplash.com/photo-1668901382969-8c73e450a1f5?w=800&q=80',
            stats: 'WINS AFFECT GLOBAL RANK'
        }
    ];

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
                            className={`hud-element group relative flex justify-center w-full py-2 hover:bg-white/5 transition-colors ${item.path === '/games' ? 'border-r-2 border-game-red' : ''}`}
                        >
                            <item.icon className={`w-6 h-6 transition-colors duration-300 ${item.path === '/games' ? 'text-game-red' : 'text-game-gray group-hover:text-game-white'}`} />
                            {item.path !== '/games' && <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-1 bg-game-yellow rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />}
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
            <main className="flex-1 relative overflow-y-auto p-10 lg:p-20 flex flex-col z-10">
                <header className="flex justify-between items-end mb-20 header-text">
                    <div>
                        <div className="text-xs text-game-red font-mono tracking-[0.2em] mb-2 flex items-center gap-2">
                            <Gamepad2 className="w-4 h-4" /> SIMULATION DECK
                        </div>
                        <h1 className="text-6xl font-black uppercase italic tracking-tighter">
                            ACTIVE <span className="text-stroke-primary">PROTOCOLS</span>
                        </h1>
                    </div>
                    <div className="text-right hidden md:block">
                        <div className="text-2xl font-bold font-mono text-game-yellow">STATUS: LIVE</div>
                        <div className="text-xs text-game-gray tracking-widest">SYSTEM OPTIMAL</div>
                    </div>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-5xl">
                    {games.map((game, idx) => (
                        <div
                            key={game.id}
                            onClick={() => navigate(game.path)}
                            className="game-card group relative h-80 bg-game-surface backdrop-blur-sm border border-white/10 hover:border-game-red transition-all duration-300 cursor-pointer overflow-hidden clip-path-slant"
                        >
                            {/* Bg Image */}
                            <div className="absolute inset-0 bg-cover bg-center opacity-40 group-hover:scale-110 transition-transform duration-700" style={{ backgroundImage: `url(${game.image})` }} />
                            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />

                            <div className="absolute bottom-0 left-0 p-8 w-full">
                                <div className="flex justify-between items-end mb-2">
                                    <h2 className="text-3xl font-black uppercase italic tracking-tighter text-game-white group-hover:text-game-yellow transition-colors">
                                        {game.title}
                                    </h2>
                                    <Play className="w-8 h-8 text-game-red opacity-0 group-hover:opacity-100 -translate-x-4 group-hover:translate-x-0 transition-all duration-300" />
                                </div>
                                <p className="text-game-dim text-sm font-mono mb-4 border-l-2 border-game-red pl-3">
                                    {game.desc}
                                </p>
                                <div className="inline-block bg-game-red/20 border border-game-red/50 text-game-red text-[10px] uppercase font-bold px-2 py-1 tracking-widest">
                                    {game.stats}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

            </main>

            <style>{`
                .clip-path-slant {
                    clip-path: polygon(
                        20px 0, 100% 0, 
                        100% calc(100% - 20px), calc(100% - 20px) 100%, 
                        0 100%, 0 20px
                    );
                }
                .text-stroke-primary {
                    -webkit-text-stroke: 1px var(--primary);
                    color: transparent;
                }
            `}</style>
        </div>
    );
}