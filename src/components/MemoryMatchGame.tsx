import { useEffect, useState } from "react";
import {
    doc,
    getDoc,
    onSnapshot,
    setDoc,
    updateDoc
} from "firebase/firestore";
import { db } from "../firebaseConfig";

interface MemoryMatchGameProps {
    onBack: () => void;
}

type Card = {
    id: number;
    value: string;
    pairId: number;
    isFlipped: boolean;
    isMatched: boolean;
};

type GameMode = 'words' | 'numbers';

type Difficulty = 'easy' | 'medium' | 'hard';

type RoomData = {
    roomId: string;
    player1Name: string;
    player2Name: string;
    player1Score: number;
    player2Score: number;
    currentPlayer: 1 | 2;
    cards: Card[];
    flippedCards: number[];
    matchedPairs: number[];
    gameMode: GameMode;
    difficulty: Difficulty;
    gameStarted: boolean;
    winner: 1 | 2 | null;
    timeBonus: number;
};

function generateRoomId() {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
}

// Word pairs for memory game
const WORD_PAIRS = {
    synonyms: [
        ['happy', 'joyful'], ['big', 'large'], ['fast', 'quick'], ['smart', 'clever'],
        ['brave', 'courageous'], ['calm', 'peaceful'], ['bright', 'shiny'], ['strong', 'powerful'],
        ['kind', 'gentle'], ['loud', 'noisy'], ['small', 'tiny'], ['old', 'ancient'],
        ['new', 'fresh'], ['hot', 'warm'], ['cold', 'chilly'], ['wet', 'damp'],
        ['dry', 'arid'], ['hard', 'tough'], ['soft', 'gentle'], ['heavy', 'weighty'],
        ['light', 'airy'], ['dark', 'gloomy'], ['light', 'bright'], ['clean', 'spotless'],
        ['dirty', 'filthy'], ['full', 'complete'], ['empty', 'vacant'], ['rich', 'wealthy'],
        ['poor', 'destitute'], ['young', 'youthful'], ['tall', 'lofty'], ['short', 'brief']
    ],
    antonyms: [
        ['hot', 'cold'], ['up', 'down'], ['day', 'night'], ['good', 'bad'],
        ['fast', 'slow'], ['big', 'small'], ['happy', 'sad'], ['hard', 'soft'],
        ['high', 'low'], ['left', 'right'], ['in', 'out'], ['on', 'off'],
        ['open', 'closed'], ['full', 'empty'], ['wet', 'dry'], ['light', 'dark'],
        ['loud', 'quiet'], ['rich', 'poor'], ['young', 'old'], ['tall', 'short'],
        ['thick', 'thin'], ['wide', 'narrow'], ['deep', 'shallow'], ['strong', 'weak'],
        ['easy', 'difficult'], ['clean', 'dirty'], ['near', 'far'], ['early', 'late']
    ]
};

// Number pairs for memory game
const NUMBER_PAIRS = {
    equations: [
        ['2+2', '4'], ['5×3', '15'], ['10÷2', '5'], ['7+8', '15'],
        ['9-4', '5'], ['6×4', '24'], ['12÷3', '4'], ['3+7', '10'],
        ['8÷4', '2'], ['11-6', '5'], ['4×5', '20'], ['13+2', '15'],
        ['16÷8', '2'], ['9×2', '18'], ['14-7', '7'], ['5+9', '14'],
        ['6÷3', '2'], ['17-8', '9'], ['3×6', '18'], ['12+3', '15'],
        ['20÷5', '4'], ['7×3', '21'], ['18-9', '9'], ['4+11', '15']
    ],
    sequences: [
        ['1,2,3', '4'], ['2,4,6', '8'], ['5,10,15', '20'], ['3,6,9', '12'],
        ['1,3,5', '7'], ['2,3,5', '7'], ['1,4,7', '10'], ['2,5,8', '11'],
        ['4,8,12', '16'], ['6,9,12', '15'], ['7,14,21', '28'], ['5,15,25', '35'],
        ['8,16,24', '32'], ['9,18,27', '36'], ['10,20,30', '40'], ['3,9,15', '21'],
        ['6,12,18', '24'], ['4,12,20', '28'], ['7,21,35', '49'], ['2,6,10', '14'],
        ['5,25,125', '625'], ['1,8,27', '64'], ['2,10,26', '50'], ['3,12,27', '48']
    ]
};

