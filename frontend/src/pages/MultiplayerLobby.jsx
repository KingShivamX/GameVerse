import React, { useRef, useLayoutEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { gsap } from 'gsap';
import { Canvas } from '@react-three/fiber';
import { Stars, Sparkles, Environment } from '@react-three/drei';
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
    Crosshair,
    Palette,
    Globe,
    UserPlus,
    Copy,
    Check,
    X,
    Circle,
    Zap,
    Swords
} from 'lucide-react';

// 3D Background Component
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

// Game data for multiplayer games
const MULTIPLAYER_GAMES = [
    {
        id: 'mp-tictactoe',
        title: 'TACTICAL GRID',
        subtitle: 'Tic-Tac-Toe',
        desc: 'Strategic 3x3 domination. Outsmart your opponent in real-time.',
        path: '/games/mp-tictactoe',
        image: 'https://images.unsplash.com/photo-1611996575749-79a3a250f948?w=800&q=80',
        icon: X,
        players: '2 PLAYERS',
        duration: '~2 MIN'
    },
    {
        id: 'connect-four',
        title: 'GRAVITY DROP',
        subtitle: 'Connect Four',
        desc: 'Vertical warfare. Connect four before your enemy does.',
        path: '/games/connect-four',
        image: 'https://images.unsplash.com/photo-1606092195730-5d7b9af1efc5?w=800&q=80',
        icon: Circle,
        players: '2 PLAYERS',
        duration: '~5 MIN'
    },
    {
        id: 'pong',
        title: 'NEON PONG',
        subtitle: 'Arcade Classic',
        desc: 'High-speed paddle combat. First to 5 wins.',
        path: '/games/pong',
        image: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&q=80',
        icon: Zap,
        players: '2 PLAYERS',
        duration: '~3 MIN'
    }
];

