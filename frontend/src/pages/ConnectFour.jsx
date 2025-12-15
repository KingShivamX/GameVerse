import React, { useState, useRef, useLayoutEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { gsap } from 'gsap';
import { ArrowLeft, Palette, RotateCcw, Circle, Radio } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const ROWS = 6;
const COLS = 7;

export default function ConnectFour() {
    const navigate = useNavigate();
    const { roomId } = useParams();
    const { theme, cycleTheme } = useTheme();
    const cursorRef = useRef(null);

    // Create empty board
    const createEmptyBoard = () => Array(ROWS).fill(null).map(() => Array(COLS).fill(null));

    const [board, setBoard] = useState(createEmptyBoard());
    const [currentPlayer, setCurrentPlayer] = useState('RED');
    const [winner, setWinner] = useState(null);
    const [hoverCol, setHoverCol] = useState(null);
    const [winningCells, setWinningCells] = useState([]);
    const [droppingPiece, setDroppingPiece] = useState(null);

    // Custom cursor
    useLayoutEffect(() => {
        const cursor = cursorRef.current;
        const moveCursor = (e) => {
            gsap.to(cursor, { x: e.clientX, y: e.clientY, duration: 0.1, ease: 'power2.out' });
        };
        window.addEventListener('mousemove', moveCursor);
        return () => window.removeEventListener('mousemove', moveCursor);
    }, []);

    // Check for winner
    const checkWinner = (board, row, col, player) => {
        const directions = [
            [0, 1],   // Horizontal
            [1, 0],   // Vertical
            [1, 1],   // Diagonal \
            [1, -1]   // Diagonal /
        ];

        for (let [dr, dc] of directions) {
            let count = 1;
            let cells = [[row, col]];

            // Check forward
            for (let i = 1; i < 4; i++) {
                const r = row + dr * i;
                const c = col + dc * i;
                if (r >= 0 && r < ROWS && c >= 0 && c < COLS && board[r][c] === player) {
                    count++;
                    cells.push([r, c]);
                } else break;
            }

            // Check backward
            for (let i = 1; i < 4; i++) {
                const r = row - dr * i;
                const c = col - dc * i;
                if (r >= 0 && r < ROWS && c >= 0 && c < COLS && board[r][c] === player) {
                    count++;
                    cells.push([r, c]);
                } else break;
            }

            if (count >= 4) {
                return cells;
            }
        }
        return null;
    };

    // Check for draw
    const checkDraw = (board) => {
        return board[0].every(cell => cell !== null);
    };

    // Find lowest empty row in column
    const findLowestRow = (col) => {
        for (let row = ROWS - 1; row >= 0; row--) {
            if (board[row][col] === null) return row;
        }
        return -1;
    };

    const handleColumnClick = (col) => {
        if (winner || droppingPiece !== null) return;

        const row = findLowestRow(col);
        if (row === -1) return;

        // Animate piece drop
        setDroppingPiece({ col, targetRow: row, player: currentPlayer });

        // Delay actual board update for animation
        setTimeout(() => {
            const newBoard = board.map(row => [...row]);
            newBoard[row][col] = currentPlayer;
            setBoard(newBoard);
            setDroppingPiece(null);

            const winCells = checkWinner(newBoard, row, col, currentPlayer);
            if (winCells) {
                setWinner(currentPlayer);
                setWinningCells(winCells);
            } else if (checkDraw(newBoard)) {
                setWinner('DRAW');
            } else {
                // Switch player (simulated opponent)
                setCurrentPlayer(currentPlayer === 'RED' ? 'YELLOW' : 'RED');

                // Simulate opponent move
                setTimeout(() => simulateOpponent(newBoard), 600);
            }
        }, 400);
    };

    const simulateOpponent = (currentBoard) => {
        if (winner) return;

        const opponent = currentPlayer === 'RED' ? 'YELLOW' : 'RED';

        // Simple AI: Random valid column
        const validCols = [];
        for (let c = 0; c < COLS; c++) {
            if (currentBoard[0][c] === null) validCols.push(c);
        }

        if (validCols.length === 0) return;

        const col = validCols[Math.floor(Math.random() * validCols.length)];
        const row = currentBoard.findIndex((r, i) => {
            // Find lowest empty row
            for (let ri = ROWS - 1; ri >= 0; ri--) {
                if (currentBoard[ri][col] === null) return ri === i;
            }
            return false;
        });

        let targetRow = -1;
        for (let ri = ROWS - 1; ri >= 0; ri--) {
            if (currentBoard[ri][col] === null) {
                targetRow = ri;
                break;
            }
        }

        if (targetRow === -1) return;

        setDroppingPiece({ col, targetRow, player: opponent });

        setTimeout(() => {
            const newBoard = currentBoard.map(row => [...row]);
            newBoard[targetRow][col] = opponent;
            setBoard(newBoard);
            setDroppingPiece(null);

            const winCells = checkWinner(newBoard, targetRow, col, opponent);
            if (winCells) {
                setWinner(opponent);
                setWinningCells(winCells);
            } else if (checkDraw(newBoard)) {
                setWinner('DRAW');
            } else {
                setCurrentPlayer('RED');
            }
        }, 400);
    };

    const resetGame = () => {
        setBoard(createEmptyBoard());
        setWinner(null);
        setCurrentPlayer('RED');
        setWinningCells([]);
        setDroppingPiece(null);
    };

    const isWinningCell = (row, col) => {
        return winningCells.some(([r, c]) => r === row && c === col);
    };

    const getGhostPosition = () => {
        if (hoverCol === null || winner || droppingPiece) return null;
        const row = findLowestRow(hoverCol);
        return row >= 0 ? { row, col: hoverCol } : null;
    };

    const ghostPos = getGhostPosition();

    return (
        <div className="min-h-screen bg-game-dark text-game-white font-sans flex flex-col items-center justify-center p-6 cursor-none selection:bg-game-red selection:text-black relative overflow-hidden">

            {/* Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-game-dark via-black to-game-dark" />
            <div className="absolute inset-0 opacity-10" style={{
                backgroundImage: `linear-gradient(var(--primary) 1px, transparent 1px), linear-gradient(90deg, var(--primary) 1px, transparent 1px)`,
                backgroundSize: '40px 40px'
            }} />

            {/* Crosshair Cursor */}
            <div ref={cursorRef} className="fixed top-0 left-0 w-8 h-8 pointer-events-none z-[9999] -translate-x-1/2 -translate-y-1/2 border-2 border-game-red bg-transparent rounded-full mix-blend-difference flex items-center justify-center">
                <div className="w-1 h-1 bg-game-red rounded-full" />
            </div>

            {/* Header */}
            <div className="w-full max-w-xl flex justify-between items-center mb-6 relative z-10">
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
                        <span className="text-game-yellow">GRAVITY</span> DROP
                    </h1>
                    <div className="text-[10px] text-game-gray tracking-widest font-mono flex items-center gap-2 justify-end">
                        <Radio className="w-3 h-3 animate-pulse text-green-400" />
                        CONNECT FOUR
                    </div>
                </div>
            </div>

            {/* Player Indicator */}
            <div className="mb-4 flex items-center gap-6 relative z-10">
                <div className={`flex items-center gap-2 px-4 py-2 border transition-all ${currentPlayer === 'RED' ? 'border-game-red bg-game-red/20' : 'border-white/10'}`}>
                    <div className="w-4 h-4 rounded-full bg-game-red" />
                    <span className="text-xs uppercase tracking-widest">PLAYER 1</span>
                </div>
                <div className="text-game-gray text-xs">VS</div>
                <div className={`flex items-center gap-2 px-4 py-2 border transition-all ${currentPlayer === 'YELLOW' ? 'border-game-yellow bg-game-yellow/20' : 'border-white/10'}`}>
                    <div className="w-4 h-4 rounded-full bg-game-yellow" />
                    <span className="text-xs uppercase tracking-widest">PLAYER 2</span>
                </div>
            </div>

            {/* Game Board */}
            <div className="relative z-10">
                <div className="absolute -inset-4 bg-gradient-to-r from-game-red via-game-yellow to-game-red opacity-20 blur-xl" />
                <div className="relative bg-blue-900 p-3 rounded-lg border-4 border-blue-800 shadow-2xl">
                    {/* Column hover zones */}
                    <div className="absolute -top-12 left-0 right-0 flex">
                        {Array(COLS).fill(null).map((_, col) => (
                            <div
                                key={col}
                                className="flex-1 h-12 flex items-center justify-center cursor-pointer"
                                onMouseEnter={() => setHoverCol(col)}
                                onMouseLeave={() => setHoverCol(null)}
                                onClick={() => handleColumnClick(col)}
                            >
                                {hoverCol === col && !winner && !droppingPiece && board[0][col] === null && (
                                    <div className={`w-10 h-10 rounded-full border-2 ${currentPlayer === 'RED' ? 'border-game-red bg-game-red/30' : 'border-game-yellow bg-game-yellow/30'} animate-bounce`} />
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Board Grid */}
                    <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${COLS}, 1fr)` }}>
                        {board.map((row, rowIdx) => (
                            row.map((cell, colIdx) => (
                                <div
                                    key={`${rowIdx}-${colIdx}`}
                                    className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-game-dark/90 flex items-center justify-center transition-all duration-200 cursor-pointer relative overflow-hidden
                                        ${isWinningCell(rowIdx, colIdx) ? 'ring-2 ring-white ring-offset-2 ring-offset-blue-900' : ''}
                                    `}
                                    onMouseEnter={() => setHoverCol(colIdx)}
                                    onMouseLeave={() => setHoverCol(null)}
                                    onClick={() => handleColumnClick(colIdx)}
                                >
                                    {/* Ghost piece preview */}
                                    {ghostPos && ghostPos.row === rowIdx && ghostPos.col === colIdx && !cell && (
                                        <div className={`absolute inset-2 rounded-full opacity-30 ${currentPlayer === 'RED' ? 'bg-game-red' : 'bg-game-yellow'}`} />
                                    )}

                                    {/* Actual piece */}
                                    {cell && (
                                        <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full ${cell === 'RED' ? 'bg-gradient-to-br from-red-400 to-red-600 shadow-[0_0_20px_rgba(255,70,85,0.5)]' : 'bg-gradient-to-br from-yellow-300 to-yellow-500 shadow-[0_0_20px_rgba(252,227,0,0.5)]'} 
                                            ${isWinningCell(rowIdx, colIdx) ? 'animate-pulse scale-105' : ''}
                                        `} />
                                    )}

                                    {/* Dropping animation */}
                                    {droppingPiece && droppingPiece.col === colIdx && droppingPiece.targetRow === rowIdx && (
                                        <div className={`absolute w-10 h-10 sm:w-12 sm:h-12 rounded-full animate-in slide-in-from-top duration-300
                                            ${droppingPiece.player === 'RED' ? 'bg-gradient-to-br from-red-400 to-red-600' : 'bg-gradient-to-br from-yellow-300 to-yellow-500'}`}
                                        />
                                    )}
                                </div>
                            ))
                        ))}
                    </div>
                </div>

                {/* Winner Overlay */}
                {winner && (
                    <div className="absolute inset-0 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center z-20 animate-in fade-in zoom-in duration-300 rounded-lg">
                        {winner === 'DRAW' ? (
                            <>
                                <div className="text-3xl font-black italic uppercase text-game-white mb-2">DRAW!</div>
                                <div className="text-xs text-game-gray mb-6">NO WINNER</div>
                            </>
                        ) : (
                            <>
                                <div className={`w-16 h-16 rounded-full mb-4 ${winner === 'RED' ? 'bg-game-red shadow-[0_0_40px_rgba(255,70,85,0.6)]' : 'bg-game-yellow shadow-[0_0_40px_rgba(252,227,0,0.6)]'}`} />
                                <div className={`text-3xl font-black italic uppercase mb-2 ${winner === 'RED' ? 'text-game-red' : 'text-game-yellow'}`}>
                                    {winner === 'RED' ? 'PLAYER 1' : 'PLAYER 2'} WINS!
                                </div>
                                <div className="text-xs text-game-gray mb-6">FOUR CONNECTED</div>
                            </>
                        )}

                        <button
                            onClick={resetGame}
                            className="flex items-center gap-2 px-8 py-3 bg-white text-black font-bold uppercase tracking-widest hover:bg-game-red hover:text-white transition-colors clip-path-slant"
                        >
                            <RotateCcw className="w-4 h-4" /> Play Again
                        </button>
                    </div>
                )}
            </div>

            {/* Turn Indicator */}
            {!winner && (
                <div className="mt-6 relative z-10">
                    <div className={`px-6 py-3 border transition-all ${currentPlayer === 'RED' ? 'border-game-red bg-game-red/10 text-game-red' : 'border-game-yellow bg-game-yellow/10 text-game-yellow'}`}>
                        <div className="text-xs uppercase tracking-widest font-mono flex items-center gap-2">
                            <div className={`w-3 h-3 rounded-full ${currentPlayer === 'RED' ? 'bg-game-red' : 'bg-game-yellow'} animate-pulse`} />
                            {currentPlayer === 'RED' ? 'PLAYER 1' : 'PLAYER 2'}'S TURN
                        </div>
                    </div>
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
