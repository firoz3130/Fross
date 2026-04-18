import { useEffect, useRef, useState, useCallback } from "react";
import {
    doc,
    getDoc,
    onSnapshot,
    setDoc,
    updateDoc,
    arrayUnion
} from "firebase/firestore";
import { db } from "../firebaseConfig";

interface ScribblGameProps {
    onBack: () => void;
}

type Player = {
    id: string;
    name: string;
    score: number;
    avatar: string;
};

type RoomData = {
    roomId: string;
    players: Player[];
    currentDrawer: string | null;
    currentWord: string | null;
    wordHint: string;
    drawingData: string[]; // Array of drawing commands
    chatMessages: Array<{ playerId: string; playerName: string; message: string; timestamp: number; isCorrect?: boolean }>;
    gameState: 'waiting' | 'drawing' | 'guessing' | 'roundEnd' | 'gameEnd';
    roundNumber: number;
    totalRounds: number;
    timeLeft: number;
    correctGuessers: string[];
    roundStartTime: number;
};

const WORDS = [
    'apple', 'banana', 'car', 'house', 'tree', 'sun', 'moon', 'star', 'dog', 'cat',
    'bird', 'fish', 'flower', 'book', 'phone', 'computer', 'chair', 'table', 'door', 'window',
    'mountain', 'river', 'ocean', 'beach', 'forest', 'garden', 'city', 'street', 'bridge', 'castle', 'india', 'guitar', 'piano', 'drum', 'bicycle', 'airplane', 'train', 'bus', 'rocket', 'alien',
    'batman', 'superman', 'spiderman', 'wonderwoman', 'hulk', 'thor', 'ironman', 'captainamerica', 'blackwidow', 'flash', 'god', 'love', 'heart', 'hate', 'ranbir kapoor', 'firos', 'somgs', 'bangalore', 'hyderabad',
    'keralam', 'telangana', 'mysore', 'karnataka', 'bike', 'scooty', 'car', 'laptop', 'football', 'cricket', 'messi', 'ronaldo', 'kohli'
];

function generateRoomId() {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
}

function getAvatar(name: string) {
    return name.charAt(0).toUpperCase();
}

function createHint(word: string, revealed: number) {
    const letters = word.split('');
    return letters.map((letter, index) =>
        index < revealed ? letter.toUpperCase() : '_'
    ).join(' ');
}

