import React, { useRef, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { gsap } from 'gsap';
import axios from 'axios';
// --- 3D IMPORTS ---
import { Canvas } from '@react-three/fiber';
import { Stars, Sparkles, Environment } from '@react-three/drei';
// ------------------
import { useAudio } from '../context/AudioContext';
import { useTheme } from '../context/ThemeContext';
import {
    LayoutDashboard,
    Trophy,
    Users,
    LogOut,
    Sword,
    Target,
    MessageSquare,
    ArrowLeft,
    Crosshair,
    Gamepad2,
    Volume2,
    VolumeX,
    Palette
} from 'lucide-react';
import ChatRooms from '../components/ChatRooms';
import RoomLobby from '../components/RoomLobby';

// --- COMPONENT: 3D BACKGROUND (Digital Void) ---
const Background3D = ({ colors }) => {
    return (
        <div className="absolute inset-0 z-0 pointer-events-none">
            <Canvas camera={{ position: [0, 0, 1] }} gl={{ alpha: true }}>
                {/* No solid background color, rely on CSS */}
                <fog attach="fog" args={[colors['--bg-core'], 5, 20]} />
                <Stars radius={50} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
                <Sparkles count={50} scale={[12, 12, 10]} size={6} speed={0.4} opacity={0.5} color={colors['--primary']} />
                <Sparkles count={100} scale={[20, 20, 10]} size={2} speed={0.2} opacity={0.2} color={colors['--secondary']} />
                <Environment preset="night" />
            </Canvas>
        </div>
    );
};

export default function ChatPage() {
    const { playHover, startBGM, stopBGM, toggleMute, isMuted } = useAudio();
    const { theme, cycleTheme } = useTheme();
    const navigate = useNavigate();
    const mainRef = useRef(null);
    const cursorRef = useRef(null);
    const [currentRoom, setCurrentRoom] = useState(null); // null = Lobby
    const [username, setUsername] = useState('Player_' + Math.floor(Math.random() * 1000));

    useEffect(() => {
        // Start Sci-Fi BGM on entry
        startBGM('/assets/audio/bgm.mp3');
        return () => {
            stopBGM();
        };
    }, []);

    useEffect(() => {
        const initUser = async () => {
            const storedUser = localStorage.getItem('username');
            if (storedUser) {
                setUsername(storedUser);
            }
        };
        initUser();
    }, []);

    // Custom Cursor & Animations
    useEffect(() => {
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
            gsap.from('.hud-element', {
                x: -20,
                opacity: 0,
                duration: 1.2,
                stagger: 0.1,
                ease: 'power3.out'
            });

            gsap.from('.chat-container', {
                y: 20,
                opacity: 0,
                duration: 1.0,
                ease: 'power3.out',
                delay: 0.3
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

    const handleLeaveRoom = async () => {
        if (currentRoom) {
            try {
                await axios.post(`/api/chat/rooms/${currentRoom.id}/leave`, { username });
            } catch (e) {
                console.error("Error leaving room:", e);
            }
        }
        setCurrentRoom(null);
    };

    return (
        <div ref={mainRef} className="min-h-screen bg-game-dark text-game-white font-sans overflow-hidden flex cursor-none selection:bg-game-red selection:text-black relative">

            {/* --- 3D BACKGROUND (Fixed Z-Index) --- */}
            <div className="fixed inset-0 z-0">
                <Background3D colors={theme.colors} />
            </div>

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
                            onMouseEnter={playHover}
                            className={`hud-element group relative flex justify-center w-full py-2 hover:bg-white/5 transition-colors ${item.path === '/chat' ? 'border-r-2 border-game-red' : ''}`}
                        >
                            <item.icon className={`w-6 h-6 transition-colors duration-300 ${item.path === '/chat' ? 'text-game-red' : 'text-game-gray group-hover:text-game-white'}`} />
                            {item.path !== '/chat' && <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-1 bg-game-yellow rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />}
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
            <main className="flex-1 relative overflow-hidden p-0 flex flex-col z-10 bg-transparent">

                {/* Header (Only shows when in a room) */}
                {currentRoom && (
                    <div className="h-20 border-b border-game-border bg-game-surface flex items-center px-8 justify-between backdrop-blur-md z-20">
                        <button
                            onClick={handleLeaveRoom}
                            className="flex items-center gap-3 px-4 py-2 bg-game-red/10 border border-game-red/50 text-game-red hover:bg-game-red hover:text-white transition-all duration-300 text-xs font-bold uppercase tracking-widest clip-path-slant group"
                        >
                            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                            <span>Disengage</span>
                        </button>

                        <div className="flex flex-col items-end">
                            <div className="text-[10px] text-game-gray font-mono tracking-widest uppercase mb-1 flex items-center gap-2">
                                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" /> SECURE_CHANNEL:
                            </div>
                            <div className="text-xl font-black tracking-tighter text-game-white uppercase italic">
                                {currentRoom.name}
                            </div>
                        </div>
                    </div>
                )}

                {/* Full Height Chat Interface */}
                {/* IMPORTANT: Ensure ChatRooms and RoomLobby have transparent backgrounds or use rgba() to let the stars show through */}
                <div className="chat-container w-full flex-1 relative z-10 overflow-hidden">
                    {currentRoom ? (
                        <ChatRooms
                            roomId={currentRoom.id}
                            roomName={currentRoom.name}
                            username={username}
                        />
                    ) : (
                        <div className="h-full overflow-y-auto p-10 lg:p-20 scrollbar-hide">
                            <RoomLobby onJoinRoom={setCurrentRoom} username={username} />
                        </div>
                    )}
                </div>
            </main>

            <style>{`
                .clip-path-slant {
                    clip-path: polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px);
                }
                .scrollbar-hide::-webkit-scrollbar {
                    display: none;
                }
            `}</style>
        </div>
    );
}