function generateCards(gameMode: GameMode, difficulty: Difficulty): Card[] {
    let pairs: string[][] = [];
    const gridSize = difficulty === 'easy' ? 16 : 36; // 4x4 = 16, 6x6 = 36
    const numPairs = gridSize / 2;

    if (gameMode === 'words') {
        const allSynonymPairs = WORD_PAIRS.synonyms;
        const allAntonymPairs = WORD_PAIRS.antonyms;
        const synonymPairs = allSynonymPairs.slice(0, Math.min(numPairs / 2, allSynonymPairs.length));
        const antonymPairs = allAntonymPairs.slice(0, Math.min(numPairs / 2, allAntonymPairs.length));
        pairs = [...synonymPairs, ...antonymPairs];

        // If we don't have enough pairs, fill with remaining pairs
        if (pairs.length < numPairs) {
            const remainingSynonyms = allSynonymPairs.slice(synonymPairs.length);
            const remainingAntonyms = allAntonymPairs.slice(antonymPairs.length);
            pairs = [...pairs, ...remainingSynonyms, ...remainingAntonyms].slice(0, numPairs);
        }
    } else {
        const allEquationPairs = NUMBER_PAIRS.equations;
        const allSequencePairs = NUMBER_PAIRS.sequences;
        const equationPairs = allEquationPairs.slice(0, Math.min(numPairs / 2, allEquationPairs.length));
        const sequencePairs = allSequencePairs.slice(0, Math.min(numPairs / 2, allSequencePairs.length));
        pairs = [...equationPairs, ...sequencePairs];

        // If we don't have enough pairs, fill with remaining pairs
        if (pairs.length < numPairs) {
            const remainingEquations = allEquationPairs.slice(equationPairs.length);
            const remainingSequences = allSequencePairs.slice(sequencePairs.length);
            pairs = [...pairs, ...remainingEquations, ...remainingSequences].slice(0, numPairs);
        }
    }

    // Ensure all values are unique across all pairs
    const usedValues = new Set<string>();
    const uniquePairs: string[][] = [];

    for (const pair of pairs) {
        const [val1, val2] = pair;
        if (!usedValues.has(val1) && !usedValues.has(val2)) {
            usedValues.add(val1);
            usedValues.add(val2);
            uniquePairs.push(pair);
        }
    }

    pairs = uniquePairs.slice(0, numPairs);

    const cards: Card[] = [];
    let id = 0;

    pairs.forEach((pair, pairIndex) => {
        // Add first card of pair
        cards.push({
            id: id++,
            value: pair[0],
            pairId: pairIndex,
            isFlipped: false,
            isMatched: false
        });
        // Add second card of pair
        cards.push({
            id: id++,
            value: pair[1],
            pairId: pairIndex,
            isFlipped: false,
            isMatched: false
        });
    });

    // Shuffle cards
    for (let i = cards.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [cards[i], cards[j]] = [cards[j], cards[i]];
    }

    return cards;
}

