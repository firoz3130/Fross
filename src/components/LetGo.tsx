import { useEffect, useRef, useState } from "react";

type ThoughtBubble = {
    id: string;
    text: string;
    size: number;
    left: number;
    top: number;
    gradient: string;
    isPopping: boolean;
};

type Particle = {
    x: number;
    y: number;
    vx: number;
    vy: number;
    alpha: number;
    radius: number;
    color: string;
};

const FEEDBACK_MESSAGES = [
    "One less thing to carry.",
    "You can let it go.",
    "Not every thought deserves permanence.",
    "Breathe.",
    "This moment will pass.",
    "One small release, one lighter moment.",
];

const GRADIENTS = [
    "linear-gradient(135deg, rgba(190, 132, 255, 0.95), rgba(144, 205, 255, 0.4))",
    "linear-gradient(135deg, rgba(135, 96, 255, 0.95), rgba(255, 170, 240, 0.45))",
    "linear-gradient(135deg, rgba(103, 203, 249, 0.9), rgba(164, 98, 255, 0.4))",
    "linear-gradient(135deg, rgba(255, 149, 203, 0.95), rgba(255, 216, 140, 0.45))",
    "linear-gradient(135deg, rgba(131, 103, 255, 0.95), rgba(103, 205, 200, 0.45))",
];

const hashText = (value: string) => {
    let hash = 0;
    for (let i = 0; i < value.length; i += 1) {
        hash = (hash << 5) - hash + value.charCodeAt(i);
        hash |= 0;
    }
    return Math.abs(hash);
};

