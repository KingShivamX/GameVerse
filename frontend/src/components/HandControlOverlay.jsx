import React, { useEffect, useRef, useState } from 'react';
import * as tf from '@tensorflow/tfjs';
import * as handpose from '@tensorflow-models/handpose';
import { gsap } from 'gsap';
import { Minimize2, Maximize2, X } from 'lucide-react';

const HandControlOverlay = ({ active, onClose }) => {
    const videoRef = useRef(null);
    const requestRef = useRef(null);
    const cursorRef = useRef(null);
    const [model, setModel] = useState(null);
    const [loading, setLoading] = useState(true);
    const [gestureState, setGestureState] = useState('IDLE'); // IDLE, CLICKING

    // Initialize TensorFlow and Handpose
    useEffect(() => {
        if (!active) return;

        const initTF = async () => {
            setLoading(true);
            try {
                // Ensure backend is ready
                await tf.ready();
                const net = await handpose.load();
                setModel(net);
                setLoading(false);
            } catch (err) {
                console.error("TF Init Error:", err);
                setLoading(false);
            }
        };

        initTF();
    }, [active]);

    // Camera Stream & Processing Loop
    useEffect(() => {
        if (!active || !model) return;

        const startVideo = async () => {
            if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
                try {
                    const stream = await navigator.mediaDevices.getUserMedia({
                        video: { facingMode: "user", width: 640, height: 480 }
                    });
                    if (videoRef.current) {
                        videoRef.current.srcObject = stream;
                        videoRef.current.onloadedmetadata = () => {
                            videoRef.current.play();
                            processHand();
                        };
                    }
                } catch (err) {
                    console.error("Camera Error:", err);
                }
            }
        };

        const processHand = async () => {
            if (!videoRef.current || videoRef.current.readyState !== 4) {
                requestRef.current = requestAnimationFrame(processHand);
                return;
            }

            try {
                // Estimate Hand
                const hands = await model.estimateHands(videoRef.current);

                if (hands.length > 0) {
                    const hand = hands[0];
                    const landmarks = hand.landmarks;

                    // 1. Cursor Mapping (Index Finger Tip - Index 8)
                    const indexTip = landmarks[8];
                    const x = indexTip[0];
                    const y = indexTip[1];

                    // Map video coordinates to screen coordinates
                    // Video is typically 640x480. We need to mirror X.
                    const videoW = videoRef.current.videoWidth;
                    const videoH = videoRef.current.videoHeight;
                    const screenW = window.innerWidth;
                    const screenH = window.innerHeight;

                    // Mirror X: video x goes 0->640 (left->right). Screen should be inv. 
                    // Actually, webcam is mirrored. So left in video is right user side. 
                    // Usually we flip X. 
                    const normX = 1 - (x / videoW);
                    const normY = y / videoH;

                    const screenX = normX * screenW;
                    const screenY = normY * screenH;

                    // Update Cursor Position visually
                    if (cursorRef.current) {
                        gsap.to(cursorRef.current, {
                            x: screenX,
                            y: screenY,
                            duration: 0.1,
                            ease: "power2.out"
                        });
                    }

                    // 2. Pinch-to-Click Detection
                    // Distance between Thumb Tip (4) and Index Tip (8)
                    const thumbTip = landmarks[4];
                    const dist = Math.sqrt(
                        Math.pow(indexTip[0] - thumbTip[0], 2) +
                        Math.pow(indexTip[1] - thumbTip[1], 2)
                    );

                    // Threshold for "pinch"
                    if (dist < 30) {
                        if (gestureState !== 'CLICKING') {
                            setGestureState('CLICKING');
                            triggerClick(screenX, screenY);
                        }
                    } else {
                        setGestureState('IDLE');
                    }

                    // 3. Edge Scrolling
                    if (screenY < screenH * 0.1) {
                        // Top 10% -> Scroll Up
                        window.scrollBy({ top: -10, behavior: 'auto' });
                    } else if (screenY > screenH * 0.9) {
                        // Bottom 10% -> Scroll Down
                        window.scrollBy({ top: 10, behavior: 'auto' });
                    }

                }
            } catch (err) {
                console.error("Tracking Error:", err);
            }

            requestRef.current = requestAnimationFrame(processHand);
        };

        const triggerClick = (x, y) => {
            // Find element at point and click it
            const elem = document.elementFromPoint(x, y);
            if (elem) {
                // Visual click feedback
                const ripple = document.createElement('div');
                ripple.className = 'fixed rounded-full bg-red-500 opacity-50 pointer-events-none z-[10000]';
                ripple.style.width = '20px';
                ripple.style.height = '20px';
                ripple.style.left = `${x}px`;
                ripple.style.top = `${y}px`;
                ripple.style.transform = 'translate(-50%, -50%)';
                document.body.appendChild(ripple);

                gsap.to(ripple, {
                    scale: 3,
                    opacity: 0,
                    duration: 0.5,
                    onComplete: () => ripple.remove()
                });

                // Trigger actual click
                elem.click();
                // If it's an input, focus it
                elem.focus();
            }
        };

        startVideo();

        return () => {
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
            if (videoRef.current && videoRef.current.srcObject) {
                videoRef.current.srcObject.getTracks().forEach(track => track.stop());
            }
        };
    }, [active, model, gestureState]);

    if (!active) return null;

    return (
        <div className="fixed inset-0 z-[9999] pointer-events-none">
            {/* Hidden Processing Video */}
            <video
                ref={videoRef}
                className="hidden"
                width="640"
                height="480"
                playsInline
                muted
            />

            {/* Status Display */}
            <div className="absolute top-4 right-4 bg-black/80 border border-green-500 text-green-500 p-2 rounded font-mono text-xs z-[10000] pointer-events-auto">
                <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    NEURAL LINK ESTABLISHED
                </div>
                <div className="space-y-1">
                    <div>STATUS: {loading ? "CALIBRATING..." : "ONLINE"}</div>
                    <div>GESTURE: {gestureState}</div>
                    <div>CONTROLS:</div>
                    <div className="pl-2 text-[10px] text-gray-400">
                        • INDEX FINGER: MOVE<br />
                        • PINCH: CLICK<br />
                        • EDGES: SCROLL
                    </div>
                </div>
                <button
                    onClick={onClose}
                    className="mt-2 w-full border border-red-500 text-red-500 hover:bg-red-500/20 text-[10px] py-1 uppercase"
                >
                    Terminate Link
                </button>
            </div>

            {/* Virtual Cursor */}
            {!loading && (
                <div
                    ref={cursorRef}
                    className="absolute w-8 h-8 -translate-x-1/2 -translate-y-1/2 pointer-events-none transition-colors duration-200"
                >
                    {/* Reticle Design */}
                    <div className={`absolute inset-0 border-2 rounded-full transition-all duration-200 ${gestureState === 'CLICKING' ? 'border-red-500 scale-75 bg-red-500/20' : 'border-green-400 scale-100'}`} />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1 h-1 bg-white rounded-full" />
                    <div className={`absolute -top-2 left-1/2 -translate-x-1/2 w-[1px] h-2 ${gestureState === 'CLICKING' ? 'bg-red-500' : 'bg-green-400'}`} />
                    <div className={`absolute -bottom-2 left-1/2 -translate-x-1/2 w-[1px] h-2 ${gestureState === 'CLICKING' ? 'bg-red-500' : 'bg-green-400'}`} />
                    <div className={`absolute top-1/2 -left-2 -translate-y-1/2 w-2 h-[1px] ${gestureState === 'CLICKING' ? 'bg-red-500' : 'bg-green-400'}`} />
                    <div className={`absolute top-1/2 -right-2 -translate-y-1/2 w-2 h-[1px] ${gestureState === 'CLICKING' ? 'bg-red-500' : 'bg-green-400'}`} />
                </div>
            )}

            {/* Loading Overlay */}
            {loading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-[9998]">
                    <div className="text-green-500 font-mono animate-pulse tracking-widest text-lg">
                        INITIALIZING NEURAL INTERFACE...
                    </div>
                </div>
            )}
        </div>
    );
};

export default HandControlOverlay;