function MemoryMatchGame({ onBack }: MemoryMatchGameProps) {
    const [step, setStep] = useState<"menu" | "setup" | "game">("menu");
    const [roomId, setRoomId] = useState("");
    const [joinCode, setJoinCode] = useState("");
    const [playerNumber, setPlayerNumber] = useState<1 | 2 | null>(null);
    const [playerName, setPlayerName] = useState("");
    const [room, setRoom] = useState<RoomData | null>(null);
    const [gameMode, setGameMode] = useState<GameMode>('words');
    const [difficulty, setDifficulty] = useState<Difficulty>('easy');
    const [roomGameMode, setRoomGameMode] = useState<GameMode>('words');
    const [roomDifficulty, setRoomDifficulty] = useState<Difficulty>('easy');
    const [error, setError] = useState("");
    const [status, setStatus] = useState("");
    const [toast, setToast] = useState("");
    const [turnStartTime, setTurnStartTime] = useState<number>(0);

    useEffect(() => {
        if (!roomId) return;

        const roomRef = doc(db, "memoryRooms", roomId);
        const unsubscribe = onSnapshot(roomRef, (snapshot) => {
            if (!snapshot.exists()) {
                setRoom(null);
                setError("Room not found.");
                return;
            }

            const data = snapshot.data() as RoomData;
            setRoom({ ...data, roomId: snapshot.id });
            setError("");
        }, (err) => {
            setError("Unable to read room: " + err.message);
        });

        return () => unsubscribe();
    }, [roomId]);

    useEffect(() => {
        if (room) {
            setRoomGameMode(room.gameMode);
            setRoomDifficulty(room.difficulty);
        }
    }, [room?.roomId]);

    const createRoom = async () => {
        setError("");
        if (!playerName.trim()) {
            setError("Please enter your name.");
            return;
        }
        const id = generateRoomId();
        const roomRef = doc(db, "memoryRooms", id);

        const cards = generateCards(gameMode, difficulty);

        await setDoc(roomRef, {
            roomId: id,
            player1Name: playerName.trim(),
            player2Name: "",
            player1Score: 0,
            player2Score: 0,
            currentPlayer: 1,
            cards,
            flippedCards: [],
            matchedPairs: [],
            gameMode,
            difficulty,
            gameStarted: false,
            winner: null,
            timeBonus: 0,
        });

        // Copy room code to clipboard
        try {
            await navigator.clipboard.writeText(id);
            setToast("Room code copied! Share with your friend. Have fun!");
            setTimeout(() => setToast(""), 3000);
        } catch (err) {
            console.error("Failed to copy room code:", err);
        }

        setRoomId(id);
        setPlayerNumber(1);
        setStep("game");
        setStatus("Room created. Share the code with player 2.");
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

        const roomRef = doc(db, "memoryRooms", code);
        const snapshot = await getDoc(roomRef);

        if (!snapshot.exists()) {
            setError("Room not found.");
            return;
        }

        const data = snapshot.data() as RoomData;
        if (data.player2Name && data.player2Name.trim()) {
            setError("This room already has two players.");
            return;
        }

        await updateDoc(roomRef, {
            player2Name: playerName.trim(),
        });

        setRoomId(code);
        setPlayerNumber(2);
        setStep("game");
        setStatus("Joined room. Game will start soon.");
    };

    const startGame = async () => {
        if (!roomId || !room) return;

        const roomRef = doc(db, "memoryRooms", roomId);
        await updateDoc(roomRef, {
            gameStarted: true,
        });

        setTurnStartTime(Date.now());
    };

    const flipCard = async (cardId: number) => {
        if (!room || !playerNumber || room.currentPlayer !== playerNumber) return;
        if (room.flippedCards.length >= 2) return;
        if (room.flippedCards.includes(cardId)) return;
        const card = room.cards.find(c => c.id === cardId);
        if (!card) return;
        const isMatched = room.matchedPairs.includes(card.pairId);
        if (isMatched) return;

        const roomRef = doc(db, "memoryRooms", roomId);
        const newFlippedCards = [...room.flippedCards, cardId];

        await updateDoc(roomRef, {
            flippedCards: newFlippedCards,
        });

        // Check for match after second card is flipped
        if (newFlippedCards.length === 2) {
            setTimeout(async () => {
                await checkForMatch(newFlippedCards);
            }, 1000);
        }
    };

    const checkForMatch = async (flippedCardIds: number[]) => {
        if (!room || !roomId) return;

        const roomRef = doc(db, "memoryRooms", roomId);
        const card1 = room.cards.find(c => c.id === flippedCardIds[0]);
        const card2 = room.cards.find(c => c.id === flippedCardIds[1]);

        if (!card1 || !card2) return;

        const isMatch = card1.pairId === card2.pairId;
        const timeTaken = Date.now() - turnStartTime;
        const timeBonus = timeTaken < 3000 ? Math.max(0, 100 - Math.floor(timeTaken / 30)) : 0;

        let newMatchedPairs = [...room.matchedPairs];
        let newPlayer1Score = room.player1Score;
        let newPlayer2Score = room.player2Score;
        let nextPlayer = room.currentPlayer;

        if (isMatch) {
            newMatchedPairs.push(card1.pairId);
            const score = 10 + timeBonus;
            if (room.currentPlayer === 1) {
                newPlayer1Score += score;
            } else {
                newPlayer2Score += score;
            }
            // Same player continues on match
        } else {
            // Switch to other player on no match
            nextPlayer = room.currentPlayer === 1 ? 2 : 1;
        }

        // Check for game end
        const totalPairs = room.cards.length / 2;
        const winner = newMatchedPairs.length === totalPairs
            ? (newPlayer1Score > newPlayer2Score ? 1 : newPlayer2Score > newPlayer1Score ? 2 : null)
            : null;

        await updateDoc(roomRef, {
            flippedCards: [],
            matchedPairs: newMatchedPairs,
            player1Score: newPlayer1Score,
            player2Score: newPlayer2Score,
            currentPlayer: winner ? room.currentPlayer : nextPlayer,
            winner,
        });

        if (!winner) {
            setTurnStartTime(Date.now());
        }
    };

    const playAgain = async () => {
        setError("");
        if (!roomId || !room) return;

        const cards = generateCards(room.gameMode, room.difficulty);
        const roomRef = doc(db, "memoryRooms", roomId);
        await updateDoc(roomRef, {
            player1Score: 0,
            player2Score: 0,
            currentPlayer: 1,
            cards,
            flippedCards: [],
            matchedPairs: [],
            gameStarted: false,
            winner: null,
            timeBonus: 0,
        });

        setTurnStartTime(Date.now());
    };

    const resetRoomSettings = async () => {
        setError("");
        if (!roomId || !room) return;

        const cards = generateCards(roomGameMode, roomDifficulty);
        const roomRef = doc(db, "memoryRooms", roomId);
        await updateDoc(roomRef, {
            gameMode: roomGameMode,
            difficulty: roomDifficulty,
            player1Score: 0,
            player2Score: 0,
            currentPlayer: 1,
            cards,
            flippedCards: [],
            matchedPairs: [],
            gameStarted: false,
            winner: null,
            timeBonus: 0,
        });

        setTurnStartTime(Date.now());
    };

    const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);

    const leaveRoom = () => {
        setStep("menu");
        setRoomId("");
        setJoinCode("");
        setPlayerNumber(null);
        setPlayerName("");
        setRoom(null);
        setError("");
        setStatus("");
    };

    const handleLeaveRoom = () => setShowLeaveConfirm(true);
    const cancelLeave = () => setShowLeaveConfirm(false);
    const confirmLeaveRoom = () => {
        setShowLeaveConfirm(false);
        leaveRoom();
    };

    const renderLeaveConfirmModal = () => {
        if (!showLeaveConfirm) return null;
        return (
            <div className="confirm-modal-overlay">
                <div className="confirm-modal glass-card">
                    <h2>Leave Room?</h2>
                    <p>Do you really want to leave the room? Your current game session will end.</p>
                    <div className="confirm-actions">
                        <button className="cancel-btn" onClick={cancelLeave}>
                            No, stay
                        </button>
                        <button className="start-btn glow-btn" onClick={confirmLeaveRoom}>
                            Yes, leave
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    if (step === "menu") {
        return (
            <div className="memory-match-setup">
                <h1>🧠 Memory Match Challenge</h1>
                <p>Test your memory! Match pairs of words or numbers.</p>

                <div className="game-options">
                    <div className="option-group">
                        <label>Game Mode:</label>
                        <select value={gameMode} onChange={(e) => setGameMode(e.target.value as GameMode)}>
                            <option value="words">Words (Synonyms & Antonyms)</option>
                            <option value="numbers">Numbers (Equations & Sequences)</option>
                        </select>
                    </div>

                    <div className="option-group">
                        <label>Difficulty:</label>
                        <select value={difficulty} onChange={(e) => setDifficulty(e.target.value as Difficulty)}>
                            <option value="easy">Easy (4×4 grid, 8 pairs)</option>
                            <option value="medium">Medium (6×6 grid, 18 pairs)</option>
                        </select>
                    </div>
                </div>

                <div className="name-input">
                    <label>Enter your name</label>
                    <input
                        type="text"
                        placeholder="Your name"
                        value={playerName}
                        onChange={(e) => setPlayerName(e.target.value)}
                    />
                </div>

                <div className="room-actions">
                    <div className="action-card">
                        <div className="join-room">
                            <input
                                type="text"
                                placeholder="Room code"
                                value={joinCode}
                                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                            />
                            <button className="start-btn join-btn" onClick={joinRoom} disabled={!playerName.trim()}>
                                Join Room
                            </button>
                        </div>
                    </div>
                    <div className="action-card">
                        <button className="start-btn create-room-btn" onClick={createRoom} disabled={!playerName.trim()}>
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
            <div className="memory-match-game">
                <h1>🧠 Memory Match Challenge</h1>
                <div className="room-card">
                    <p><strong>Room Code:</strong> {roomId}</p>
                    <p><strong>You are:</strong> {playerName}</p>
                    <p><strong>Status:</strong> {status || "Loading room..."}</p>
                </div>
                {error && <p className="error">{error}</p>}
                {renderLeaveConfirmModal()}
                <button className="back-btn" onClick={handleLeaveRoom}>
                    Leave Room
                </button>
            </div>
        );
    }

    const gridSize = room.difficulty === 'easy' ? 4 : 6;
    const isMyTurn = room.currentPlayer === playerNumber;
    const totalPairs = room.cards.length / 2;
    const matchedCount = room.matchedPairs.length;

    return (
        <div className="memory-match-game">
            {toast && <div className="toast">{toast}</div>}
            <h1>🧠 Memory Match Challenge</h1>

            <div className="room-card">
                <p><strong>Room Code:</strong> {roomId}</p>
                <p><strong>Mode:</strong> {room.gameMode === 'words' ? 'Words' : 'Numbers'} | <strong>Difficulty:</strong> {room.difficulty}</p>
                <p><strong>Progress:</strong> {matchedCount}/{totalPairs} pairs matched</p>
                <p><strong>Current Turn:</strong> {isMyTurn ? 'Your turn!' : `${room.currentPlayer === 1 ? room.player1Name : room.player2Name}'s turn`}</p>
                <p><strong>{room.player1Name}:</strong> {room.player1Score} pts | <strong>{room.player2Name}:</strong> {room.player2Score} pts</p>
            </div>

            {!room.gameStarted && playerNumber === 1 && (
                <div className="start-section">
                    <p>Waiting for both players to be ready...</p>
                    <button className="start-btn" onClick={startGame}>
                        Start Game
                    </button>
                </div>
            )}

            {!room.gameStarted && playerNumber === 2 && (
                <p>Waiting for {room.player1Name} to start the game...</p>
            )}

            {room.gameStarted && !room.winner && (
                <div className="game-board">
                    <div
                        className={`card-grid grid-${gridSize}`}
                        style={{
                            gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
                            gap: '8px',
                            width: '100%',
                            maxWidth: gridSize === 4 ? 'min(100vw - 32px, 400px)' : 'min(100vw - 32px, 500px)'
                        }}
                    >
                        {room.cards.map((card) => {
                            const isFlipped = room.flippedCards.includes(card.id);
                            const isMatched = room.matchedPairs.includes(card.pairId);
                            return (
                                <div
                                    key={card.id}
                                    className={`memory-card ${isFlipped || isMatched ? 'flipped' : ''} ${isMatched ? 'matched' : ''}`}
                                    onClick={() => isMyTurn && flipCard(card.id)}
                                    style={{
                                        aspectRatio: '1',
                                        background: isMatched ? '#4CAF50' : isFlipped ? '#2196F3' : '#666',
                                        borderRadius: '8px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        cursor: isMyTurn && !isFlipped && !isMatched ? 'pointer' : 'default',
                                        fontSize: gridSize === 4 ? 'clamp(0.8rem, 2.5vw, 1.2rem)' : 'clamp(0.6rem, 1.8vw, 1rem)',
                                        fontWeight: 'bold',
                                        color: 'white',
                                        transition: 'all 0.3s ease',
                                        boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
                                    }}
                                >
                                    {isFlipped || isMatched ? card.value : '?'}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {room.winner && (
                <div className="winner-banner">
                    <h2>{room.winner === playerNumber ? "🎉 Memory Master!" : "Good game!"}</h2>
                    <p>
                        {room.winner === 1 ? room.player1Name : room.player2Name} wins with {Math.max(room.player1Score, room.player2Score)} points!
                    </p>
                    <p className="final-scores">
                        {room.player1Name}: {room.player1Score} pts | {room.player2Name}: {room.player2Score} pts
                    </p>
                    <button className="start-btn" onClick={playAgain}>
                        Play Again
                    </button>
                </div>
            )}

            {room.winner && (
                <div className="settings-panel">
                    <h3>Reset game with new settings</h3>
                    <div className="game-options">
                        <div className="option-group">
                            <label>Game Mode:</label>
                            <select value={roomGameMode} onChange={(e) => setRoomGameMode(e.target.value as GameMode)}>
                                <option value="words">Words (Synonyms & Antonyms)</option>
                                <option value="numbers">Numbers (Equations & Sequences)</option>
                            </select>
                        </div>
                        <div className="option-group">
                            <label>Difficulty:</label>
                            <select value={roomDifficulty} onChange={(e) => setRoomDifficulty(e.target.value as Difficulty)}>
                                <option value="easy">Easy (4×4 grid, 8 pairs)</option>
                                <option value="medium">Medium (6×6 grid, 18 pairs)</option>
                            </select>
                        </div>
                    </div>
                    <button className="start-btn" onClick={resetRoomSettings}>
                        Reset Room with New Settings
                    </button>
                </div>
            )}

            {error && <p className="error">{error}</p>}
            {renderLeaveConfirmModal()}
            <button className="back-btn" onClick={handleLeaveRoom}>
                Leave Room
            </button>
        </div>
    );
}

export default MemoryMatchGame;