function LetGo({ onBack }: { onBack: () => void }) {
    const [thought, setThought] = useState("");
    const [bubbles, setBubbles] = useState<ThoughtBubble[]>([]);
    const [feedback, setFeedback] = useState("");
    const [isMuted, setIsMuted] = useState(true);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const particlesRef = useRef<Particle[]>([]);
    const rafRef = useRef<number | undefined>(undefined);
    const popSound = useRef<HTMLAudioElement | null>(null);
    const ambientSound = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        popSound.current = new Audio("/sounds/letgo-pop.mp3");
        ambientSound.current = new Audio("/sounds/letgo-ambient.mp3");
        ambientSound.current.loop = true;
        ambientSound.current.volume = 0.18;

        return () => {
            ambientSound.current?.pause();
            popSound.current = null;
            ambientSound.current = null;
            window.cancelAnimationFrame(rafRef.current ?? 0);
        };
    }, []);

    useEffect(() => {
        if (!ambientSound.current) return;
        if (isMuted) {
            ambientSound.current.pause();
        } else {
            ambientSound.current.play().catch(() => { });
        }
    }, [isMuted]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };

        resize();
        window.addEventListener("resize", resize);

        const renderFrame = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            const particles = particlesRef.current;

            for (let i = particles.length - 1; i >= 0; i -= 1) {
                const particle = particles[i];
                particle.x += particle.vx;
                particle.y += particle.vy;
                particle.vy += 0.04;
                particle.alpha -= 0.02;
                particle.radius *= 0.98;

                if (particle.alpha <= 0 || particle.radius <= 0.4) {
                    particles.splice(i, 1);
                    continue;
                }

                ctx.save();
                ctx.globalAlpha = particle.alpha;
                ctx.fillStyle = particle.color;
                ctx.beginPath();
                ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            }

            rafRef.current = window.requestAnimationFrame(renderFrame);
        };

        rafRef.current = window.requestAnimationFrame(renderFrame);
        return () => {
            window.cancelAnimationFrame(rafRef.current ?? 0);
            window.removeEventListener("resize", resize);
        };
    }, []);

    const createBubble = (text: string) => {
        const length = Math.max(12, Math.min(42, text.length));
        const size = 90 + Math.min(100, length * 3);
        const left = Math.random() * 70 + 10;
        const top = Math.random() * 48 + 10;
        const gradient = GRADIENTS[hashText(text) % GRADIENTS.length];

        const id = typeof crypto !== "undefined" && "randomUUID" in crypto
            ? crypto.randomUUID()
            : `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

        return {
            id,
            text,
            size,
            left,
            top,
            gradient,
            isPopping: false,
        };
    };

    const triggerParticles = (x: number, y: number, gradient: string) => {
        const color = gradient.includes("rgba(255, 149, 203") ? "rgba(255,149,203,0.95)"
            : gradient.includes("rgba(103, 203, 249") ? "rgba(103,203,249,0.95)"
                : gradient.includes("rgba(190, 132, 255") ? "rgba(190,132,255,0.95)"
                    : "rgba(255,255,255,0.95)";

        const particles = Array.from({ length: 18 }, () => ({
            x,
            y,
            vx: (Math.random() - 0.5) * 4,
            vy: (Math.random() - 1.5) * 4,
            alpha: 1,
            radius: Math.random() * 3 + 2,
            color,
        }));

        particlesRef.current = [...particlesRef.current, ...particles];
    };

    const handleSubmit = () => {
        const text = thought.trim();
        if (!text) return;
        const bubble = createBubble(text);
        setBubbles((current) => [bubble, ...current].slice(0, 16));
        setThought("");
        if (!isMuted && popSound.current) {
            popSound.current.currentTime = 0;
            popSound.current.play().catch(() => { });
        }
        const nextFeedback = FEEDBACK_MESSAGES[Math.floor(Math.random() * FEEDBACK_MESSAGES.length)];
        setFeedback(nextFeedback);
        window.setTimeout(() => setFeedback(""), 4300);
    };

    const handlePop = (id: string, rect: DOMRect, gradient: string) => {
        setBubbles((current) => current.map((bubble) => bubble.id === id ? { ...bubble, isPopping: true } : bubble));

        if (!isMuted && popSound.current) {
            popSound.current.currentTime = 0;
            popSound.current.play().catch(() => { });
        }

        triggerParticles(rect.left + rect.width / 2, rect.top + rect.height / 2, gradient);
        const nextFeedback = FEEDBACK_MESSAGES[Math.floor(Math.random() * FEEDBACK_MESSAGES.length)];
        setFeedback(nextFeedback);
        window.setTimeout(() => setFeedback(""), 4300);

        window.setTimeout(() => {
            setBubbles((current) => current.filter((bubble) => bubble.id !== id));
        }, 240);
    };

    return (
        <div className="letgo-page">
            <canvas ref={canvasRef} className="letgo-canvas" />
            <div className="letgo-shell">
                <button className="back-to-menu-btn" onClick={onBack}>
                    ← Back to Menu
                </button>

                <div className="letgo-topbar">
                    <div>
                        <h1>Let Go</h1>
                        <p className="letgo-subtitle">Type a thought and release it into a gentle, private space.</p>
                    </div>
                    <button
                        className="letgo-sound-toggle"
                        type="button"
                        onClick={() => setIsMuted((prev) => !prev)}
                    >
                        {isMuted ? "🔇 Sound off" : "🔊 Sound on"}
                    </button>
                </div>

                <div className="letgo-input-card glass-card">
                    <label htmlFor="letgo-input">What's on your mind?</label>
                    <div className="letgo-input-row">
                        <input
                            id="letgo-input"
                            type="text"
                            value={thought}
                            autoComplete="off"
                            placeholder="worries, regrets, names, feelings..."
                            onChange={(e) => setThought(e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleSubmit(); } }}
                        />
                        <button
                            className="start-btn letgo-submit"
                            type="button"
                            onClick={handleSubmit}
                            disabled={!thought.trim()}
                        >
                            Release
                        </button>
                    </div>
                    <p className="letgo-privacy-note">
                        Your thoughts are never stored, shared, or sent anywhere. Everything stays on your device and popped.
                    </p>
                </div>

                {feedback && <div className="letgo-feedback">{feedback}</div>}

                <div className="letgo-bubble-grid">
                    {bubbles.map((bubble) => (
                        <div
                            key={bubble.id}
                            className={`letgo-bubble ${bubble.isPopping ? 'popping' : ''}`}
                            style={{
                                width: bubble.size,
                                height: bubble.size,
                                left: `${bubble.left}%`,
                                top: `${bubble.top}%`,
                                background: bubble.gradient,
                                animationDuration: `${10 + (bubble.size / 10)}s`,
                                animationDelay: `${Math.random() * 3}s`,
                            }}
                            onClick={(event) => {
                                const rect = event.currentTarget.getBoundingClientRect();
                                handlePop(bubble.id, rect, bubble.gradient);
                            }}
                        >
                            <p>{bubble.text}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default LetGo;