export default function MultiplayerLobby() {
    const navigate = useNavigate();
    const { theme, cycleTheme } = useTheme();
    const mainRef = useRef(null);
    const cursorRef = useRef(null);

    const [selectedGame, setSelectedGame] = useState(null);
    const [mode, setMode] = useState(null); // 'online' | 'friend' | 'join'
    const [roomCode, setRoomCode] = useState('');
    const [generatedCode, setGeneratedCode] = useState('');
    const [copied, setCopied] = useState(false);
    const [searching, setSearching] = useState(false);

    // Generate random room code
    const generateRoomCode = () => {
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
        let code = '';
        for (let i = 0; i < 6; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return code;
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
        document.querySelectorAll('a, button, .game-card').forEach(el => {
            el.addEventListener('mouseenter', scaleUp);
            el.addEventListener('mouseleave', scaleDown);
        });

        const ctx = gsap.context(() => {
            gsap.from('.hud-element', {
                x: -20,
                opacity: 0,
                duration: 1.2,
                stagger: 0.1,
                ease: 'power3.out'
            });

            gsap.fromTo('.game-card',
                { y: 50, opacity: 0 },
                {
                    y: 0,
                    opacity: 1,
                    duration: 0.8,
                    stagger: 0.15,
                    ease: 'back.out(1.7)',
                    delay: 0.3
                }
            );

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

    const handleGameSelect = (game) => {
        setSelectedGame(game);
        setMode(null);
        setGeneratedCode('');
        setRoomCode('');
    };

    const handlePlayOnline = () => {
        setMode('online');
        setSearching(true);
        // Simulate matchmaking
        setTimeout(() => {
            setSearching(false);
            const code = generateRoomCode();
            navigate(`${selectedGame.path}/${code}?online=true`);
        }, 2000);
    };

    const handlePlayWithFriend = () => {
        setMode('friend');
        const code = generateRoomCode();
        setGeneratedCode(code);
    };

    const handleJoinRoom = () => {
        if (roomCode.length >= 4) {
            navigate(`${selectedGame.path}/${roomCode.toUpperCase()}`);
        }
    };

    const copyToClipboard = () => {
        const link = `${window.location.origin}${selectedGame.path}/${generatedCode}`;
        navigator.clipboard.writeText(link);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const startGameAsHost = () => {
        navigate(`${selectedGame.path}/${generatedCode}?host=true`);
    };

    return (
        <div ref={mainRef} className="min-h-screen bg-game-dark text-game-white font-sans overflow-hidden flex cursor-none selection:bg-game-red selection:text-black relative">

            {/* 3D Background */}
            <Background3D colors={theme.colors} />

            {/* Crosshair Cursor */}
            <div ref={cursorRef} className="fixed top-0 left-0 w-8 h-8 pointer-events-none z-[9999] -translate-x-1/2 -translate-y-1/2 border-2 border-game-red bg-transparent rounded-full mix-blend-difference flex items-center justify-center">
                <div className="w-1 h-1 bg-game-red rounded-full" />
            </div>

            {/* Sidebar HUD */}
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
                        { icon: Swords, path: '/multiplayer', active: true },
                        { icon: Trophy, path: '/leaderboard' },
                        { icon: Target, path: '/reviews' },
                        { icon: Users, path: '/profile' },
                        { icon: MessageSquare, path: '/chat' },
                    ].map((item, i) => (
                        <button
                            key={i}
                            onClick={() => navigate(item.path)}
                            className={`hud-element group relative flex justify-center w-full py-2 hover:bg-white/5 transition-colors ${item.active ? 'border-r-2 border-game-red' : ''}`}
                        >
                            <item.icon className={`w-6 h-6 transition-colors duration-300 ${item.active ? 'text-game-red' : 'text-game-gray group-hover:text-game-white'}`} />
                            {!item.active && <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-1 bg-game-yellow rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />}
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

            {/* Main Content */}
            <main className="flex-1 relative overflow-y-auto p-10 lg:p-16 flex flex-col z-10">
                <header className="flex justify-between items-end mb-16 header-text">
                    <div>
                        <div className="text-xs text-game-red font-mono tracking-[0.2em] mb-2 flex items-center gap-2">
                            <Globe className="w-4 h-4 animate-pulse" /> MULTIPLAYER ARENA
                        </div>
                        <h1 className="text-5xl lg:text-6xl font-black uppercase italic tracking-tighter">
                            BATTLE <span className="text-stroke-primary">ZONE</span>
                        </h1>
                    </div>
                    <div className="text-right hidden md:block">
                        <div className="text-2xl font-bold font-mono text-game-yellow">ONLINE: 2,847</div>
                        <div className="text-xs text-game-gray tracking-widest">REAL-TIME PVP</div>
                    </div>
                </header>

                {/* Game Selection Grid */}
                {!selectedGame && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl">
                        {MULTIPLAYER_GAMES.map((game) => (
                            <div
                                key={game.id}
                                onClick={() => handleGameSelect(game)}
                                className="game-card group relative h-72 bg-game-surface backdrop-blur-sm border border-white/10 hover:border-game-red transition-all duration-300 cursor-pointer overflow-hidden clip-path-slant"
                            >
                                {/* Background Image */}
                                <div className="absolute inset-0 bg-cover bg-center opacity-30 group-hover:scale-110 transition-transform duration-700" style={{ backgroundImage: `url(${game.image})` }} />
                                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />

                                {/* Online Badge */}
                                <div className="absolute top-4 right-4 flex items-center gap-2 bg-game-red/90 px-3 py-1 text-[10px] font-bold uppercase tracking-wider">
                                    <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                                    ONLINE
                                </div>

                                <div className="absolute bottom-0 left-0 p-6 w-full">
                                    <div className="flex items-center gap-3 mb-2">
                                        <game.icon className="w-6 h-6 text-game-red" />
                                        <div className="text-[10px] text-game-gray uppercase tracking-widest">{game.subtitle}</div>
                                    </div>
                                    <h2 className="text-2xl font-black uppercase italic tracking-tighter text-game-white group-hover:text-game-yellow transition-colors mb-2">
                                        {game.title}
                                    </h2>
                                    <p className="text-game-gray text-xs font-mono mb-4 line-clamp-2">
                                        {game.desc}
                                    </p>
                                    <div className="flex gap-4 text-[10px] text-game-gray uppercase tracking-widest">
                                        <span>{game.players}</span>
                                        <span>•</span>
                                        <span>{game.duration}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Game Selected - Mode Selection */}
                {selectedGame && !mode && (
                    <div className="max-w-2xl mx-auto text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <button
                            onClick={() => setSelectedGame(null)}
                            className="mb-8 text-game-gray hover:text-game-red transition-colors text-xs uppercase tracking-widest flex items-center gap-2 mx-auto"
                        >
                            ← Back to Games
                        </button>

                        <div className="flex items-center justify-center gap-4 mb-8">
                            <selectedGame.icon className="w-10 h-10 text-game-red" />
                            <h2 className="text-4xl font-black uppercase italic tracking-tighter">
                                {selectedGame.title}
                            </h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                            {/* Play Online */}
                            <button
                                onClick={handlePlayOnline}
                                className="group p-8 bg-game-surface border border-white/10 hover:border-game-red transition-all duration-300 clip-path-slant"
                            >
                                <Globe className="w-12 h-12 text-game-red mx-auto mb-4 group-hover:scale-110 transition-transform" />
                                <div className="text-xl font-black uppercase tracking-tight mb-2">Play Online</div>
                                <div className="text-xs text-game-gray">Match with random opponent</div>
                            </button>

                            {/* Play with Friend */}
                            <button
                                onClick={handlePlayWithFriend}
                                className="group p-8 bg-game-surface border border-white/10 hover:border-game-yellow transition-all duration-300 clip-path-slant"
                            >
                                <UserPlus className="w-12 h-12 text-game-yellow mx-auto mb-4 group-hover:scale-110 transition-transform" />
                                <div className="text-xl font-black uppercase tracking-tight mb-2">Play with Friend</div>
                                <div className="text-xs text-game-gray">Create a private room</div>
                            </button>
                        </div>

                        {/* Join Room */}
                        <div className="p-6 bg-game-surface/50 border border-white/5">
                            <div className="text-xs text-game-gray uppercase tracking-widest mb-4">Or join with room code</div>
                            <div className="flex gap-4 justify-center">
                                <input
                                    value={roomCode}
                                    onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                                    placeholder="ENTER CODE"
                                    maxLength={6}
                                    className="w-40 bg-black/50 border border-white/10 px-4 py-3 text-center font-mono uppercase tracking-widest focus:border-game-red outline-none transition-colors"
                                />
                                <button
                                    onClick={handleJoinRoom}
                                    disabled={roomCode.length < 4}
                                    className="px-6 py-3 bg-game-red text-black font-bold uppercase tracking-widest hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed clip-path-slant"
                                >
                                    Join
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Searching for Match */}
                {mode === 'online' && searching && (
                    <div className="max-w-md mx-auto text-center animate-in fade-in duration-300">
                        <div className="w-32 h-32 mx-auto mb-8 border-2 border-game-red rounded-full flex items-center justify-center relative">
                            <div className="absolute inset-0 border-2 border-game-red rounded-full animate-ping opacity-30" />
                            <Globe className="w-12 h-12 text-game-red animate-pulse" />
                        </div>
                        <div className="text-2xl font-black uppercase tracking-tight mb-2">Searching...</div>
                        <div className="text-game-gray text-xs font-mono">Finding worthy opponent</div>
                    </div>
                )}

                {/* Friend Room Created */}
                {mode === 'friend' && generatedCode && (
                    <div className="max-w-md mx-auto text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <button
                            onClick={() => { setMode(null); setGeneratedCode(''); }}
                            className="mb-8 text-game-gray hover:text-game-red transition-colors text-xs uppercase tracking-widest flex items-center gap-2 mx-auto"
                        >
                            ← Back
                        </button>

                        <UserPlus className="w-16 h-16 text-game-yellow mx-auto mb-6" />
                        <div className="text-xl font-black uppercase tracking-tight mb-2">Room Created!</div>
                        <div className="text-game-gray text-xs mb-8">Share this code or link with your friend</div>

                        <div className="bg-black/50 border border-game-yellow/50 p-6 mb-6">
                            <div className="text-4xl font-mono font-bold tracking-[0.3em] text-game-yellow mb-4">
                                {generatedCode}
                            </div>
                            <button
                                onClick={copyToClipboard}
                                className="flex items-center gap-2 mx-auto px-4 py-2 bg-white/10 hover:bg-white/20 transition-colors text-xs uppercase tracking-widest"
                            >
                                {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                                {copied ? 'Copied!' : 'Copy Link'}
                            </button>
                        </div>

                        <button
                            onClick={startGameAsHost}
                            className="px-12 py-4 bg-game-yellow text-black font-black uppercase tracking-widest hover:bg-white transition-colors clip-path-slant"
                        >
                            Start Game
                        </button>

                        <div className="mt-6 text-[10px] text-game-gray">
                            Your friend will join when they open the link
                        </div>
                    </div>
                )}
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
