import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, X, Circle, RotateCcw, Palette } from 'lucide-react';
import axios from 'axios';
import { useTheme } from '../context/ThemeContext';

export default function TicTacToeGame() {
    const navigate = useNavigate();
    const { theme, cycleTheme } = useTheme();
    const [board, setBoard] = useState(Array(9).fill(null));
    const [isPlayerTurn, setIsPlayerTurn] = useState(true); // Player = X
    const [winner, setWinner] = useState(null); // 'X', 'O', 'DRAW'
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [stats, setStats] = useState({ wins: 0, losses: 0 });

    // Fetch Stats
    useEffect(() => {
        const fetchStats = async () => {
            const username = localStorage.getItem('username');
            if (username) {
                try {
                    const res = await axios.get(`/api/users/${username}/stats`);
                    setStats({ wins: res.data.wins || 0, losses: res.data.losses || 0 });
                } catch (e) {
                    console.error("Failed to fetch TTT stats", e);
                }
            }
        };
        fetchStats();
    }, []);

    // Win Combinations
    const COMBOS = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
        [0, 3, 6], [1, 4, 7], [2, 5, 8], // Cols
        [0, 4, 8], [2, 4, 6]             // Diagonals
    ];

    const checkWinner = (squares) => {
        for (let combo of COMBOS) {
            const [a, b, c] = combo;
            if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
                return squares[a];
            }
        }
        return squares.every(sq => sq) ? 'DRAW' : null;
    };

    const handleCellClick = (idx) => {
        if (board[idx] || winner || !isPlayerTurn) return;

        const newBoard = [...board];
        newBoard[idx] = 'X';
        setBoard(newBoard);

        const result = checkWinner(newBoard);
        if (result) {
            setWinner(result);
            submitResult(result);
        } else {
            setIsPlayerTurn(false);
        }
    };

    // AI Turn
    useEffect(() => {
        if (!isPlayerTurn && !winner) {
            const timer = setTimeout(() => {
                makeAIMove();
            }, 600); // Artificial delay
            return () => clearTimeout(timer);
        }
    }, [isPlayerTurn, winner]);

    const makeAIMove = () => {
        // Simple AI: Random empty spot (Upgrade to Minimax later if needed)
        // Or slightly smarter: Block player win?

        const emptyIndices = board.map((v, i) => v === null ? i : null).filter(v => v !== null);
        if (emptyIndices.length === 0) return;

        // 1. Try to Win
        // 2. Block Player
        // 3. Random

        // Simple Random for now
        const randIdx = emptyIndices[Math.floor(Math.random() * emptyIndices.length)];

        const newBoard = [...board];
        newBoard[randIdx] = 'O';
        setBoard(newBoard);

        const result = checkWinner(newBoard);
        if (result) {
            setWinner(result);
            submitResult(result);
        } else {
            setIsPlayerTurn(true);
        }
    };

    const submitResult = async (result) => {
        const username = localStorage.getItem('username');
        if (!username) return;

        let status = 'COMPLETED'; // Default
        if (result === 'X') status = 'WIN';
        if (result === 'O') status = 'LOSS';
        if (result === 'DRAW') status = 'DRAW';

        setIsSubmitting(true);
        try {
            const res = await axios.post('/api/games/submit', {
                username,
                game: 'TICTACTOE',
                score: 0,
                result: status
            });
            if (res.data) {
                setStats({ wins: res.data.wins || 0, losses: res.data.losses || 0 });
            }
        } catch (e) {
            console.error(e);
        } finally {
            setIsSubmitting(false);
        }
    };

    const resetGame = () => {
        setBoard(Array(9).fill(null));
        setWinner(null);
        setIsPlayerTurn(true);
        setIsSubmitting(false);
    };

    return (
        <div className="min-h-screen bg-game-dark text-game-white font-sans flex flex-col items-center justify-center p-10 cursor-none selection:bg-game-red selection:text-black">

            {/* Header */}
            <div className="w-full max-w-md flex justify-between items-center mb-12">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/games')}
                        className="flex items-center gap-2 text-game-gray hover:text-game-red transition-colors text-xs uppercase tracking-widest bg-white/5 py-2 px-4 clip-path-slant"
                    >
                        <ArrowLeft className="w-4 h-4" /> Retreat
                    </button>
                    <button
                        onClick={cycleTheme}
                        className="flex items-center justify-center text-game-gray hover:text-game-red transition-colors bg-white/5 w-10 h-8 clip-path-slant"
                        title={`Theme: ${theme.name}`}
                    >
                        <Palette className="w-4 h-4" />
                    </button>
                </div>

                <div className="text-right">
                    <h1 className="text-2xl font-black italic tracking-tighter uppercase text-game-white"><span className="text-game-red">SIEGE</span> ENGINE</h1>
                    <div className="text-[10px] text-game-gray tracking-widest font-mono">AI DIFFICULTY: ADAPTIVE</div>
                    <div className="text-[10px] text-game-yellow font-bold mt-1">
                        W: {stats.wins} // L: {stats.losses}
                    </div>
                </div>
            </div>

            {/* Game Board */}
            <div className="relative">
                <div className="grid grid-cols-3 gap-2 bg-game-core p-4 border border-white/10 shadow-2xl clip-path-slant">
                    {board.map((cell, idx) => (
                        <div
                            key={idx}
                            onClick={() => handleCellClick(idx)}
                            className={`w-24 h-24 sm:w-32 sm:h-32 bg-black/40 flex items-center justify-center cursor-pointer transition-colors relative overflow-hidden group border border-white/5
                                ${!cell && !winner && isPlayerTurn ? 'hover:bg-game-red/5' : ''}
                            `}
                        >
                            {cell === 'X' && <X className="w-16 h-16 text-game-red animate-in zoom-in spin-in-45 duration-300" strokeWidth={3} />}
                            {cell === 'O' && <Circle className="w-12 h-12 text-game-yellow animate-in zoom-in duration-300" strokeWidth={3} />}
                        </div>
                    ))}
                </div>

                {/* Status Overlay */}
                {winner && (
                    <div className="absolute inset-0 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center z-10 animate-in fade-in zoom-in duration-300">
                        {winner === 'X' && (
                            <>
                                <div className="text-4xl font-black italic uppercase text-game-red mb-2">VICTORY CHECKPOINT</div>
                                <div className="text-xs text-game-gray mb-6">HOSTILE AI NEUTRALIZED</div>
                            </>
                        )}
                        {winner === 'O' && (
                            <>
                                <div className="text-4xl font-black italic uppercase text-game-yellow mb-2">DEFENSE BREACHED</div>
                                <div className="text-xs text-game-gray mb-6">AI SUPERIORITY CONFIRMED</div>
                            </>
                        )}
                        {winner === 'DRAW' && (
                            <>
                                <div className="text-4xl font-black italic uppercase text-game-white mb-2">STALEMATE</div>
                                <div className="text-xs text-game-gray mb-6">TACTICAL DEADLOCK</div>
                            </>
                        )}

                        <button
                            onClick={resetGame}
                            className="flex items-center gap-2 px-8 py-3 bg-white text-black font-bold uppercase tracking-widest hover:bg-game-red hover:text-white transition-colors clip-path-slant"
                        >
                            <RotateCcw className="w-4 h-4" /> Reboot System
                        </button>
                    </div>
                )}
            </div>

            {/* Turn Indicator */}
            {!winner && (
                <div className="mt-12 flex items-center gap-4 text-xs font-mono tracking-widest uppercase">
                    <div className={`flex items-center gap-2 px-4 py-2 border ${isPlayerTurn ? 'border-game-red text-game-red bg-game-red/10' : 'border-white/5 text-gray-600'}`}>
                        <X className="w-4 h-4" /> PLAYER
                    </div>
                    <div className={`w-12 h-[1px] bg-white/10`} />
                    <div className={`flex items-center gap-2 px-4 py-2 border ${!isPlayerTurn ? 'border-game-yellow text-game-yellow bg-game-yellow/10' : 'border-white/5 text-gray-600'}`}>
                        <Circle className="w-3 h-3" /> AI CORE
                    </div>
                </div>
            )}

        </div>
    );
}
