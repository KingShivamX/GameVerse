import React, { useEffect, useState, useRef, useLayoutEffect } from 'react';
import axios from 'axios';
import { gsap } from 'gsap';
import { useNavigate } from 'react-router-dom';
// --- 3D IMPORTS ---
import { Canvas } from '@react-three/fiber';
import { Stars, Sparkles, Environment } from '@react-three/drei';
import { useAudio } from '../context/AudioContext';
// ------------------
import { useTheme } from '../context/ThemeContext';
import {
    Star,
    MessageSquare,
    Plus,
    LayoutDashboard,
    Users,
    LogOut,
    Sword,
    Target,
    Gamepad2,
    Trophy,
    Crosshair,
    User,
    Activity,
    Palette
} from 'lucide-react';

// --- COMPONENT: 3D BACKGROUND ---
const Background3D = ({ colors }) => {
    return (
        // FIXED: z-[-1] forces this behind everything in the DOM stacking order
        <div className="fixed inset-0 z-[-1] pointer-events-none bg-game-dark">
            <Canvas camera={{ position: [0, 0, 1] }} gl={{ alpha: true }}>
                {/* Fog blends distant objects into the background color */}
                <fog attach="fog" args={[colors['--bg-core'], 5, 20]} />

                <Stars radius={50} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
                <Sparkles count={50} scale={[12, 12, 10]} size={6} speed={0.4} opacity={0.5} color={colors['--primary']} />
                <Sparkles count={100} scale={[20, 20, 10]} size={2} speed={0.2} opacity={0.2} color={colors['--secondary']} />
                <Environment preset="night" />
            </Canvas>
        </div>
    );
};

