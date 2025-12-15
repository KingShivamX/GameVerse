import React, { useState, useEffect, useRef, useCallback, useLayoutEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { gsap } from 'gsap';
import { ArrowLeft, Palette, RotateCcw, Play, Pause, Zap } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 500;
const PADDLE_WIDTH = 12;
const PADDLE_HEIGHT = 100;
const BALL_SIZE = 12;
const PADDLE_SPEED = 8;
const INITIAL_BALL_SPEED = 6;
const MAX_SCORE = 5;

export default function MultiplayerPong() {
    const navigate = useNavigate();
    const { roomId } = useParams();
    const { theme, cycleTheme } = useTheme();
    const canvasRef = useRef(null);
    const cursorRef = useRef(null);
    const animationRef = useRef(null);

    const [gameState, setGameState] = useState('waiting'); // waiting, playing, paused, finished
    const [scores, setScores] = useState({ player1: 0, player2: 0 });
    const [winner, setWinner] = useState(null);

    // Game objects (using refs for animation loop)
    const paddle1Ref = useRef({ y: CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2 });
    const paddle2Ref = useRef({ y: CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2 });
    const ballRef = useRef({
        x: CANVAS_WIDTH / 2,
        y: CANVAS_HEIGHT / 2,
        vx: INITIAL_BALL_SPEED,
        vy: INITIAL_BALL_SPEED * (Math.random() > 0.5 ? 1 : -1) * 0.5
    });
    const keysRef = useRef({});
    const scoresRef = useRef({ player1: 0, player2: 0 });

    // Custom cursor
    useLayoutEffect(() => {
        const cursor = cursorRef.current;
        const moveCursor = (e) => {
            gsap.to(cursor, { x: e.clientX, y: e.clientY, duration: 0.1, ease: 'power2.out' });
        };
        window.addEventListener('mousemove', moveCursor);
        return () => window.removeEventListener('mousemove', moveCursor);
    }, []);

    // Keyboard handling
    useEffect(() => {
        const handleKeyDown = (e) => {
            keysRef.current[e.key] = true;

            // Pause/Resume with Space
            if (e.code === 'Space') {
                if (gameState === 'waiting') {
                    startGame();
                } else if (gameState === 'playing') {
                    setGameState('paused');
                } else if (gameState === 'paused') {
                    setGameState('playing');
                }
            }
        };

        const handleKeyUp = (e) => {
            keysRef.current[e.key] = false;
        };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, [gameState]);

    const resetBall = (direction = 1) => {
        ballRef.current = {
            x: CANVAS_WIDTH / 2,
            y: CANVAS_HEIGHT / 2,
            vx: INITIAL_BALL_SPEED * direction,
            vy: INITIAL_BALL_SPEED * (Math.random() - 0.5)
        };
    };

    const startGame = () => {
        resetBall(Math.random() > 0.5 ? 1 : -1);
        paddle1Ref.current.y = CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2;
        paddle2Ref.current.y = CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2;
        setScores({ player1: 0, player2: 0 });
        scoresRef.current = { player1: 0, player2: 0 };
        setWinner(null);
        setGameState('playing');
    };

    const gameLoop = useCallback(() => {
        if (gameState !== 'playing') return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const ball = ballRef.current;
        const paddle1 = paddle1Ref.current;
        const paddle2 = paddle2Ref.current;
        const keys = keysRef.current;

        // Move paddles
        if (keys['w'] || keys['W']) paddle1.y = Math.max(0, paddle1.y - PADDLE_SPEED);
        if (keys['s'] || keys['S']) paddle1.y = Math.min(CANVAS_HEIGHT - PADDLE_HEIGHT, paddle1.y + PADDLE_SPEED);
        if (keys['ArrowUp']) paddle2.y = Math.max(0, paddle2.y - PADDLE_SPEED);
        if (keys['ArrowDown']) paddle2.y = Math.min(CANVAS_HEIGHT - PADDLE_HEIGHT, paddle2.y + PADDLE_SPEED);

        // Move ball
        ball.x += ball.vx;
        ball.y += ball.vy;

        // Ball collision with top/bottom
        if (ball.y <= 0 || ball.y >= CANVAS_HEIGHT - BALL_SIZE) {
            ball.vy *= -1;
            ball.y = ball.y <= 0 ? 0 : CANVAS_HEIGHT - BALL_SIZE;
        }

        // Ball collision with paddles
        // Left paddle (Player 1)
        if (ball.x <= PADDLE_WIDTH + 20 &&
            ball.y + BALL_SIZE >= paddle1.y &&
            ball.y <= paddle1.y + PADDLE_HEIGHT &&
            ball.vx < 0) {
            ball.vx *= -1.05; // Speed increase
            ball.x = PADDLE_WIDTH + 20;
            // Add angle based on where ball hits paddle
            const hitPos = (ball.y + BALL_SIZE / 2 - paddle1.y) / PADDLE_HEIGHT;
            ball.vy = (hitPos - 0.5) * 10;
        }

        // Right paddle (Player 2)
        if (ball.x >= CANVAS_WIDTH - PADDLE_WIDTH - 20 - BALL_SIZE &&
            ball.y + BALL_SIZE >= paddle2.y &&
            ball.y <= paddle2.y + PADDLE_HEIGHT &&
            ball.vx > 0) {
            ball.vx *= -1.05; // Speed increase
            ball.x = CANVAS_WIDTH - PADDLE_WIDTH - 20 - BALL_SIZE;
            const hitPos = (ball.y + BALL_SIZE / 2 - paddle2.y) / PADDLE_HEIGHT;
            ball.vy = (hitPos - 0.5) * 10;
        }

        // Scoring
        if (ball.x < 0) {
            scoresRef.current.player2++;
            setScores({ ...scoresRef.current });
            if (scoresRef.current.player2 >= MAX_SCORE) {
                setWinner('PLAYER 2');
                setGameState('finished');
            } else {
                resetBall(1);
            }
        }

        if (ball.x > CANVAS_WIDTH) {
            scoresRef.current.player1++;
            setScores({ ...scoresRef.current });
            if (scoresRef.current.player1 >= MAX_SCORE) {
                setWinner('PLAYER 1');
                setGameState('finished');
            } else {
                resetBall(-1);
            }
        }

        // Clear canvas
        ctx.fillStyle = theme.colors['--bg-dark'];
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        // Draw center line
        ctx.setLineDash([10, 10]);
        ctx.strokeStyle = 'rgba(255,255,255,0.1)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(CANVAS_WIDTH / 2, 0);
        ctx.lineTo(CANVAS_WIDTH / 2, CANVAS_HEIGHT);
        ctx.stroke();
        ctx.setLineDash([]);

        // Draw paddles with glow
        ctx.shadowColor = theme.colors['--primary'];
        ctx.shadowBlur = 15;
        ctx.fillStyle = theme.colors['--primary'];
        ctx.fillRect(20, paddle1.y, PADDLE_WIDTH, PADDLE_HEIGHT);

        ctx.shadowColor = theme.colors['--secondary'];
        ctx.fillStyle = theme.colors['--secondary'];
        ctx.fillRect(CANVAS_WIDTH - PADDLE_WIDTH - 20, paddle2.y, PADDLE_WIDTH, PADDLE_HEIGHT);

        // Draw ball with glow
        ctx.shadowColor = '#FFFFFF';
        ctx.shadowBlur = 20;
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(ball.x + BALL_SIZE / 2, ball.y + BALL_SIZE / 2, BALL_SIZE / 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Draw scores
        ctx.font = 'bold 48px Inter';
        ctx.fillStyle = 'rgba(255,255,255,0.2)';
        ctx.textAlign = 'center';
        ctx.fillText(scoresRef.current.player1.toString(), CANVAS_WIDTH / 4, 70);
        ctx.fillText(scoresRef.current.player2.toString(), (CANVAS_WIDTH / 4) * 3, 70);

        animationRef.current = requestAnimationFrame(gameLoop);
    }, [gameState, theme]);

    // Start/stop game loop
    useEffect(() => {
        if (gameState === 'playing') {
            animationRef.current = requestAnimationFrame(gameLoop);
        }
        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, [gameState, gameLoop]);

    // Initial canvas render
    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = theme.colors['--bg-dark'];
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    }, [theme]);

    return (
        <div className="min-h-screen bg-game-dark text-game-white font-sans flex flex-col items-center justify-center p-6 cursor-none selection:bg-game-red selection:text-black relative overflow-hidden">

            {/* Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-game-dark via-black to-game-dark" />

            {/* Crosshair Cursor */}
            <div ref={cursorRef} className="fixed top-0 left-0 w-8 h-8 pointer-events-none z-[9999] -translate-x-1/2 -translate-y-1/2 border-2 border-game-red bg-transparent rounded-full mix-blend-difference flex items-center justify-center">
                <div className="w-1 h-1 bg-game-red rounded-full" />
            </div>

            {/* Header */}
            <div className="w-full max-w-4xl flex justify-between items-center mb-6 relative z-10">
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

                <div className="text-center">
                    <h1 className="text-2xl font-black italic tracking-tighter uppercase flex items-center gap-2 justify-center">
                        <Zap className="w-6 h-6 text-game-yellow" />
                        <span className="text-game-yellow">NEON</span> PONG
                    </h1>
                    <div className="text-[10px] text-game-gray tracking-widest font-mono">
                        FIRST TO {MAX_SCORE} WINS
                    </div>
                </div>

                <div className="text-right text-xs text-game-gray">
                    <div className="text-game-red">P1: W/S</div>
                    <div className="text-game-yellow">P2: ↑/↓</div>
                </div>
            </div>

            {/* Score Display */}
            <div className="mb-4 flex items-center gap-12 relative z-10">
                <div className="text-center">
                    <div className="text-5xl font-black text-game-red" style={{ textShadow: '0 0 20px rgba(255,70,85,0.5)' }}>
                        {scores.player1}
                    </div>
                    <div className="text-[10px] text-game-gray uppercase tracking-widest mt-1">PLAYER 1</div>
                </div>
                <div className="text-2xl text-game-gray font-bold">:</div>
                <div className="text-center">
                    <div className="text-5xl font-black text-game-yellow" style={{ textShadow: '0 0 20px rgba(252,227,0,0.5)' }}>
                        {scores.player2}
                    </div>
                    <div className="text-[10px] text-game-gray uppercase tracking-widest mt-1">PLAYER 2</div>
                </div>
            </div>

            {/* Game Canvas */}
            <div className="relative z-10">
                <div className="absolute -inset-2 bg-gradient-to-r from-game-red via-game-yellow to-game-red opacity-30 blur-xl" />
                <div className="relative border-2 border-white/20 bg-black overflow-hidden" style={{ borderRadius: '4px' }}>
                    <canvas
                        ref={canvasRef}
                        width={CANVAS_WIDTH}
                        height={CANVAS_HEIGHT}
                        className="block"
                    />

                    {/* Start Overlay */}
                    {gameState === 'waiting' && (
                        <div className="absolute inset-0 bg-black/90 backdrop-blur-sm flex flex-col items-center justify-center z-10 animate-in fade-in duration-300">
                            <Zap className="w-16 h-16 text-game-yellow mb-4" />
                            <div className="text-3xl font-black italic uppercase mb-4">READY TO PLAY?</div>
                            <button
                                onClick={startGame}
                                className="flex items-center gap-2 px-8 py-4 bg-game-yellow text-black font-black uppercase tracking-widest hover:bg-white transition-colors clip-path-slant"
                            >
                                <Play className="w-5 h-5" /> START GAME
                            </button>
                            <div className="mt-6 text-xs text-game-gray">Or press SPACE</div>
                        </div>
                    )}

                    {/* Paused Overlay */}
                    {gameState === 'paused' && (
                        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center z-10 animate-in fade-in duration-300">
                            <Pause className="w-16 h-16 text-game-gray mb-4" />
                            <div className="text-3xl font-black italic uppercase mb-4">PAUSED</div>
                            <button
                                onClick={() => setGameState('playing')}
                                className="flex items-center gap-2 px-8 py-3 bg-white text-black font-bold uppercase tracking-widest hover:bg-game-yellow transition-colors clip-path-slant"
                            >
                                <Play className="w-4 h-4" /> RESUME
                            </button>
                            <div className="mt-4 text-xs text-game-gray">Or press SPACE</div>
                        </div>
                    )}

                    {/* Winner Overlay */}
                    {gameState === 'finished' && winner && (
                        <div className="absolute inset-0 bg-black/95 backdrop-blur-md flex flex-col items-center justify-center z-10 animate-in fade-in zoom-in duration-300">
                            <div className={`text-5xl font-black italic uppercase mb-2 ${winner === 'PLAYER 1' ? 'text-game-red' : 'text-game-yellow'}`}
                                style={{ textShadow: `0 0 30px ${winner === 'PLAYER 1' ? 'rgba(255,70,85,0.6)' : 'rgba(252,227,0,0.6)'}` }}>
                                {winner} WINS!
                            </div>
                            <div className="text-2xl text-game-gray font-mono mb-8">
                                {scores.player1} - {scores.player2}
                            </div>
                            <button
                                onClick={startGame}
                                className="flex items-center gap-2 px-8 py-3 bg-white text-black font-bold uppercase tracking-widest hover:bg-game-red hover:text-white transition-colors clip-path-slant"
                            >
                                <RotateCcw className="w-4 h-4" /> REMATCH
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Controls Info */}
            <div className="mt-6 flex gap-8 text-xs text-game-gray relative z-10">
                <div className="flex items-center gap-2">
                    <kbd className="px-2 py-1 bg-white/10 border border-game-red/50 text-game-red rounded">W</kbd>
                    <kbd className="px-2 py-1 bg-white/10 border border-game-red/50 text-game-red rounded">S</kbd>
                    <span className="ml-2">Player 1</span>
                </div>
                <div className="flex items-center gap-2">
                    <kbd className="px-2 py-1 bg-white/10 border border-game-yellow/50 text-game-yellow rounded">↑</kbd>
                    <kbd className="px-2 py-1 bg-white/10 border border-game-yellow/50 text-game-yellow rounded">↓</kbd>
                    <span className="ml-2">Player 2</span>
                </div>
                <div className="flex items-center gap-2">
                    <kbd className="px-3 py-1 bg-white/10 border border-white/20 rounded">SPACE</kbd>
                    <span className="ml-2">Pause</span>
                </div>
            </div>

            <style>{`
                .clip-path-slant {
                    clip-path: polygon(10% 0, 100% 0, 100% 70%, 90% 100%, 0 100%, 0 30%);
                }
            `}</style>
        </div>
    );
}
