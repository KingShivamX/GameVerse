import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { gsap } from 'gsap';
import { ArrowLeft, Trophy, Activity, AlertTriangle, Palette } from 'lucide-react';
import axios from 'axios';
import { useAudio } from '../context/AudioContext';
import { useTheme } from '../context/ThemeContext';

const GRID_SIZE = 20;
const CELL_SIZE = 20; // Will be dynamic based on container
const SPEED = 100;

export default function SnakeGame() {
    const { playArcadePoint, playError, playClick } = useAudio();
    const { theme, cycleTheme } = useTheme();

    const navigate = useNavigate();
    const canvasRef = useRef(null);

    // Game State
    const [snake, setSnake] = useState([{ x: 10, y: 10 }]);
    const [food, setFood] = useState({ x: 15, y: 15 });
    const [direction, setDirection] = useState({ x: 0, y: 0 }); // Start static
    const [score, setScore] = useState(0);
    const [highScore, setHighScore] = useState(0);
    const [gameOver, setGameOver] = useState(false);
    const [gameStarted, setGameStarted] = useState(false);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState(null);

    // Fetch High Score
    useEffect(() => {
        let username = localStorage.getItem('username');
        if (!username) {
            // Optional: Redirect to login or show guest mode warning
            // navigate('/login');
            return;
        }
        username = username.trim();

        const fetchStats = async () => {
            try {
                const res = await axios.get(`/api/users/${username}/stats`);
                setHighScore(res.data.snakeHighScore || 0);
            } catch (e) {
                console.error("Failed to fetch stats", e);
            }
        };
        fetchStats();
    }, [navigate]);

    // Refs for mutable state in the loop
    const snakeRef = useRef(snake);
    const foodRef = useRef(food);
    const directionRef = useRef(direction);
    const gameLoopRef = useRef(null);
    const scoreRef = useRef(0);
    const gameOverRef = useRef(false);

    const startTimeRef = useRef(Date.now());

    const initGame = useCallback(() => {
        setSnake([{ x: 10, y: 10 }]);
        setFood({ x: 15, y: 15 });
        setDirection({ x: 1, y: 0 });
        setScore(0);
        setGameOver(false);
        setGameStarted(true);
        setIsSubmitting(false);

        snakeRef.current = [{ x: 10, y: 10 }];
        foodRef.current = { x: 15, y: 15 };
        directionRef.current = { x: 1, y: 0 };
        scoreRef.current = 0;
        gameOverRef.current = false;
        startTimeRef.current = Date.now(); // Start Timer

        if (gameLoopRef.current) clearInterval(gameLoopRef.current);
        gameLoopRef.current = setInterval(gameLoop, SPEED);
    }, []);

    const endGame = async () => {
        playError();
        clearInterval(gameLoopRef.current);
        setGameOver(true);
        gameOverRef.current = true;
        setGameStarted(false);

        // Calculate Duration
        const durationSeconds = (Date.now() - startTimeRef.current) / 1000;

        // Submit Score
        let username = localStorage.getItem('username');
        if (!username) {
            setSubmitError("GUEST MODE - SCORE NOT SAVED");
            return;
        }
        username = username.trim();

        setIsSubmitting(true);
        try {
            console.log("Submitting score for", username, scoreRef.current);
            const res = await axios.post('/api/games/submit', {
                username,
                game: 'SNAKE',
                score: scoreRef.current,
                duration: durationSeconds, // Send Duration
                result: 'COMPLETED'
            });

            // Backend returns Update User object
            if (res.data) {
                // If the new score is higher, backend updates it. 
                // We rely on backend response for the high score.
                const newHigh = res.data.snakeHighScore !== undefined ? res.data.snakeHighScore : highScore;
                setHighScore(newHigh);
            }
        } catch (e) {
            console.error("Score submission failed", e);
            setSubmitError("CONNECTION LOST // SCORE PACKET DROPPED");
        } finally {
            setIsSubmitting(false);
        }
    };

    const gameLoop = () => {
        if (gameOverRef.current) return;

        const head = { ...snakeRef.current[0] };
        head.x += directionRef.current.x;
        head.y += directionRef.current.y;

        // Collision Check (Walls)
        if (head.x < 0 || head.x >= 30 || head.y < 0 || head.y >= 20) { // 30x20 Grid
            endGame();
            return;
        }

        // Collision Check (Self)
        if (snakeRef.current.some(segment => segment.x === head.x && segment.y === head.y)) {
            endGame();
            return;
        }

        const newSnake = [head, ...snakeRef.current];

        // Food Check
        if (head.x === foodRef.current.x && head.y === foodRef.current.y) {
            playArcadePoint();
            scoreRef.current += 10;
            setScore(scoreRef.current);
            // New Food
            foodRef.current = {
                x: Math.floor(Math.random() * 30),
                y: Math.floor(Math.random() * 20)
            };
            setFood(foodRef.current);
        } else {
            newSnake.pop();
        }

        snakeRef.current = newSnake;
        setSnake(newSnake);
    };

    // Input Handling
    useEffect(() => {
        const handleKey = (e) => {
            if (!gameStarted && e.code === 'Space') {
                initGame();
                return;
            }
            if (!gameStarted) return;

            switch (e.key) {
                case 'ArrowUp': if (directionRef.current.y === 0) directionRef.current = { x: 0, y: -1 }; break;
                case 'ArrowDown': if (directionRef.current.y === 0) directionRef.current = { x: 0, y: 1 }; break;
                case 'ArrowLeft': if (directionRef.current.x === 0) directionRef.current = { x: -1, y: 0 }; break;
                case 'ArrowRight': if (directionRef.current.x === 0) directionRef.current = { x: 1, y: 0 }; break;
            }
        };
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [gameStarted, initGame]);

    // Render Logic
    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');

        // Clear
        ctx.fillStyle = theme.colors['--bg-dark']; // Dynamic BG
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw Grid (Subtle)
        ctx.strokeStyle = theme.colors['--border'];
        ctx.lineWidth = 1;
        for (let i = 0; i <= 30; i++) {
            ctx.beginPath();
            ctx.moveTo(i * 20, 0);
            ctx.lineTo(i * 20, 400);
            ctx.stroke();
        }
        for (let i = 0; i <= 20; i++) {
            ctx.beginPath();
            ctx.moveTo(0, i * 20);
            ctx.lineTo(600, i * 20);
            ctx.stroke();
        }

        // Draw Food
        ctx.fillStyle = theme.colors['--secondary'];
        ctx.shadowColor = theme.colors['--secondary'];
        ctx.shadowBlur = 10;
        ctx.fillRect(food.x * 20, food.y * 20, 18, 18);
        ctx.shadowBlur = 0;

        // Draw Snake
        snake.forEach((segment, i) => {
            ctx.fillStyle = i === 0 ? theme.colors['--text-main'] : theme.colors['--primary']; // Head Text/White, Body Primary
            ctx.fillRect(segment.x * 20, segment.y * 20, 18, 18);
        });

    }, [snake, food, theme]);

    return (
        <div className="min-h-screen bg-game-dark text-game-white font-mono flex flex-col items-center justify-center p-10 cursor-none selection:bg-game-red selection:text-black">

            {/* Header */}
            <div className="w-full max-w-4xl flex justify-between items-center mb-8">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/games')}
                        className="flex items-center gap-2 text-game-gray hover:text-game-red transition-colors text-xs uppercase tracking-widest clip-path-slant bg-white/5 py-2 px-4"
                    >
                        <ArrowLeft className="w-4 h-4" /> Abort
                    </button>
                    <button
                        onClick={cycleTheme}
                        className="flex items-center justify-center text-game-gray hover:text-game-red transition-colors bg-white/5 w-10 h-8 clip-path-slant"
                        title={`Theme: ${theme.name}`}
                    >
                        <Palette className="w-4 h-4" />
                    </button>
                </div>

                <div className="text-center">
                    <h1 className="text-3xl font-black italic tracking-tighter uppercase text-game-red">SNAKE <span className="text-game-white">PROTOCOL</span></h1>
                    <div className="text-xs text-game-gray tracking-[0.3em]">SECURE CHANNEL ESTABLISHED</div>
                </div>
                <div className="bg-game-red/10 border border-game-red/50 px-6 py-2 clip-path-slant flex flex-col items-end">
                    <div className="text-[10px] text-game-gray uppercase tracking-widest">Score Data</div>
                    <div className="text-2xl font-bold text-game-yellow">{score}</div>
                    <div className="text-[10px] text-game-red font-bold">MAX: {highScore}</div>
                </div>
            </div>

            {/* Game Container */}
            <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-game-red to-game-yellow opacity-30 blur group-hover:opacity-50 transition-opacity duration-500 rounded-lg"></div>
                <div className="relative border-2 border-white/10 bg-[#000] p-1 clip-path-slant">
                    <canvas
                        ref={canvasRef}
                        width={600}
                        height={400}
                        className="bg-game-dark cursor-none"
                    />

                    {/* Overlay: Game Start */}
                    {!gameStarted && !gameOver && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm z-10">
                            <Activity className="w-16 h-16 text-game-red mb-4 animate-pulse" />
                            <div className="text-4xl font-black uppercase italic text-game-white mb-2">Initialize?</div>
                            <div className="text-sm text-game-yellow font-mono tracking-widest animate-pulse">[ PRESS SPACE TO ENGAGE ]</div>
                            <div className="mt-8 text-xs text-game-gray max-w-xs text-center">
                                Use Arrow Keys. Acquire Data Packets. Avoid Grid Walls.
                            </div>
                        </div>
                    )}

                    {/* Overlay: Game Over */}
                    {gameOver && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-900/90 backdrop-blur-md z-20">
                            <AlertTriangle className="w-16 h-16 text-white mb-4" />
                            <div className="text-5xl font-black uppercase italic text-white mb-2 drop-shadow-md">TERMINATED</div>
                            <div className="text-2xl font-mono text-game-yellow mb-6">FINAL SCORE: {score}</div>

                            {isSubmitting ? (
                                <div className="text-xs text-white tracking-widest animate-pulse">UPLOADING TO MAINFRAME...</div>
                            ) : submitError ? (
                                <div className="text-xs text-red-500 tracking-widest font-bold mb-4">{submitError}</div>
                            ) : (
                                <button
                                    onClick={initGame}
                                    className="px-8 py-3 bg-white text-black font-bold uppercase tracking-widest hover:bg-game-yellow transition-colors clip-path-slant"
                                >
                                    Re-Initialize
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <div className="mt-8 text-[10px] text-game-gray tracking-widest uppercase">
                System ID: {localStorage.getItem('username') || 'UNKNOWN'} // Global Rank Impact: ENABLED
            </div>

        </div>
    );
}