export default function GameReviews() {
    const navigate = useNavigate();
    const { theme, cycleTheme } = useTheme();
    const mainRef = useRef(null);
    const cursorRef = useRef(null);
    const interactiveElementsRef = useRef([]);
    const interactiveTimeoutRef = useRef(null);

    const [games, setGames] = useState([]);
    const [selectedGame, setSelectedGame] = useState(null);
    const [gameReviews, setGameReviews] = useState([]);
    const [loading, setLoading] = useState(true);

    const [reviewText, setReviewText] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [userId, setUserId] = useState(null); // Dynamic User ID
    const { playHover } = useAudio();

    // Fetch User ID
    useEffect(() => {
        const fetchUser = async () => {
            const username = localStorage.getItem('username');
            if (username) {
                try {
                    const res = await axios.get(`/api/users/${username}`);
                    if (res.data && res.data.id) {
                        setUserId(res.data.id);
                    }
                } catch (e) {
                    console.error("Failed to fetch user ID for reviews", e);
                }
            }
        };
        fetchUser();
    }, []);

    // --- DATA FETCHING ---
    useEffect(() => {
        const fetchGames = async () => {
            try {
                // Initialize endpoint check
                try { await axios.post('/api/games/init'); } catch (e) { }

                const res = await axios.get('/api/games');

                if (res?.data && Array.isArray(res.data) && res.data.length > 0) {
                    const mappedGames = res.data.map((g) => ({
                        id: g.id,
                        title: g.title,
                        rating: g.rating ?? 4.5,
                        img: g.imageUrl || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800',
                        desc: g.genre || 'Tactical Operation'
                    }));
                    setGames(mappedGames);
                } else {
                    throw new Error('Empty games list');
                }
            } catch (err) {
                console.warn('Using fallback data:', err);
                // Mock Data Fallback
                setGames([
                    { id: 1, title: 'Cyberpunk Arena', rating: 4.8, img: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800', desc: 'Fast-paced shooter.' },
                    { id: 2, title: 'Neon Racer', rating: 4.2, img: 'https://images.unsplash.com/photo-1593508512255-86ab42a8e620?w=800', desc: 'High octane racing.' },
                    { id: 3, title: 'Void Walkers', rating: 4.9, img: 'https://images.unsplash.com/photo-1552820728-8b83bb6b773f?w=800', desc: 'Strategy RPG.' }
                ]);
            } finally {
                setLoading(false);
            }
        };

        fetchGames();
    }, []);

    // Fetch Reviews
    useEffect(() => {
        if (!selectedGame) {
            setGameReviews([]);
            return;
        }
        let mounted = true;
        const fetchReviews = async () => {
            try {
                const res = await axios.get(`/api/games/${selectedGame.id}/reviews`);
                if (!mounted) return;
                setGameReviews(Array.isArray(res.data) ? res.data : []);
            } catch (err) {
                setGameReviews([
                    { id: 101, username: 'Ghost', rating: 5, comment: 'Excellent tactical depth.', createdAt: '2023-10-24' },
                    { id: 102, username: 'Viper', rating: 4, comment: 'Gameplay is solid, but needs balancing.', createdAt: '2023-10-25' }
                ]);
            }
        };
        fetchReviews();
        return () => { mounted = false; };
    }, [selectedGame]);

    // Submit Review
    const handleSubmitReview = async () => {
        if (!selectedGame || !reviewText.trim()) return;
        setSubmitting(true);
        const username = localStorage.getItem('username') || 'Unknown Agent';
        // Use real userId if available, else fallback to 1 (or handle error)
        const authorId = userId || 1;

        try {
            const response = await axios.post(`/api/games/${selectedGame.id}/reviews`, {
                username, userId: authorId, rating: 5, comment: reviewText
            });
            const created = response?.data ? response.data : { id: Date.now(), username, rating: 5, comment: reviewText, createdAt: new Date().toISOString() };
            setGameReviews((prev) => [created, ...prev]);
            alert('Report Submitted Successfully.');
            setReviewText('');
        } catch (err) {
            console.error("Review submit failed", err);
            const mockReview = { id: Date.now(), username, rating: 5, comment: reviewText, createdAt: new Date().toISOString() };
            setGameReviews((prev) => [mockReview, ...prev]);
            alert('Connection Unstable. Report Logged Locally.');
            setReviewText('');
        } finally {
            setSubmitting(false);
        }
    };

    // --- ANIMATIONS & CURSOR ---
    useLayoutEffect(() => {
        if (loading) return;

        // --- Custom Cursor Logic ---
        const cursorEl = cursorRef.current;
        const hasCursor = !!cursorEl;
        const moveCursor = (e) => { if (hasCursor) gsap.to(cursorEl, { x: e.clientX, y: e.clientY, duration: 0.1, ease: 'power2.out' }); };
        const scaleUp = () => { if (hasCursor) gsap.to(cursorEl, { scale: 2, borderColor: theme.colors['--secondary'], ease: 'elastic.out' }); };
        const scaleDown = () => { if (hasCursor) gsap.to(cursorEl, { scale: 1, borderColor: theme.colors['--primary'], ease: 'power2.out' }); };

        window.addEventListener('mousemove', moveCursor);

        const interactiveSetup = () => {
            const els = Array.from(document.querySelectorAll('button, a, .interactive-card'));
            interactiveElementsRef.current = els;
            els.forEach((el) => {
                el.addEventListener('mouseenter', scaleUp);
                el.addEventListener('mouseleave', scaleDown);
            });
        };
        interactiveTimeoutRef.current = window.setTimeout(interactiveSetup, 100);

        // --- Entrance Animations ---
        const ctx = gsap.context(() => {
            // Sidebar
            gsap.fromTo('.hud-element',
                { x: -20, opacity: 0 },
                { x: 0, opacity: 1, duration: 1.2, stagger: 0.1, ease: 'power3.out' }
            );

            // Header
            gsap.fromTo('.header-content',
                { y: -30, opacity: 0 },
                { y: 0, opacity: 1, duration: 1, ease: 'power4.out', delay: 0.2 }
            );

            // Cards (FIXED: Using fromTo ensures they end up at opacity 1)
            gsap.fromTo('.review-card',
                { y: 50, opacity: 0 },
                {
                    y: 0,
                    opacity: 1,
                    duration: 0.8,
                    stagger: 0.15,
                    ease: 'back.out(1.7)',
                    delay: 0.4
                }
            );
        }, mainRef);

        return () => {
            ctx.revert();
            window.removeEventListener('mousemove', moveCursor);
            if (interactiveTimeoutRef.current) clearTimeout(interactiveTimeoutRef.current);
            const els = interactiveElementsRef.current || [];
            els.forEach((el) => {
                try {
                    el.removeEventListener('mouseenter', scaleUp);
                    el.removeEventListener('mouseleave', scaleDown);
                } catch (e) { }
            });
        };
    }, [loading, theme]);

    const handleLogout = () => navigate('/login');

    return (
        <div ref={mainRef} className="min-h-screen text-game-white font-sans overflow-hidden flex cursor-none selection:bg-game-red selection:text-black relative">

            {/* --- 3D BACKGROUND (Moved to fixed z-[-1]) --- */}
            <Background3D colors={theme.colors} />

            {/* CROSSHAIR CURSOR */}
            <div
                ref={cursorRef}
                className="fixed top-0 left-0 w-8 h-8 pointer-events-none z-[9999] -translate-x-1/2 -translate-y-1/2 border-2 border-game-red bg-transparent rounded-full mix-blend-difference flex items-center justify-center"
            >
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
                        { icon: MessageSquare, path: '/chat' }
                    ].map((item, i) => (
                        <button
                            key={i}
                            onClick={() => navigate(item.path)}
                            className={`hud-element group relative flex justify-center w-full py-2 hover:bg-white/5 transition-colors ${item.path === '/reviews' ? 'border-r-2 border-game-red' : ''}`}
                            type="button"
                            onMouseEnter={playHover}
                        >
                            <item.icon className={`w-6 h-6 transition-colors duration-300 ${item.path === '/reviews' ? 'text-game-red' : 'text-game-gray group-hover:text-game-white'}`} />
                            {item.path !== '/reviews' && <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-1 bg-game-yellow rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />}
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

                <button onClick={handleLogout} onMouseEnter={playHover} className="hud-element mb-10 text-game-gray hover:text-game-red transition-colors" type="button">
                    <LogOut className="w-6 h-6" />
                </button>
            </aside>

            {/* MAIN CONTENT (z-10 ensures it's above background) */}
            <main className="flex-1 relative overflow-y-auto p-10 lg:p-20 z-10 scrollbar-hide">

                {/* Header */}
                <div className="flex items-end justify-between mb-12 border-b border-game-border pb-6 header-content">
                    <div>
                        <div className="text-xs text-game-red font-mono tracking-[0.2em] mb-2 flex items-center gap-2">
                            <Target className="w-4 h-4" /> MISSION DEBRIEF
                        </div>
                        <h1 className="text-6xl font-black uppercase tracking-tighter mb-2">
                            OPERATIONS <span className="text-stroke-primary">LOG</span>
                        </h1>
                        <p className="text-game-gray font-mono text-sm">ARCHIVED DATA // REVIEWS</p>
                    </div>
                </div>

                {/* Games Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {games.map((game) => (
                        <div
                            key={game.id}
                            onClick={() => setSelectedGame(game)}
                            onMouseEnter={playHover}
                            // Default opacity 1 in case JS fails, handled by GSAP normally
                            className="review-card interactive-card group bg-game-surface backdrop-blur-xl border border-game-border overflow-hidden cursor-pointer hover:border-game-yellow transition-all duration-300 clip-path-card relative z-10"
                        >
                            <div className="h-48 overflow-hidden relative">
                                <img src={game.img} alt={game.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                <div className="absolute top-2 right-2 bg-black/90 px-2 py-1 flex items-center gap-1 text-game-yellow text-xs font-bold font-mono border border-game-border">
                                    <Star className="w-3 h-3 fill-current" /> {game.rating}
                                </div>
                                <div className="absolute inset-0 bg-game-red/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            </div>
                            <div className="p-6 relative">
                                <h3 className="text-2xl font-black uppercase mb-2 group-hover:text-game-red transition-colors italic">{game.title}</h3>
                                <p className="text-sm text-game-dim mb-4 font-mono">{game.desc}</p>
                                <div className="text-xs font-bold uppercase tracking-widest text-game-dim flex items-center gap-2">
                                    <MessageSquare className="w-4 h-4" /> INSPECT LOGS
                                </div>
                                <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-game-red opacity-50" />
                            </div>
                        </div>
                    ))}

                    {/* Add New Placeholder */}
                    <div onMouseEnter={playHover} className="review-card interactive-card border-2 border-dashed border-game-border flex flex-col items-center justify-center p-8 text-game-dim hover:text-game-white hover:border-game-red cursor-pointer transition-all bg-game-surface hover:bg-game-dark min-h-[300px] relative z-10">
                        <Plus className="w-12 h-12 mb-4 opacity-50 group-hover:opacity-100" />
                        <span className="font-bold uppercase tracking-widest font-mono">Submit New Log</span>
                    </div>
                </div>

                {/* MODAL */}
                {selectedGame && (
                    <div className="fixed inset-0 bg-black/90 backdrop-blur-xl z-[100] flex items-center justify-center p-4" onClick={() => setSelectedGame(null)}>
                        <div
                            className="bg-game-dark p-0 border border-game-red max-w-4xl w-full h-[80vh] flex flex-col relative shadow-[0_0_100px_rgba(0,0,0,0.8)] clip-path-slant overflow-hidden"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="border-b border-game-border p-6 flex justify-between items-start bg-black/30">
                                <div>
                                    <div className="text-game-red font-mono text-xs tracking-widest mb-1">SUBJECT: {selectedGame.title}</div>
                                    <h2 className="text-4xl font-black uppercase italic">INTELLIGENCE REPORT</h2>
                                </div>
                                <button onClick={() => setSelectedGame(null)} className="text-game-gray hover:text-white" type="button">
                                    <Crosshair className="w-6 h-6 rotate-45" />
                                </button>
                            </div>

                            <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
                                <div className="p-8 lg:w-1/3 border-b lg:border-b-0 lg:border-r border-game-border flex flex-col bg-black/20">
                                    <h3 className="text-xl font-bold uppercase mb-4 flex items-center gap-2">
                                        <Plus className="w-4 h-4 text-game-red" /> New Entry
                                    </h3>
                                    <textarea
                                        className="flex-1 bg-game-input border border-game-border p-4 text-game-white mb-6 block focus:outline-none focus:border-game-red font-mono text-sm resize-none"
                                        placeholder="Enter operational report data here..."
                                        value={reviewText}
                                        onChange={(e) => setReviewText(e.target.value)}
                                    />
                                    <button
                                        onClick={handleSubmitReview}
                                        disabled={submitting}
                                        className="w-full bg-game-red text-white font-bold uppercase py-4 hover:bg-white hover:text-black transition-all clip-path-button disabled:opacity-50"
                                        type="button"
                                    >
                                        {submitting ? 'Transmitting...' : 'Submit Report'}
                                    </button>
                                </div>

                                <div className="p-0 lg:w-2/3 flex flex-col bg-game-dark">
                                    <div className="p-4 border-b border-game-border bg-black/20 text-xs font-bold uppercase tracking-widest text-game-dim flex items-center gap-2">
                                        <Activity className="w-4 h-4" /> Existing Records
                                    </div>
                                    <div className="flex-1 overflow-y-auto p-6 space-y-4">
                                        {gameReviews.length > 0 ? (
                                            gameReviews.map((review) => (
                                                <div key={review.id} className="p-4 border-l-2 border-game-border hover:border-game-red bg-white/5 transition-all">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <div className="flex items-center gap-2">
                                                            <User className="w-4 h-4 text-game-gray" />
                                                            <span className="font-bold text-game-red uppercase">{review.username || 'Unknown Agent'}</span>
                                                        </div>
                                                        <div className="flex items-center gap-1 text-game-yellow text-xs font-bold">
                                                            <Star className="w-3 h-3 fill-current" /> {review.rating}/5
                                                        </div>
                                                    </div>
                                                    <p className="text-gray-300 font-mono text-sm leading-relaxed">"{review.comment}"</p>
                                                    <div className="mt-3 text-[10px] text-gray-600 font-mono uppercase">
                                                        TIMESTAMP: {new Date(review.createdAt || Date.now()).toLocaleDateString()}
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="text-center text-game-dim py-10 font-mono text-sm">NO INTELLIGENCE GATHERED YET.</div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>

            <style>{`
                .clip-path-card { clip-path: polygon(0 0, 100% 0, 100% 85%, 90% 100%, 0 100%); }
                .clip-path-slant { clip-path: polygon(0 0, 100% 0, 100% 95%, 95% 100%, 0 100%); }
                .clip-path-button { clip-path: polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px); }
                .text-stroke-primary { -webkit-text-stroke: 1px var(--primary); color: transparent; }
                .scrollbar-hide::-webkit-scrollbar { display: none; }
            `}</style>
        </div>
    );
}