import React, { createContext, useContext, useRef, useEffect } from 'react';

const AudioContext = createContext(null);

export const useAudio = () => useContext(AudioContext);

export const AudioProvider = ({ children }) => {
    const audioCtxRef = useRef(null);
    const masterGainRef = useRef(null);

    // Initialize Audio Context lazily (browsers block autoplay)
    const initAudio = () => {
        if (!audioCtxRef.current) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            audioCtxRef.current = new AudioContext();

            // Dynamics Compressor (Safety Limiter)
            const compressor = audioCtxRef.current.createDynamicsCompressor();
            compressor.threshold.setValueAtTime(-24, audioCtxRef.current.currentTime);
            compressor.knee.setValueAtTime(30, audioCtxRef.current.currentTime);
            compressor.ratio.setValueAtTime(12, audioCtxRef.current.currentTime);
            compressor.attack.setValueAtTime(0.003, audioCtxRef.current.currentTime);
            compressor.release.setValueAtTime(0.25, audioCtxRef.current.currentTime);
            compressor.connect(audioCtxRef.current.destination);

            // Master Volume
            masterGainRef.current = audioCtxRef.current.createGain();
            masterGainRef.current.gain.value = 3.0; // SUPERCHARGED AUDIO (300%)
            masterGainRef.current.connect(compressor);
        }
        if (audioCtxRef.current.state === 'suspended') {
            audioCtxRef.current.resume();
        }
    };

    // Global Click Listener for "Max Audio" Effect
    useEffect(() => {
        const handleGlobalClick = (e) => {
            const target = e.target.closest('button, a, input, [role="button"], .clickable');
            if (target) {
                playClick();
            }
        };
        window.addEventListener('click', handleGlobalClick);
        return () => window.removeEventListener('click', handleGlobalClick);
    }, []);

    const playTone = (freq, type, duration, startTime = 0) => {
        try {
            if (!audioCtxRef.current) initAudio();
            const ctx = audioCtxRef.current;
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.type = type;
            osc.frequency.setValueAtTime(freq, ctx.currentTime + startTime);

            gain.gain.setValueAtTime(0.1, ctx.currentTime + startTime);
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + startTime + duration);

            osc.connect(gain);
            gain.connect(masterGainRef.current);

            osc.start(ctx.currentTime + startTime);
            osc.stop(ctx.currentTime + startTime + duration);
        } catch (e) { }
    };

    // --- SFX PRESETS ---

    const playHover = () => {
        // High-tech, short, airy chirp
        try {
            if (!audioCtxRef.current) initAudio();
            const ctx = audioCtxRef.current;
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(800, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.05);

            gain.gain.setValueAtTime(0.05, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);

            osc.connect(gain);
            gain.connect(masterGainRef.current);

            osc.start();
            osc.stop(ctx.currentTime + 0.05);
        } catch (e) {
            // ignore audio errors
        }
    };

    const playClick = () => {
        // Mechanical thud
        try {
            if (!audioCtxRef.current) initAudio();
            const ctx = audioCtxRef.current;
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.type = 'triangle';
            osc.frequency.setValueAtTime(150, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(50, ctx.currentTime + 0.1);

            gain.gain.setValueAtTime(0.1, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);

            osc.connect(gain);
            gain.connect(masterGainRef.current);

            osc.start();
            osc.stop(ctx.currentTime + 0.1);
        } catch (e) { }
    };

    const playSuccess = () => {
        // Ascending arpeggio
        playTone(440, 'sine', 0.1, 0);
        playTone(554, 'sine', 0.1, 0.1);
        playTone(659, 'sine', 0.2, 0.2);
    };

    const playError = () => {
        // Descending buzz
        try {
            if (!audioCtxRef.current) initAudio();
            const ctx = audioCtxRef.current;
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(150, ctx.currentTime);
            osc.frequency.linearRampToValueAtTime(50, ctx.currentTime + 0.3);

            gain.gain.setValueAtTime(0.1, ctx.currentTime);
            gain.gain.linearRampToValueAtTime(0.001, ctx.currentTime + 0.3);

            osc.connect(gain);
            gain.connect(masterGainRef.current);

            osc.start();
            osc.stop(ctx.currentTime + 0.3);
        } catch (e) { }
    };

    const playArcadePoint = () => {
        // Retro 8-bit coin sound
        playTone(900, 'square', 0.1, 0);
        playTone(1200, 'square', 0.1, 0.1);
    };

    // --- BACKGROUND MUSIC (BGM) ---
    const bgmSourceRef = useRef(null);
    const bgmGainRef = useRef(null);
    const bgmRequestIdRef = useRef(0); // Generation ID to handle async races

    const startBGM = async (trackPath) => {
        try {
            // Stop existing IMMEDIATELY (Simulate reload behavior)
            // This increments the generation ID, cancelling any previous pending loads
            stopBGM();

            // NOW generate the new ID for this request
            const currentId = ++bgmRequestIdRef.current;

            if (!audioCtxRef.current) initAudio();
            const ctx = audioCtxRef.current;

            // Load Audio File
            const response = await fetch(trackPath);
            const arrayBuffer = await response.arrayBuffer();

            // Check cancellation before decoding (long operation)
            if (currentId !== bgmRequestIdRef.current) return;

            const audioBuffer = await ctx.decodeAudioData(arrayBuffer);

            // Check cancellation again
            if (currentId !== bgmRequestIdRef.current) return;

            // Create Nodes
            const source = ctx.createBufferSource();
            source.buffer = audioBuffer;
            source.loop = true;

            const gainNode = ctx.createGain();
            gainNode.gain.value = 0; // Start silent for fade-in

            // Connect
            source.connect(gainNode).connect(masterGainRef.current);

            // Start
            source.start();

            // Fade In
            gainNode.gain.linearRampToValueAtTime(0.6, ctx.currentTime + 3);

            // Store refs
            bgmSourceRef.current = source;
            bgmGainRef.current = gainNode;

        } catch (e) {
            console.error("Failed to start BGM:", e);
        }
    };

    const stopBGM = () => {
        try {
            // Increment ID to cancel any pending loads
            bgmRequestIdRef.current++;

            // Capture current nodes
            const source = bgmSourceRef.current;
            const gain = bgmGainRef.current;

            if (source && gain) {
                const ctx = audioCtxRef.current;
                const now = ctx?.currentTime || 0;

                // INSTANT CUT (Per user request: "stop at moment we leave")
                // No fade out, just hard stop to ensure no bleed over
                try {
                    gain.gain.cancelScheduledValues(now);
                    gain.gain.setValueAtTime(0, now);
                } catch (e) { }

                try {
                    source.stop();
                    source.disconnect();
                    gain.disconnect();
                } catch (e) { }

                bgmSourceRef.current = null;
                bgmGainRef.current = null;
            }
        } catch (e) {
            console.error("Failed to stop BGM:", e);
        }
    };

    const playLoginSuccess = () => {
        // SCIFI POWER UP SEQUENCE
        try {
            if (!audioCtxRef.current) initAudio();
            const ctx = audioCtxRef.current;

            // 1. Low Drone (Power Base)
            const osc1 = ctx.createOscillator();
            const gain1 = ctx.createGain();
            osc1.type = 'sawtooth';
            osc1.frequency.setValueAtTime(50, ctx.currentTime);
            osc1.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 1.5);
            gain1.gain.setValueAtTime(0.2, ctx.currentTime);
            gain1.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 1.5);

            // 2. High Shimmer (Teleport effect)
            const osc2 = ctx.createOscillator();
            const gain2 = ctx.createGain();
            osc2.type = 'sine';
            osc2.frequency.setValueAtTime(1000, ctx.currentTime);
            osc2.frequency.linearRampToValueAtTime(2000, ctx.currentTime + 0.5);
            osc2.frequency.linearRampToValueAtTime(500, ctx.currentTime + 1.0);
            gain2.gain.setValueAtTime(0.05, ctx.currentTime);
            gain2.gain.linearRampToValueAtTime(0.2, ctx.currentTime + 0.5);
            gain2.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 1.0);

            // Connect
            osc1.connect(gain1).connect(masterGainRef.current);
            osc2.connect(gain2).connect(masterGainRef.current);

            osc1.start();
            osc2.start();

            osc1.stop(ctx.currentTime + 1.5);
            osc2.stop(ctx.currentTime + 1.5);

            // 3. Final Clang
            setTimeout(() => {
                try {
                    playTone(880, 'square', 0.3);
                } catch (e) { }
            }, 800);

        } catch (e) { }
    };

    // --- MASTER MUTE ---
    const [isMuted, setIsMuted] = React.useState(false);

    const toggleMute = () => {
        if (!audioCtxRef.current) initAudio();
        const newState = !isMuted;
        setIsMuted(newState);

        if (masterGainRef.current) {
            // Mute: 0, Unmute: 3.0 (Supercharged)
            const targetGain = newState ? 0 : 3.0;
            const ctx = audioCtxRef.current;
            masterGainRef.current.gain.cancelScheduledValues(ctx.currentTime);
            masterGainRef.current.gain.linearRampToValueAtTime(targetGain, ctx.currentTime + 0.1);
        }
    };

    return (
        <AudioContext.Provider value={{ playHover, playClick, playSuccess, playError, playArcadePoint, playLoginSuccess, startBGM, stopBGM, toggleMute, isMuted }}>
            {children}
        </AudioContext.Provider>
    );
};
