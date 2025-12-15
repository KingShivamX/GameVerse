import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { gsap } from 'gsap';
import axios from 'axios';
// --- 3D IMPORTS ---
import { Canvas, useFrame } from '@react-three/fiber';
import {
    Float,
    PerspectiveCamera,
    Environment,
    Stars,
    Sparkles
} from '@react-three/drei';
import {
    PieChart, Pie, Cell, AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, RadialBarChart, RadialBar, PolarAngleAxis,
    Radar, RadarChart, PolarGrid, PolarRadiusAxis
} from 'recharts';
// ------------------
import {
    LayoutDashboard,
    Trophy,
    Users,
    LogOut,
    Sword,
    Target,
    MessageSquare,
    Cpu,
    Activity,
    Crosshair,
    Shield,
    Gamepad2,
    Volume2,
    VolumeX,
    Palette
} from 'lucide-react';
import { useAudio } from '../context/AudioContext';
import { useTheme } from '../context/ThemeContext';

// --- COMPONENT: INTERACTIVE CRYSTAL (Restored to Mouse Interaction) ---
const InteractiveCrystal = ({ primaryColor }) => {
    const meshRef = useRef(null);
    const [hovered, setHover] = useState(false);

    // Animation Loop
    useFrame((state, delta) => {
        if (meshRef.current) {
            // Constant rotation
            meshRef.current.rotation.y += delta * 0.5;

            // Interactive Spin: Accelerate on hover
            const extraSpeed = hovered ? 2.0 : 0;
            meshRef.current.rotation.x += delta * extraSpeed;

            // Gentle floating wobble
            meshRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.5) * 0.2;
        }
    });

    return (
        <Float
            speed={hovered ? 5 : 2}
            rotationIntensity={hovered ? 1.5 : 1}
            floatIntensity={hovered ? 2 : 1}
        >
            <mesh
                ref={meshRef}
                scale={hovered ? 2.4 : 2.2}
                onPointerOver={() => setHover(true)}
                onPointerOut={() => setHover(false)}
            >
                {/* icosahedronGeometry args: [radius, detail] */}
                <icosahedronGeometry args={[1, 0]} />
                <meshStandardMaterial
                    color={hovered ? "#ffffff" : primaryColor}
                    emissive={primaryColor}
                    emissiveIntensity={hovered ? 2 : 0.8}
                    roughness={0.1}
                    metalness={0.9}
                    wireframe={true}
                    transparent={true}
                    opacity={hovered ? 0.8 : 1}
                />
            </mesh>

            {/* Inner Core */}
            <mesh scale={0.8} rotation={[0.5, 0.5, 0]}>
                <octahedronGeometry args={[1, 0]} />
                <meshBasicMaterial color={primaryColor} wireframe transparent opacity={0.5} />
            </mesh>
        </Float>
    );
};

// --- COMPONENT: 3D BACKGROUND ---
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

