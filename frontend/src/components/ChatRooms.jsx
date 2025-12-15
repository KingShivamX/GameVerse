import React, { useState, useEffect, useRef } from 'react';
import { Send, Hash, Users, MessageSquare, Swords, Shield, Zap, Smile, Flame, Skull, Trophy, AlertTriangle, Gamepad2 } from 'lucide-react';
import SockJS from 'sockjs-client';
import { Stomp } from '@stomp/stompjs';
import { useAudio } from '../context/AudioContext';

const GAMER_ICONS = ['🎮', '🕹️', '👾', '⚔️', '🛡️', '🎯', '🔥', '💀', '🏆', '⚠️', '🤖', '💎', '🚩', '🛑', '🔋'];

const ChatRooms = ({ roomId = 'public', roomName = 'Global Comms', username }) => {
    const { playHover, playClick, playArcadePoint } = useAudio();
    const [messages, setMessages] = useState([]);
    const [messageInput, setMessageInput] = useState('');
    const [isConnected, setIsConnected] = useState(false);
    const [showIconPicker, setShowIconPicker] = useState(false);

    // Refs for WebSocket client
    const stompClientRef = useRef(null);
    const messagesEndRef = useRef(null);

    // Random Rank Assigner (Mock Data)
    const getRank = (user) => {
        const hash = user.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        const ranks = ['IRON', 'BRONZE', 'SILVER', 'GOLD', 'PLATINUM', 'DIAMOND', 'ASCENDANT', 'IMMORTAL', 'RADIANT'];
        return ranks[hash % ranks.length];
    };

    useEffect(() => {
        // Clear messages when switching rooms
        setMessages([]);
        setIsConnected(false);

        // Connect to WebSocket
        const socket = new SockJS('http://localhost:8080/ws');
        const client = Stomp.over(socket);

        client.connect({}, () => {
            console.log(`Connected to room: ${roomId}`);
            setIsConnected(true);

            // Subscribe to Specific Room Topic
            const topic = roomId === 'public' ? '/topic/public' : `/topic/room/${roomId}`;

            client.subscribe(topic, (payload) => {
                const message = JSON.parse(payload.body);
                setMessages(prev => {
                    // Play Sound if not self
                    if (message.sender !== username) {
                        playArcadePoint(); // Reuse as chirp
                    }
                    return [...prev, message];
                });
            });

            // Join Message - Route to correct room
            client.send(`/app/chat/${roomId}/addUser`, {}, JSON.stringify({
                sender: username,
                type: 'JOIN'
            }));

        }, (err) => {
            console.error('Error connecting to chat:', err);
            setIsConnected(false);
        });

        stompClientRef.current = client;

        return () => {
            if (stompClientRef.current) {
                stompClientRef.current.disconnect();
            }
        };
    }, [roomId, username]); // Re-connect if room changes

    // Auto-scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const sendMessage = (e) => {
        e.preventDefault();
        if (messageInput.trim() && stompClientRef.current && isConnected) {
            playClick();
            const chatMessage = {
                sender: username,
                content: messageInput,
                type: 'CHAT'
            };

            // Send to dynamic room endpoint
            stompClientRef.current.send(`/app/chat/${roomId}/sendMessage`, {}, JSON.stringify(chatMessage));
            setMessageInput('');
            setShowIconPicker(false);
        }
    };

    const sendChallenge = () => {
        if (stompClientRef.current && isConnected) {
            playClick();
            const challengeMessage = {
                sender: username,
                content: `${username} has issued a tactical challenge!`,
                type: 'CHALLENGE'
            };
            stompClientRef.current.send(`/app/chat/${roomId}/sendMessage`, {}, JSON.stringify(challengeMessage));
        }
    };

    const sendReaction = (type, targetUser) => {
        if (stompClientRef.current && isConnected) {
            playClick();
            let content = '';
            switch (type) {
                case 'HYPE': content = `🔥 reacted HYPE to ${targetUser}`; break;
                case 'RIP': content = `💀 reacted RIP to ${targetUser}`; break;
                case 'GG': content = `🤝 reacted GG to ${targetUser}`; break;
                default: content = `👀 is watching ${targetUser}`;
            }
            const reactMsg = {
                sender: username,
                content: content,
                type: 'SYSTEM' // New type for small system logs
            };
            stompClientRef.current.send(`/app/chat/${roomId}/sendMessage`, {}, JSON.stringify(reactMsg));
        }
    };

    const addIcon = (icon) => {
        setMessageInput(prev => prev + icon + ' ');
        playHover();
    };

    return (
        <div className="h-full flex flex-col bg-transparent border-none rounded-none overflow-hidden text-white font-sans relative">

            {/* Header Overlay */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-game-red to-transparent opacity-50 z-10" />

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 font-mono scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                {messages.map((msg, idx) => (
                    <div key={idx} className={`flex flex-col ${msg.type === 'JOIN' ? 'items-center my-4' : (msg.sender === username ? 'items-end' : 'items-start')}`}>

                        {msg.type === 'JOIN' ? (
                            <div className="text-[10px] text-game-yellow tracking-widest uppercase opacity-70 border border-game-yellow/20 px-2 py-1 bg-game-yellow/5">
                                <Zap className="w-3 h-3 inline-block mr-1" />
                                QUANTUM LINK ESTABLISHED: {msg.sender}
                            </div>
                        ) : msg.type === 'SYSTEM' ? (
                            <div className="text-[10px] text-gray-400 italic tracking-wider opacity-60">
                                {msg.content}
                            </div>
                        ) : msg.type === 'CHALLENGE' ? (
                            <div className="w-full max-w-sm mx-auto my-4 bg-game-red/10 border border-game-red p-4 relative overflow-hidden group hover:bg-game-red/20 transition-colors cursor-pointer clip-path-slant">
                                <div className="absolute top-0 right-0 p-1">
                                    <Swords className="w-12 h-12 text-game-red opacity-20" />
                                </div>
                                <div className="relative z-10 text-center">
                                    <h4 className="text-game-red font-black uppercase text-xl italic tracking-tighter">TACTICAL CHALLENGE</h4>
                                    <div className="text-sm text-white font-bold my-2">{msg.sender} seeks an opponent!</div>
                                    <button className="mt-2 bg-game-red text-black text-[10px] font-bold uppercase px-4 py-1 hover:bg-white transition-colors">
                                        Accept Protocol
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className={`max-w-[85%] ${msg.sender === username ? 'text-right' : 'text-left'}`}>
                                <div className={`text-[10px] mb-1 uppercase tracking-wider flex items-center gap-2 ${msg.sender === username ? 'justify-end' : 'justify-start'}`}>
                                    {msg.sender !== username && (
                                        <span className="text-[9px] bg-white/10 px-1 text-game-yellow border border-game-yellow/20">
                                            [{getRank(msg.sender)}]
                                        </span>
                                    )}
                                    <span className={msg.sender === username ? 'text-game-red font-bold' : 'text-gray-400 font-bold'}>
                                        {msg.sender}
                                    </span>
                                    {msg.sender === username && (
                                        <span className="text-[9px] bg-game-red/20 px-1 text-game-red border border-game-red/20">
                                            [{getRank(msg.sender)}]
                                        </span>
                                    )}
                                </div>

                                <div className={`px-4 py-3 text-sm font-medium tracking-wide leading-relaxed shadow-lg backdrop-blur-md relative overflow-hidden group ${msg.sender === username
                                    ? 'bg-gradient-to-br from-game-red/20 to-black border-r-2 border-game-red text-white'
                                    : 'bg-gradient-to-bl from-white/10 to-black border-l-2 border-white/30 text-gray-100'
                                    }`}>
                                    {/* Scanline Effect */}
                                    <div className="absolute inset-0 bg-[url('https://media.giphy.com/media/dummy/giphy.gif')] opacity-[0.03] pointer-events-none" />
                                    {msg.content}

                                    {/* Hover Reaction Bar */}
                                    <div className={`absolute -bottom-8 ${msg.sender === username ? 'right-0' : 'left-0'} flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-black/80 p-1 rounded border border-white/10 z-20`}>
                                        <button onClick={() => sendReaction('HYPE', msg.sender)} className="hover:scale-125 transition-transform" title="Hype">🔥</button>
                                        <button onClick={() => sendReaction('RIP', msg.sender)} className="hover:scale-125 transition-transform" title="RIP">💀</button>
                                        <button onClick={() => sendReaction('GG', msg.sender)} className="hover:scale-125 transition-transform" title="GG">🤝</button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-white/10 bg-[#0F1923] relative">
                {/* Icon Picker Popover */}
                {showIconPicker && (
                    <div className="absolute bottom-full left-4 mb-2 bg-[#0F1923] border border-white/20 p-2 grid grid-cols-5 gap-2 z-50 shadow-2xl animate-in slide-in-from-bottom-2">
                        {GAMER_ICONS.map(icon => (
                            <button
                                key={icon}
                                onClick={() => addIcon(icon)}
                                className="p-2 hover:bg-white/10 rounded transition-colors text-lg"
                            >
                                {icon}
                            </button>
                        ))}
                    </div>
                )}

                <form onSubmit={sendMessage} className="flex gap-4 items-center">
                    {/* Challenge Button */}
                    <button
                        type="button"
                        onClick={sendChallenge}
                        disabled={!isConnected}
                        className="p-3 bg-yellow-500/10 border border-yellow-500/50 text-yellow-500 hover:bg-yellow-500 hover:text-black transition-all group relative"
                        title="Issue Challenge"
                    >
                        <Swords className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    </button>

                    {/* Icon Cloud Button */}
                    <button
                        type="button"
                        onClick={() => setShowIconPicker(!showIconPicker)}
                        className={`p-3 border border-white/10 text-gray-400 hover:text-white transition-all clip-path-slant ${showIconPicker ? 'bg-white/10 text-white' : 'bg-black/40'}`}
                        title="Open Armory"
                    >
                        <Gamepad2 className="w-5 h-5" />
                    </button>

                    <input
                        type="text"
                        value={messageInput}
                        onChange={(e) => setMessageInput(e.target.value)}
                        placeholder="Encrypted Channel..."
                        className="flex-1 bg-black/40 border border-white/10 p-4 text-sm focus:outline-none focus:border-game-red focus:bg-black/60 transition-all font-mono tracking-wider text-white placeholder-gray-600"
                    />
                    <button
                        type="submit"
                        disabled={!isConnected}
                        className="bg-game-red text-black px-8 py-4 uppercase text-xs font-black tracking-widest hover:bg-white hover:text-black transition-all disabled:opacity-50 disabled:cursor-not-allowed clip-path-slant hover:scale-105 active:scale-95"
                    >
                        TRANSIMIT
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ChatRooms;