function ScribblGame({ onBack }: ScribblGameProps) {
    const [step, setStep] = useState<"menu" | "room">("menu");
    const [roomId, setRoomId] = useState("");
    const [joinCode, setJoinCode] = useState("");
    const [playerId, setPlayerId] = useState("");
    const [playerName, setPlayerName] = useState("");
    const [selectedRounds, setSelectedRounds] = useState(3);
    const [room, setRoom] = useState<RoomData | null>(null);
    const [guess, setGuess] = useState("");
    const [error, setError] = useState("");
    const [status, setStatus] = useState("");
    const [allGuessed, setAllGuessed] = useState(false);
    const [toast, setToast] = useState("");

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [color, setColor] = useState("#000000");
    const [brushSize, setBrushSize] = useState(5);
    const [lastPos, setLastPos] = useState({ x: 0, y: 0 });

    useEffect(() => {
        if (!roomId) return;

        const roomRef = doc(db, "scribblRooms", roomId);
        const unsubscribe = onSnapshot(roomRef, (snapshot) => {
            if (!snapshot.exists()) {
                setRoom(null);
                setError("Room not found.");
                return;
            }

            const data = snapshot.data() as RoomData;
            setRoom(data);
            setError("");
        }, (err) => {
            setError("Unable to read room: " + err.message);
        });

        return () => unsubscribe();
    }, [roomId]);

    // Timer effect
    useEffect(() => {
        if (!room || room.gameState !== 'drawing' || room.timeLeft <= 0) return;

        const timer = setInterval(() => {
            updateDoc(doc(db, "scribblRooms", roomId), {
                timeLeft: room.timeLeft - 1
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [room, roomId]);

    // Round end when time runs out
    useEffect(() => {
        if (!room || room.timeLeft > 0) return;

        endRound();
    }, [room?.timeLeft]);

    // Check if all guessers have guessed correctly
    useEffect(() => {
        if (!room || room.gameState !== 'drawing') return;
        const remainingGuessers = (room.players.length - 1) - room.correctGuessers.length;
        if (remainingGuessers === 0 && !allGuessed) {
            setAllGuessed(true);
            setTimeout(() => {
                endRound();
            }, 2000);
        }
    }, [room?.correctGuessers, room?.players.length, room?.gameState, allGuessed]);

    const createRoom = async () => {
        setError("");
        if (!playerName.trim()) {
            setError("Please enter your name.");
            return;
        }
        const id = generateRoomId();
        const pid = Math.random().toString(36).substring(2, 15);
        const roomRef = doc(db, "scribblRooms", id);

        await setDoc(roomRef, {
            roomId: id,
            players: [{
                id: pid,
                name: playerName.trim(),
                score: 0,
                avatar: getAvatar(playerName.trim())
            }],
            currentDrawer: null,
            currentWord: null,
            wordHint: "",
            drawingData: [],
            chatMessages: [],
            gameState: 'waiting',
            roundNumber: 0,
            totalRounds: selectedRounds,
            timeLeft: 60,
            correctGuessers: [],
            roundStartTime: 0,
        });

        setRoomId(id);
        setPlayerId(pid);
        setStep("room");

        try {
            await navigator.clipboard.writeText(id);
            setStatus("Room created and code copied to clipboard!");
            setToast("Room code copied to clipboard!");
            setTimeout(() => setToast(""), 3000);
        } catch (err) {
            setStatus("Room created. Share the code with friends.");
        }
    };

    const joinRoom = async () => {
        setError("");
        if (!playerName.trim()) {
            setError("Please enter your name.");
            return;
        }
        const code = joinCode.trim().toUpperCase();
        if (!code) {
            setError("Enter a room code.");
            return;
        }

        const roomRef = doc(db, "scribblRooms", code);
        const snapshot = await getDoc(roomRef);

        if (!snapshot.exists()) {
            setError("Room not found.");
            return;
        }

        const data = snapshot.data() as RoomData;
        const pid = Math.random().toString(36).substring(2, 15);
        const newPlayer = {
            id: pid,
            name: playerName.trim(),
            score: 0,
            avatar: getAvatar(playerName.trim())
        };

        await updateDoc(roomRef, {
            players: [...data.players, newPlayer]
        });

        setRoomId(code);
        setPlayerId(pid);
        setStep("room");
        setStatus("Joined room.");
    };

    const startGame = async () => {
        if (!room || room.players.length < 2) {
            setError("Need at least 2 players to start.");
            return;
        }

        const word = WORDS[Math.floor(Math.random() * WORDS.length)];
        const drawer = room.players[0].id;

        await updateDoc(doc(db, "scribblRooms", roomId), {
            currentDrawer: drawer,
            currentWord: word,
            wordHint: createHint(word, 0),
            drawingData: [],
            chatMessages: [],
            gameState: 'drawing',
            roundNumber: room.roundNumber + 1,
            timeLeft: 60,
            correctGuessers: [],
            roundStartTime: Date.now(),
        });
    };

    const sendGuess = async () => {
        if (!guess.trim() || !room || room.gameState !== 'drawing') return;

        const message = {
            playerId: playerId,
            playerName: room.players.find(p => p.id === playerId)?.name || "Unknown",
            message: guess.trim(),
            timestamp: Date.now()
        };

        await updateDoc(doc(db, "scribblRooms", roomId), {
            chatMessages: arrayUnion(message)
        });

        // Check if guess is correct
        if (guess.trim().toLowerCase() === room.currentWord?.toLowerCase()) {
            const timeElapsed = Math.floor((Date.now() - room.roundStartTime) / 1000);
            const timeLeft = Math.max(0, 60 - timeElapsed);
            const points = Math.floor((timeLeft / 60) * 100);

            // Update player score
            const updatedPlayers = room.players.map(p =>
                p.id === playerId ? { ...p, score: p.score + points } : p
            );

            await updateDoc(doc(db, "scribblRooms", roomId), {
                players: updatedPlayers,
                correctGuessers: arrayUnion(playerId),
                chatMessages: arrayUnion({
                    ...message,
                    isCorrect: true
                })
            });

            setToast(`Correct! +${points} points`);
            setTimeout(() => setToast(""), 3000);
        }

        setGuess("");
    };

    const endRound = async () => {
        if (!room) return;

        // Award points to drawer
        const drawerPoints = room.correctGuessers.length * 50;
        const updatedPlayers = room.players.map(p =>
            p.id === room.currentDrawer ? { ...p, score: p.score + drawerPoints } : p
        );

        const isLastRound = room.roundNumber >= room.totalRounds;

        await updateDoc(doc(db, "scribblRooms", roomId), {
            players: updatedPlayers,
            gameState: isLastRound ? 'gameEnd' : 'roundEnd',
            timeLeft: 0
        });

        setAllGuessed(false);

        if (!isLastRound) {
            // Auto start next round after 5 seconds
            setTimeout(() => startNextRound(), 5000);
        }
    };

    const startNextRound = async () => {
        if (!room) return;

        const currentDrawerIndex = room.players.findIndex(p => p.id === room.currentDrawer);
        const nextDrawerIndex = (currentDrawerIndex + 1) % room.players.length;
        const nextDrawer = room.players[nextDrawerIndex].id;
        const word = WORDS[Math.floor(Math.random() * WORDS.length)];

        await updateDoc(doc(db, "scribblRooms", roomId), {
            currentDrawer: nextDrawer,
            currentWord: word,
            wordHint: createHint(word, 0),
            drawingData: [],
            chatMessages: [],
            gameState: 'drawing',
            roundNumber: room.roundNumber + 1,
            timeLeft: 60,
            correctGuessers: [],
            roundStartTime: Date.now(),
        });
    };

    const playAgain = async (newRounds: number) => {
        if (!room) return;

        await updateDoc(doc(db, "scribblRooms", roomId), {
            players: room.players.map(p => ({ ...p, score: 0 })),
            currentDrawer: null,
            currentWord: null,
            wordHint: "",
            drawingData: [],
            chatMessages: [],
            gameState: 'waiting',
            roundNumber: 0,
            totalRounds: newRounds,
            timeLeft: 60,
            correctGuessers: [],
            roundStartTime: 0,
        });
    };

    // Drawing functions
    const startDrawing = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
        if (!room || room.currentDrawer !== playerId) return;
        e.preventDefault();

        const canvas = canvasRef.current;
        if (!canvas) return;

        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        const x = (e.clientX - rect.left) * scaleX;
        const y = (e.clientY - rect.top) * scaleY;

        setIsDrawing(true);
        setLastPos({ x, y });
    }, [room, playerId]);

    const draw = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
        if (!isDrawing || !room || room.currentDrawer !== playerId) return;
        e.preventDefault();

        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        const x = (e.clientX - rect.left) * scaleX;
        const y = (e.clientY - rect.top) * scaleY;

        ctx.strokeStyle = color;
        ctx.lineWidth = brushSize;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        ctx.beginPath();
        ctx.moveTo(lastPos.x, lastPos.y);
        ctx.lineTo(x, y);
        ctx.stroke();

        setLastPos({ x, y });

        // Send drawing data to Firebase
        const drawingCommand = `draw:${lastPos.x},${lastPos.y},${x},${y},${color},${brushSize}`;
        updateDoc(doc(db, "scribblRooms", roomId), {
            drawingData: arrayUnion(drawingCommand)
        });
    }, [isDrawing, lastPos, color, brushSize, room, playerId, roomId]);

    const stopDrawing = useCallback(() => {
        setIsDrawing(false);
    }, []);

    // Clear canvas
    const clearCanvas = () => {
        if (!room || room.currentDrawer !== playerId) return;

        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        updateDoc(doc(db, "scribblRooms", roomId), {
            drawingData: []
        });
    };

    // Redraw from Firebase data
    useEffect(() => {
        if (!room || !canvasRef.current) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        room.drawingData.forEach(command => {
            const [type, ...args] = command.split(':');
            if (type === 'draw') {
                const [x1, y1, x2, y2, col, size] = args[0].split(',');
                ctx.strokeStyle = col;
                ctx.lineWidth = parseInt(size);
                ctx.lineCap = 'round';
                ctx.lineJoin = 'round';
                ctx.beginPath();
                ctx.moveTo(parseFloat(x1), parseFloat(y1));
                ctx.lineTo(parseFloat(x2), parseFloat(y2));
                ctx.stroke();
            }
        });
    }, [room?.drawingData]);

    const leaveRoom = () => {
        setStep("menu");
        setRoomId("");
        setJoinCode("");
        setPlayerId("");
        setPlayerName("");
        setRoom(null);
        setGuess("");
        setError("");
        setStatus("");
    };

    if (step === "menu") {
        return (
            <div className="scribbl-setup">
                <h1>🎨 FiruDraw</h1>
                <p>Draw and guess with friends! Create or join a room.</p>

                <div className="name-input glass-card">
                    <label>Enter your name</label>
                    <input
                        type="text"
                        placeholder="Your name"
                        value={playerName}
                        onChange={(e) => setPlayerName(e.target.value)}
                    />
                </div>

                <div className="rounds-input glass-card">
                    <label>Select number of rounds</label>
                    <select value={selectedRounds} onChange={(e) => setSelectedRounds(parseInt(e.target.value))}>
                        <option value={2}>2 Rounds</option>
                        <option value={3}>3 Rounds</option>
                        <option value={4}>4 Rounds</option>
                        <option value={5}>5 Rounds</option>
                        <option value={6}>6 Rounds</option>
                    </select>
                </div>

                <div className="room-actions">
                    <div className="action-card glass-card">
                        <div className="join-room">
                            <input
                                type="text"
                                placeholder="Room code"
                                value={joinCode}
                                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                            />
                            <button className="start-btn glow-btn" onClick={joinRoom} disabled={!playerName.trim()}>
                                Join Room
                            </button>
                        </div>
                    </div>
                    <div className="action-card glass-card">
                        <button className="start-btn glow-btn" onClick={createRoom} disabled={!playerName.trim()}>
                            Create Room
                        </button>
                    </div>
                </div>

                {error && <p className="error">{error}</p>}
                <button className="back-btn" onClick={onBack}>
                    Back to Menu
                </button>
            </div>
        );
    }

    if (!room) {
        return (
            <div className="scribbl-game">
                <h1>🎨 FiruDraw</h1>
                <div className="room-card glass-card">
                    <p><strong>Room Code:</strong> {roomId}</p>
                    <p><strong>You are:</strong> {playerName}</p>
                    <p><strong>Status:</strong> {status || "Loading room..."}</p>
                </div>
                {error && <p className="error">{error}</p>}
                <button className="back-btn" onClick={leaveRoom}>
                    Leave Room
                </button>
            </div>
        );
    }

    const isDrawer = room.currentDrawer === playerId;
    const hasGuessedCorrectly = room.correctGuessers.includes(playerId);

    const winner = room.players.reduce((prev, current) => (prev.score > current.score) ? prev : current);

    return (
        <div className="scribbl-game">
            {toast && <div className="toast">{toast}</div>}

            <div className="game-header">
                <h1>🎨 FiruDraw</h1>
                <div className="room-info glass-card">
                    <p><strong>Room:</strong> {roomId} | <strong>Round:</strong> {room.roundNumber}/{room.totalRounds}</p>
                    {room.gameState === 'drawing' && <p><strong>Time:</strong> {room.timeLeft}s</p>}
                </div>
            </div>

            <div className="game-layout">
                <div className="players-sidebar glass-card">
                    <h3>Players</h3>
                    <div className="players-list">
                        {room.players.map(player => (
                            <div key={player.id} className={`player-item ${player.id === room.currentDrawer ? 'drawer' : ''}`}>
                                <div className="avatar">{player.avatar}</div>
                                <div className="player-details">
                                    <span className="name">{player.name}</span>
                                    <span className="score">{player.score} pts</span>
                                </div>
                                {player.id === room.currentDrawer && <span className="drawer-badge">🎨</span>}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="main-game">
                    <div className="word-hint glass-card">
                        <h2>{room.wordHint}</h2>
                        {isDrawer && <p className="secret-word">Your word: {room.currentWord}</p>}
                    </div>

                    <div className="canvas-container glass-card">
                        <canvas
                            ref={canvasRef}
                            width={600}
                            height={400}
                            onPointerDown={startDrawing}
                            onPointerMove={draw}
                            onPointerUp={stopDrawing}
                            onPointerLeave={stopDrawing}
                            onPointerCancel={stopDrawing}
                            style={{
                                border: '2px solid rgba(255,255,255,0.2)',
                                borderRadius: '12px',
                                background: 'white',
                                cursor: isDrawer ? 'crosshair' : 'default',
                                touchAction: 'none',
                                userSelect: 'none'
                            }}
                        />
                        {allGuessed && (
                            <div className="all-guessed-overlay">
                                <h2>Everyone guessed it! 🎉</h2>
                            </div>
                        )}
                        {isDrawer && (
                            <div className="drawing-tools">
                                <div className="tool-group">
                                    <input
                                        type="color"
                                        value={color}
                                        onChange={(e) => setColor(e.target.value)}
                                        title="Color"
                                    />
                                    <input
                                        type="range"
                                        min="1"
                                        max="20"
                                        value={brushSize}
                                        onChange={(e) => setBrushSize(parseInt(e.target.value))}
                                        title="Brush Size"
                                    />
                                    <button onClick={clearCanvas} className="tool-btn">🗑️ Clear</button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="chat-sidebar glass-card">
                    <h3>Chat</h3>
                    <div className="chat-messages">
                        {room.chatMessages.map((msg, index) => (
                            <div key={index} className={`chat-message ${msg.isCorrect ? 'correct' : ''}`}>
                                <span className="sender">{msg.playerName}:</span>
                                <span className="message">{msg.message}</span>
                            </div>
                        ))}
                    </div>
                    {room.gameState === 'drawing' && !isDrawer && !hasGuessedCorrectly && (
                        <div className="chat-input">
                            <input
                                type="text"
                                value={guess}
                                onChange={(e) => setGuess(e.target.value)}
                                onKeyPress={(e) => e.key === "Enter" && sendGuess()}
                                placeholder="Guess the word..."
                            />
                            <button onClick={sendGuess} className="send-btn">Send</button>
                        </div>
                    )}
                </div>
            </div>

            {room.gameState === 'waiting' && room.players.length >= 2 && (
                <div className="start-section glass-card">
                    <p>Ready to start? Everyone's here!</p>
                    <button className="start-btn glow-btn" onClick={startGame}>
                        Start Game
                    </button>
                </div>
            )}

            {room.gameState === 'roundEnd' && (
                <div className="round-end glass-card">
                    <h2>Round {room.roundNumber} Complete!</h2>
                    <p>The word was: <strong>{room.currentWord}</strong></p>
                    <p>Next round starts in 5 seconds...</p>
                </div>
            )}

            {room.gameState === 'gameEnd' && (
                <div className="game-end-modal-overlay">
                    <div className="game-end-modal">
                        <div className="winner-announcement">
                            <div className="trophy">🏆</div>
                            <h2>Game Complete!</h2>
                            <div className="winner-info">
                                <div className="winner-avatar">{winner.avatar}</div>
                                <p><strong>{winner.name}</strong> is the winner!</p>
                                <p>Final Score: {winner.score} points</p>
                            </div>
                            <div className="confetti">🎉✨🎊</div>
                        </div>
                        <div className="play-again-section">
                            <label>Select rounds for next game:</label>
                            <select id="playAgainRounds" defaultValue={3}>
                                <option value={2}>2 Rounds</option>
                                <option value={3}>3 Rounds</option>
                                <option value={4}>4 Rounds</option>
                                <option value={5}>5 Rounds</option>
                                <option value={6}>6 Rounds</option>
                            </select>
                            <button className="play-again-btn glow-btn" onClick={() => {
                                const rounds = parseInt((document.getElementById('playAgainRounds') as HTMLSelectElement).value);
                                playAgain(rounds);
                            }}>
                                Play Again
                            </button>
                        </div>
                        <button className="close-modal-btn" onClick={() => {
                            // Optionally close modal, but since it's gameEnd, maybe keep it
                        }}>×</button>
                    </div>
                </div>
            )}

            {error && <p className="error">{error}</p>}

            <button className="back-btn" onClick={leaveRoom}>
                Leave Room
            </button>
        </div>
    );
}

export default ScribblGame;