export default function Dashboard() {
    const navigate = useNavigate();
    const mainRef = useRef(null);
    const cursorRef = useRef(null);
    const [stats, setStats] = useState(null);
    const [matches, setMatches] = useState([]);
    const [loading, setLoading] = useState(true);

    const { playHover, playClick, startBGM, stopBGM, toggleMute, isMuted } = useAudio();
    const { theme, cycleTheme } = useTheme();

    // --- FETCH DATA ---
    useEffect(() => {
        startBGM('/assets/audio/dashboard.mp3');
        const fetchData = async () => {
            const storedUser = localStorage.getItem('username');
            if (!storedUser) {
                navigate('/login');
                return;
            }
            try {
                const [statsRes, matchesRes] = await Promise.allSettled([
                    axios.get(`/api/users/${storedUser}/stats`),
                    axios.get(`/api/matches/user/${storedUser}`)
                ]);
                if (statsRes.status === 'fulfilled') setStats(statsRes.value.data);
                if (matchesRes.status === 'fulfilled') setMatches(matchesRes.value.data);
            } catch (error) {
                console.error("Failed to fetch dashboard data", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
        return () => stopBGM();
    }, [navigate]);

    // Data Processing
    const pieData = [
        { name: 'Wins', value: stats?.wins || 0, color: theme.colors['--primary'] },
        { name: 'Losses', value: stats?.losses || 0, color: '#333' }
    ];
    const trendData = [...matches].reverse().slice(-10).map((m, i) => ({
        index: i + 1, score: m.score, result: m.result
    }));
    const skillData = [
        { subject: 'Tactics', A: (stats?.winRate || 0), fullMark: 100 },
        { subject: 'Lethality', A: Math.min((parseFloat(stats?.kdRatio || 0) * 20), 100), fullMark: 100 },
        { subject: 'Reflexes', A: Math.min((stats?.snakeHighScore || 0) / 2, 100), fullMark: 100 },
        { subject: 'Endurance', A: Math.min((stats?.playTime || 0) * 5, 100), fullMark: 100 },
        { subject: 'Experience', A: Math.min((stats?.totalXp || 0) / 50, 100), fullMark: 100 },
    ];
    const recentBattles = [...matches].slice(0, 5);

    // --- ANIMATIONS & CURSOR ---
    useEffect(() => {
        if (loading) return;
        const cursor = cursorRef.current;
        const moveCursor = (e) => gsap.to(cursor, { x: e.clientX, y: e.clientY, duration: 0.1, ease: 'power2.out' });
        window.addEventListener('mousemove', moveCursor);

        const interactiveElements = document.querySelectorAll('button, a, .cursor-pointer, .hud-element');
        interactiveElements.forEach(el => {
            el.addEventListener('mouseenter', () => gsap.to(cursor, { scale: 2, borderColor: theme.colors['--secondary'], ease: 'elastic.out' }));
            el.addEventListener('mouseleave', () => gsap.to(cursor, { scale: 1, borderColor: theme.colors['--primary'], ease: 'power2.out' }));
        });

        const ctx = gsap.context(() => {
            gsap.from('.hud-element', { y: 20, opacity: 0, duration: 0.8, stagger: 0.1, ease: 'power3.out' });
            gsap.from('.glitch-text', { skewX: 20, opacity: 0, duration: 1, ease: 'power4.out', delay: 0.2 });
        }, mainRef);

        return () => {
            ctx.revert();
            window.removeEventListener('mousemove', moveCursor);
        };
    }, [loading, theme]);

    const handleLogout = () => navigate('/login');

    if (loading) return (
        <div className="min-h-screen bg-game-dark text-game-red flex items-center justify-center font-mono uppercase tracking-[0.5em] text-xs">
            <Cpu className="w-6 h-6 animate-spin mr-4" /> Initializing System...
        </div>
    );

    return (
        <div ref={mainRef} className="min-h-screen bg-game-dark text-game-white font-sans overflow-hidden flex cursor-none selection:bg-game-red selection:text-black relative">

            <Background3D colors={theme.colors} />

            <div ref={cursorRef} className="fixed top-0 left-0 w-8 h-8 pointer-events-none z-[9999] -translate-x-1/2 -translate-y-1/2 border-2 border-game-red bg-transparent rounded-full mix-blend-difference flex items-center justify-center">
                <div className="w-1 h-1 bg-game-red rounded-full" />
            </div>

            {/* SIDEBAR HUD */}
            <aside className="w-24 border-r border-game-border flex flex-col items-center py-10 z-20 bg-game-surface backdrop-blur-md relative">
                <div className="absolute top-0 right-0 w-1 h-full bg-game-red/50 scale-y-0 hover:scale-y-100 transition-transform origin-top" />

                {/* LOGO / CROSSHAIR */}
                <div className="mb-20 hud-element">
                    <div className="w-12 h-12 border-2 border-game-red flex items-center justify-center relative group cursor-pointer">
                        <div className="absolute inset-0 bg-game-red opacity-0 group-hover:opacity-20 transition-opacity" />
                        <Crosshair className="w-6 h-6 text-game-white group-hover:rotate-90 transition-transform duration-500" />
                        {/* Decorative Corners */}
                        <div className="absolute top-0 left-0 w-1 h-1 bg-game-red" />
                        <div className="absolute bottom-0 right-0 w-1 h-1 bg-game-red" />
                    </div>
                </div>

                <nav className="flex-1 flex flex-col gap-8 w-full">
                    {[
                        { icon: LayoutDashboard, path: '/dashboard' },
                        { icon: Gamepad2, path: '/games' },
                        { icon: Sword, path: '/matchmaking' },
                        { icon: Trophy, path: '/leaderboard' },
                        { icon: Target, path: '/reviews' },
                        { icon: MessageSquare, path: '/chat' },
                    ].map((item, i) => (
                        <button
                            key={i}
                            onClick={() => { playClick(); navigate(item.path); }}
                            onMouseEnter={playHover}
                            className={`hud-element group relative flex justify-center w-full py-2 hover:bg-white/5 transition-colors ${i === 0 ? 'border-r-2 border-game-red' : ''}`}
                        >
                            <item.icon className={`w-6 h-6 transition-colors duration-300 ${i === 0 ? 'text-game-red' : 'text-game-gray group-hover:text-game-white'}`} />
                        </button>
                    ))}
                </nav>

                <div className="flex flex-col gap-4 mb-4">
                    <button onClick={cycleTheme} className="hud-element text-game-gray hover:text-game-red transition-colors"><Palette className="w-5 h-5" /></button>
                    <button onClick={toggleMute} className="hud-element text-game-gray hover:text-game-red transition-colors">{isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}</button>
                    <button onClick={handleLogout} className="hud-element text-game-gray hover:text-game-red transition-colors"><LogOut className="w-5 h-5" /></button>
                </div>
            </aside>

            {/* MAIN INTERFACE */}
            <main className="flex-1 relative overflow-y-auto overflow-x-hidden p-10 lg:p-16 z-10">
                <header className="mb-16 flex justify-between items-end border-b border-game-border pb-8">
                    <div>
                        <div className="text-xs font-mono font-bold text-game-red tracking-[0.2em] mb-2 flex items-center gap-2">
                            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                            SYSTEM ONLINE // VERSION 4.2
                        </div>
                        <h1 className="glitch-text text-6xl lg:text-8xl font-black uppercase tracking-tighter leading-none text-transparent bg-clip-text bg-gradient-to-br from-game-white to-gray-500">
                            HELLO, <br /> <span className="text-stroke-primary">{stats?.username || 'AGENT'}</span>
                        </h1>
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-[1600px] mx-auto">
                    {/* CARD 1: 3D RANK - INTERACTIVE CRYSTAL */}
                    <div className="hud-element bg-game-surface backdrop-blur-sm border border-game-border p-0 overflow-hidden clip-path-slant relative group hover:border-game-red/50 transition-colors h-[400px]">
                        <div className="absolute inset-0 z-0 cursor-pointer">
                            <Canvas>
                                <PerspectiveCamera makeDefault position={[0, 0, 5]} />
                                <ambientLight intensity={0.5} />
                                <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} />
                                <pointLight position={[-10, -10, -10]} intensity={0.5} color={theme.colors['--primary']} />

                                <InteractiveCrystal primaryColor={theme.colors['--primary']} />

                                <Environment preset="city" />
                            </Canvas>
                        </div>
                        <div className="relative z-10 p-8 flex flex-col justify-between h-full pointer-events-none">
                            <div className="flex justify-between items-start">
                                <h3 className="text-sm font-bold text-game-gray uppercase tracking-widest">Current Rank</h3>
                                <Shield className="w-6 h-6 text-game-white/50" />
                            </div>
                            <div>
                                <span className="text-5xl font-black text-game-white drop-shadow-lg">{stats?.rankBadge?.split(' ')[0] || 'UNRANKED'}</span>
                                <div className="mt-2 text-game-yellow font-mono text-sm uppercase tracking-wider">{stats?.rankBadge || 'Calibrating...'}</div>
                            </div>
                        </div>
                    </div>

                    {/* CARD 2: COMBAT RECORD (Charts & Stats) */}
                    <div className="hud-element lg:col-span-2 bg-game-surface backdrop-blur-sm border border-game-border p-6 relative flex flex-col gap-6 group hover:border-game-yellow/50 transition-colors">
                        <div className="flex justify-between items-center">
                            <h3 className="text-sm font-bold text-game-gray uppercase tracking-widest">Combat Record</h3>
                            <div className="text-xs bg-game-red/10 text-game-red px-2 py-1 font-mono">LIVE ANALYTICS</div>
                        </div>
                        <div className="grid grid-cols-4 gap-4 text-center border-b border-white/5 pb-6">
                            <div><div className="text-2xl font-black text-game-white">{stats?.totalMatches || 0}</div><div className="text-[10px] text-game-gray uppercase">Matches</div></div>
                            <div><div className="text-2xl font-black text-game-white">{stats?.wins || 0}</div><div className="text-[10px] text-game-gray uppercase">Wins</div></div>
                            <div><div className="text-2xl font-black text-game-yellow">{stats?.kdRatio || '0.0'}</div><div className="text-[10px] text-game-gray uppercase">K/D</div></div>
                            <div><div className="text-2xl font-black text-game-red">{stats?.winRate || 0}%</div><div className="text-[10px] text-game-gray uppercase">Win Rate</div></div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-[200px]">
                            <div className="relative">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie data={pieData} innerRadius={40} outerRadius={60} paddingAngle={5} dataKey="value" stroke="none">
                                            {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                                        </Pie>
                                        <Tooltip contentStyle={{ backgroundColor: theme.colors['--bg-core'] }} itemStyle={{ color: theme.colors['--text-main'] }} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="relative">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={trendData}>
                                        <defs>
                                            <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor={theme.colors['--primary']} stopOpacity={0.8} />
                                                <stop offset="95%" stopColor={theme.colors['--primary']} stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <XAxis dataKey="index" hide />
                                        <Tooltip contentStyle={{ backgroundColor: theme.colors['--bg-core'] }} itemStyle={{ color: theme.colors['--primary'] }} />
                                        <Area type="monotone" dataKey="score" stroke={theme.colors['--primary']} fillOpacity={1} fill="url(#colorScore)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>

                    {/* CARD 3: PLAYTIME ANALYSIS */}
                    <div className="hud-element lg:col-span-3 bg-white/5 border border-game-border p-1 flex items-center justify-between min-h-[100px] mt-4 relative overflow-hidden backdrop-blur-sm group hover:border-game-red/50 transition-colors">
                        <div className="absolute inset-0 bg-game-red/5 skew-x-[-20deg] translate-x-1/2" />
                        <div className="p-8 z-10 flex flex-col lg:flex-row gap-8 items-center w-full justify-between">
                            <div className="flex items-center gap-6">
                                <div className="relative w-20 h-20">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <RadialBarChart
                                            innerRadius="80%"
                                            outerRadius="100%"
                                            barSize={10}
                                            data={[{ name: 'Hours', value: (stats?.playTime || 0) % 24, fill: theme.colors['--primary'] }]}
                                            startAngle={90}
                                            endAngle={-270}
                                        >
                                            <PolarAngleAxis type="number" domain={[0, 24]} angleAxisId={0} tick={false} />
                                            <RadialBar background clockWise dataKey="value" cornerRadius={10} />
                                        </RadialBarChart>
                                    </ResponsiveContainer>
                                    <Activity className="w-8 h-8 text-game-red absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-game-white uppercase tracking-wider">Playtime Analysis</h4>
                                    <p className="text-xs text-game-gray font-mono">Total Hours Logged in Simulation</p>
                                </div>
                            </div>
                            <div className="text-5xl font-black text-game-white font-mono tracking-tighter">
                                {stats?.playTime != null ? Number(stats.playTime).toFixed(1) : '0.0'}
                                <span className="text-xl text-game-gray">H</span>
                            </div>
                        </div>
                    </div>

                    {/* CARD 4: OPERATIVE SKILL GRAPH (Radar) */}
                    <div className="hud-element lg:col-span-1 bg-game-surface backdrop-blur-sm border border-game-border p-4 relative flex flex-col items-center justify-center group hover:border-game-yellow/50 transition-colors h-[350px]">
                        <div className="absolute top-2 left-2 text-[10px] text-gray-500 uppercase font-bold tracking-widest">Operative Skill Graph</div>
                        <ResponsiveContainer width="100%" height="100%">
                            <RadarChart cx="50%" cy="50%" outerRadius="70%" data={skillData}>
                                <PolarGrid stroke={theme.colors['--text-dim']} />
                                <PolarAngleAxis dataKey="subject" tick={{ fill: theme.colors['--text-dim'], fontSize: 10 }} />
                                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                                <Radar
                                    name="Skills"
                                    dataKey="A"
                                    stroke={theme.colors['--secondary']}
                                    strokeWidth={2}
                                    fill={theme.colors['--secondary']}
                                    fillOpacity={0.3}
                                />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>

                    {/* CARD 5: RECENT BATTLE LOG */}
                    <div className="hud-element lg:col-span-2 bg-black/40 border border-game-border p-6 relative font-mono text-sm overflow-hidden h-[350px]">
                        <div className="flex justify-between items-center mb-4 border-b border-white/10 pb-2">
                            <h3 className="text-game-gray uppercase tracking-widest text-xs">Recent Battle Log</h3>
                            <div className="animate-pulse w-2 h-2 bg-green-500 rounded-full" />
                        </div>
                        <div className="space-y-3 overflow-y-auto h-full pb-10 scrollbar-hide">
                            {recentBattles.length === 0 ? (
                                <div className="text-gray-600 italic">No combat data recorded.</div>
                            ) : (
                                recentBattles.map((match, i) => (
                                    <div key={i} className="flex justify-between items-center text-xs group hover:bg-white/5 p-2 rounded transition-colors cursor-default">
                                        <div className="flex items-center gap-3">
                                            <span className="text-gray-600">[{match.playedAt ? new Date(match.playedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '00:00'}]</span>
                                            <span className={`${match.result === 'WIN' ? 'text-green-400' : match.result === 'LOSS' ? 'text-red-400' : 'text-game-yellow'} font-bold w-12`}>
                                                {match.result || 'DONE'}
                                            </span>
                                            <span className="text-gray-300">{match.gameName}</span>
                                        </div>
                                        <div className="font-bold text-gray-500 group-hover:text-game-white">
                                            SCORE: {match.score}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                        {/* Scanline Overlay */}
                        <div className="absolute inset-0 pointer-events-none bg-[url('https://media.giphy.com/media/dummy/giphy.gif')] opacity-[0.02]" />
                    </div>

                </div>
            </main>

            <style>{`
                .clip-path-slant { clip-path: polygon(20px 0, 100% 0, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0 100%, 0 20px); }
                .text-stroke-primary { -webkit-text-stroke: 1px var(--primary); color: transparent; }
                @keyframes scan { 0% { top: 0; opacity: 0; } 50% { opacity: 1; } 100% { top: 100%; opacity: 0; } }
                .animate-scan { animation: scan 2s linear infinite; }
                /* Hide scrollbar for battle log */
                .scrollbar-hide::-webkit-scrollbar { display: none; }
                .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>
        </div>
    );
}
