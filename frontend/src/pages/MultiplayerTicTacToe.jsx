import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { gsap } from 'gsap';
import { ArrowLeft, X, Circle, RotateCcw, Palette, Copy, Check, Users, Radio } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function MultiplayerTicTacToe() {
    const navigate = useNavigate();
    const { roomId } = useParams();
    const [searchParams] = useSearchParams();
    const { theme, cycleTheme } = useTheme();
    const cursorRef = useRef(null);
    
    const isHost = searchParams.get('host') === 'true';
    const isOnline = searchParams.get('online') === 'true';

    const [board, setBoard] = useState(Array(9).fill(null));
    const [currentPlayer, setCurrentPlayer] = useState('X');
    const [playerSymbol] = useState(isHost || !roomId ? 'X' : 'O');
    const [winner, setWinner] = useState(null);
    const [copied, setCopied] = useState(false);
    const [opponentJoined, setOpponentJoined] = useState(isOnline);
    const [waitingForOpponent, setWaitingForOpponent] = useState(!isOnline && isHost);

    // Simulate opponent joining after delay (for demo)
    useEffect(() => {
        if (waitingForOpponent) {
            const timer = setTimeout(() => {
                setOpponentJoined(true);
                setWaitingForOpponent(false);
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [waitingForOpponent]);

    // Win combinations
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

    // Custom cursor
    useLayoutEffect(() => {
        const cursor = cursorRef.current;
        const moveCursor = (e) => {
            gsap.to(cursor, { x: e.clientX, y: e.clientY, duration: 0.1, ease: 'power2.out' });
        };
        window.addEventListener('mousemove', moveCursor);
        return () => window.removeEventListener('mousemove', moveCursor);
    }, []);

    const handleCellClick = (idx) => {
        if (board[idx] || winner || !opponentJoined) return;
        if (currentPlayer !== playerSymbol) return; // Not your turn

        const newBoard = [...board];
        newBoard[idx] = currentPlayer;
        setBoard(newBoard);

        const result = checkWinner(newBoard);
        if (result) {
            setWinner(result);
        } else {
            setCurrentPlayer(currentPlayer === 'X' ? 'O' : 'X');
            // Simulate opponent move after delay
            if (!winner) {
                setTimeout(() => simulateOpponentMove(newBoard), 800);
            }
        }
    };

    const simulateOpponentMove = (currentBoard) => {
        const emptyIndices = currentBoard.map((v, i) => v === null ? i : null).filter(v => v !== null);
        if (emptyIndices.length === 0) return;

        const opponentSymbol = playerSymbol === 'X' ? 'O' : 'X';
        const randIdx = emptyIndices[Math.floor(Math.random() * emptyIndices.length)];

        const newBoard = [...currentBoard];
        newBoard[randIdx] = opponentSymbol;
        setBoard(newBoard);

        const result = checkWinner(newBoard);
        if (result) {
            setWinner(result);
        } else {
            setCurrentPlayer(playerSymbol);
        }
    };

    const resetGame = () => {
        setBoard(Array(9).fill(null));
        setWinner(null);
        setCurrentPlayer('X');
    };

    const copyLink = () => {
        const link = `${window.location.origin}/games/mp-tictactoe/${roomId}`;
        navigator.clipboard.writeText(link);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const isMyTurn = currentPlayer === playerSymbol && opponentJoined;
    const didIWin = winner === playerSymbol;
    const didILose = winner && winner !== 'DRAW' && winner !== playerSymbol;

    return (
        <div className="min-h-screen bg-game-dark text-game-white font-sans flex flex-col items-center justify-center p-6 cursor-none selection:bg-game-red selection:text-black relative overflow-hidden">

            {/* Background gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-game-dark via-black to-game-dark opacity-80" />
            <div className="absolute inset-0 opacity-20" style={{
                backgroundImage: `radial-gradient(circle at 50% 50%, var(--primary) 0%, transparent 50%)`,
                backgroundSize: '100% 100%'
            }} />

            {/* Crosshair Cursor */}
            <div ref={cursorRef} className="fixed top-0 left-0 w-8 h-8 pointer-events-none z-[9999] -translate-x-1/2 -translate-y-1/2 border-2 border-game-red bg-transparent rounded-full mix-blend-difference flex items-center justify-center">
                <div className="w-1 h-1 bg-game-red rounded-full" />
            </div>

            {/* Header */}
            <div className="w-full max-w-lg flex justify-between items-center mb-8 relative z-10">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/multiplayer')}
                        className="flex items-center gap-2 text-game-gray hover:text-game-red transition-colors text-xs uppercase tracking-widest bg-white/5 py-2 px-4 clip-path-slant"
                    >
                        <ArrowLeft className="w-4 h-4" /> Exit
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
                    <h1 className="text-2xl font-black italic tracking-tighter uppercase">
                        <span className="text-game-red">TACTICAL</span> GRID
                    </h1>
                    <div className="text-[10px] text-game-gray tracking-widest font-mono flex items-center gap-2 justify-end">
                        <Radio className="w-3 h-3 animate-pulse text-green-400" />
                        ROOM: {roomId || 'LOCAL'}
                    </div>
                </div>
            </div>

            {/* Room Link (if host) */}
            {isHost && roomId && !opponentJoined && (
                <div className="mb-6 p-4 bg-game-surface border border-game-yellow/50 max-w-lg w-full relative z-10 animate-pulse">
                    <div className="text-xs text-game-yellow uppercase tracking-widest mb-2 text-center">
                        Waiting for opponent...
                    </div>
                    <button
                        onClick={copyLink}
                        className="flex items-center gap-2 mx-auto text-xs text-game-gray hover:text-white transition-colors"
                    >
                        {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                        {copied ? 'Copied!' : 'Copy invite link'}
                    </button>
                </div>
            )}

            {/* Player Info */}
            <div className="mb-6 flex items-center gap-6 relative z-10">
                <div className={`flex items-center gap-2 px-4 py-2 border transition-all ${playerSymbol === 'X' ? 'border-game-red bg-game-red/20' : 'border-white/10'}`}>
                    <X className="w-5 h-5 text-game-red" />
                    <span className="text-xs uppercase tracking-widest">
                        {playerSymbol === 'X' ? 'YOU' : 'OPPONENT'}
                    </span>
                </div>
                <div className="text-game-gray">vs</div>
                <div className={`flex items-center gap-2 px-4 py-2 border transition-all ${playerSymbol === 'O' ? 'border-game-yellow bg-game-yellow/20' : 'border-white/10'}`}>
                    <Circle className="w-4 h-4 text-game-yellow" />
                    <span className="text-xs uppercase tracking-widest">
                        {playerSymbol === 'O' ? 'YOU' : 'OPPONENT'}
                    </span>
                </div>
            </div>

            {/* Game Board */}
            <div className="relative z-10">
                <div className="absolute -inset-2 bg-gradient-to-r from-game-red via-game-yellow to-game-red opacity-20 blur-xl" />
                <div className="relative grid grid-cols-3 gap-2 bg-black/80 p-4 border border-white/10 backdrop-blur-sm">
                    {board.map((cell, idx) => (
                        <div
                            key={idx}
                            onClick={() => handleCellClick(idx)}
                            className={`w-24 h-24 sm:w-28 sm:h-28 bg-game-surface/50 flex items-center justify-center cursor-pointer transition-all duration-200 relative overflow-hidden border border-white/5
                                ${!cell && !winner && isMyTurn ? 'hover:bg-game-red/10 hover:border-game-red/50' : ''}
                                ${!isMyTurn || cell || winner ? 'cursor-not-allowed' : ''}
                            `}
                        >
                            {cell === 'X' && (
                                <X className="w-14 h-14 text-game-red animate-in zoom-in spin-in-45 duration-300" strokeWidth={3} />
                            )}
                            {cell === 'O' && (
                                <Circle className="w-12 h-12 text-game-yellow animate-in zoom-in duration-300" strokeWidth={3} />
                            )}
                        </div>
                    ))}
                </div>

                {/* Winner Overlay */}
                {winner && (
                    <div className="absolute inset-0 bg-black/95 backdrop-blur-md flex flex-col items-center justify-center z-20 animate-in fade-in zoom-in duration-300">
                        {winner === 'DRAW' ? (
                            <>
                                <div className="text-4xl font-black italic uppercase text-game-white mb-2">STALEMATE</div>
                                <div className="text-xs text-game-gray mb-6">TACTICAL DEADLOCK</div>
                            </>
                        ) : didIWin ? (
                            <>
                                <div className="text-4xl font-black italic uppercase text-game-yellow mb-2">VICTORY!</div>
                                <div className="text-xs text-game-gray mb-6">ENEMY NEUTRALIZED</div>
                            </>
                        ) : (
                            <>
                                <div className="text-4xl font-black italic uppercase text-game-red mb-2">DEFEAT</div>
                                <div className="text-xs text-game-gray mb-6">SYSTEM COMPROMISED</div>
                            </>
                        )}

                        <button
                            onClick={resetGame}
                            className="flex items-center gap-2 px-8 py-3 bg-white text-black font-bold uppercase tracking-widest hover:bg-game-red hover:text-white transition-colors clip-path-slant"
                        >
                            <RotateCcw className="w-4 h-4" /> Rematch
                        </button>
                    </div>
                )}
            </div>

            {/* Turn Indicator */}
            {!winner && opponentJoined && (
                <div className="mt-8 relative z-10">
                    <div className={`px-6 py-3 border ${isMyTurn ? 'border-game-yellow bg-game-yellow/10 text-game-yellow' : 'border-white/10 text-game-gray'} transition-all duration-300`}>
                        <div className="text-xs uppercase tracking-widest font-mono flex items-center gap-2">
                            {isMyTurn ? (
                                <>
                                    <div className="w-2 h-2 bg-game-yellow rounded-full animate-pulse" />
                                    YOUR TURN
                                </>
                            ) : (
                                <>
                                    <div className="w-2 h-2 bg-game-gray rounded-full" />
                                    OPPONENT'S TURN
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Waiting Overlay */}
            {!opponentJoined && !waitingForOpponent && (
                <div className="mt-8 text-center relative z-10">
                    <Users className="w-8 h-8 text-game-gray mx-auto mb-2 animate-pulse" />
                    <div className="text-xs text-game-gray uppercase tracking-widest">Connecting to opponent...</div>
                </div>
            )}

            <style>{`
                .clip-path-slant {
                    clip-path: polygon(10% 0, 100% 0, 100% 70%, 90% 100%, 0 100%, 0 30%);
                }
            `}</style>
        </div>
    );
}
