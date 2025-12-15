import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Users, Plus, Lock, Radio } from 'lucide-react';

export default function RoomLobby({ onJoinRoom, username }) {
    const [rooms, setRooms] = useState([]);
    const [showCreate, setShowCreate] = useState(false);
    const [newRoomName, setNewRoomName] = useState('');
    const [newRoomLimit, setNewRoomLimit] = useState(5);

    useEffect(() => {
        fetchRooms();
        const interval = setInterval(fetchRooms, 3000); // Poll for updates
        return () => clearInterval(interval);
    }, []);

    const fetchRooms = async () => {
        try {
            const res = await axios.get('/api/chat/rooms');
            setRooms(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post('/api/chat/rooms', {
                name: newRoomName,
                maxMembers: parseInt(newRoomLimit),
                createdBy: username
            });
            setShowCreate(false);
            setNewRoomName('');
            fetchRooms(); // Refresh list
        } catch (err) {
            alert('Failed to create room');
        }
    };

    const handleJoin = async (room) => {
        try {
            await axios.post(`/api/chat/rooms/${room.id}/join`, { username });
            onJoinRoom(room);
        } catch (err) {
            alert(err.response?.data || 'Cannot join room');
        }
    };

    return (
        <div className="h-full p-10 font-sans text-white flex flex-col items-center overflow-y-auto">

            <header className="w-full max-w-5xl flex justify-between items-end mb-12 border-b border-white/10 pb-6">
                <div>
                    <div className="text-xs text-game-red font-mono tracking-[0.2em] mb-2 flex items-center gap-2">
                        <Radio className="w-4 h-4 animate-pulse" /> ENCRYPTED CHANNELS
                    </div>
                    <h1 className="text-5xl uppercase tracking-tighter font-black">Tactical <span className="text-stroke-red">Comms</span></h1>
                </div>
                <button
                    onClick={() => setShowCreate(!showCreate)}
                    className="group relative px-6 py-3 bg-white text-black font-bold uppercase tracking-widest hover:bg-game-red hover:text-white transition-colors clip-path-slant"
                >
                    <span className="relative z-10 flex items-center gap-2"><Plus className="w-4 h-4" /> Initialize Channel</span>
                </button>
            </header>

            {/* CREATE FORM */}
            {showCreate && (
                <div className="w-full max-w-5xl mb-12 bg-[#0F1923] border-l-2 border-game-red p-8 animate-in fade-in slide-in-from-top-4 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10 text-9xl font-black text-white select-none pointer-events-none leading-none -mt-8 -mr-8">NEW</div>
                    <form onSubmit={handleCreate} className="flex gap-6 items-end relative z-10">
                        <div className="flex-1">
                            <label className="block text-xs uppercase tracking-widest text-game-gray mb-2">Channel Designation</label>
                            <input
                                value={newRoomName}
                                onChange={e => setNewRoomName(e.target.value)}
                                className="w-full bg-black/50 border border-white/10 p-4 text-sm focus:border-game-red outline-none transition-colors font-mono text-white placeholder-gray-600"
                                placeholder="e.g. ALPHA SQUAD"
                                required
                            />
                        </div>
                        <div className="w-40">
                            <label className="block text-xs uppercase tracking-widest text-game-gray mb-2">Capacity</label>
                            <input
                                type="number"
                                min="2"
                                max="50"
                                value={newRoomLimit}
                                onChange={e => setNewRoomLimit(e.target.value)}
                                className="w-full bg-black/50 border border-white/10 p-4 text-sm focus:border-game-red outline-none transition-colors font-mono text-white"
                            />
                        </div>
                        <button type="submit" className="bg-game-red text-black px-8 py-4 uppercase text-xs font-black tracking-widest hover:bg-white hover:text-black transition-colors clip-path-slant">
                            Confirm
                        </button>
                    </form>
                </div>
            )}

            {/* ROOM GRID */}
            <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {rooms.map(room => (
                    <div
                        key={room.id}
                        className={`group p-8 border transition-all duration-300 relative overflow-hidden clip-path-slant ${room.currentMembers >= room.maxMembers
                            ? 'border-red-500/20 bg-red-900/10 cursor-not-allowed grayscale'
                            : 'border-white/10 bg-[#0F1923]/80 hover:border-game-red/50 cursor-pointer hover:bg-[#0F1923]'
                            }`}
                        onClick={() => room.currentMembers < room.maxMembers && handleJoin(room)}
                    >
                        <div className="flex justify-between items-start mb-8">
                            <div>
                                <h3 className="text-xl font-bold uppercase tracking-wide mb-1 group-hover:text-game-red transition-colors">{room.name}</h3>
                                <div className="text-[10px] text-game-gray font-mono uppercase">ID: {room.id.substring(0, 8)}</div>
                            </div>
                            {room.currentMembers >= room.maxMembers ? (
                                <Lock className="w-4 h-4 text-game-red" />
                            ) : (
                                <div className="w-2 h-2 bg-game-green rounded-full animate-pulse shadow-[0_0_10px_#0f0]" />
                            )}
                        </div>

                        <div className="flex justify-between items-end border-t border-white/5 pt-4">
                            <div className="text-xs text-game-gray font-mono uppercase">
                                HOST: <span className="text-white">{room.createdBy}</span>
                            </div>
                            <div className="flex items-center gap-2 text-white/50 group-hover:text-white transition-colors">
                                <Users className="w-4 h-4" />
                                <span className="font-mono text-sm font-bold">
                                    {room.currentMembers}/{room.maxMembers}
                                </span>
                            </div>
                        </div>

                        {/* Hover Effect */}
                        <div className="absolute inset-0 bg-game-red/5 translate-y-full group-hover:translate-y-0 transition-transform duration-300 pointer-events-none" />
                    </div>
                ))}
            </div>

        </div>
    );
}
