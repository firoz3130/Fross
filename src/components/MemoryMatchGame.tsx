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
        ['brave', 'courageous'], ['calm', 'peaceful'], ['bright', 'shiny'], ['strong', 'powerful']
    ],
    antonyms: [
        ['hot', 'cold'], ['up', 'down'], ['day', 'night'], ['good', 'bad'],
        ['fast', 'slow'], ['big', 'small'], ['happy', 'sad'], ['hard', 'soft']
    ]
};

// Number pairs for memory game
const NUMBER_PAIRS = {
    equations: [
        ['2+2', '4'], ['5×3', '15'], ['10÷2', '5'], ['7+8', '15'],
        ['9-4', '5'], ['6×4', '24'], ['12÷3', '4'], ['3+7', '10']
    ],
    sequences: [
        ['1,2,3', '4'], ['2,4,6', '8'], ['5,10,15', '20'], ['3,6,9', '12'],
        ['1,3,5', '7'], ['2,3,5', '7'], ['1,4,7', '10'], ['2,5,8', '11']
    ]
};

function generateCards(gameMode: GameMode, difficulty: Difficulty): Card[] {
    let pairs: string[][] = [];
    const gridSize = difficulty === 'easy' ? 16 : difficulty === 'medium' ? 24 : 36; // 4x4, 6x6, 6x6
    const numPairs = gridSize / 2;

    if (gameMode === 'words') {
        const synonymPairs = WORD_PAIRS.synonyms.slice(0, numPairs / 2);
        const antonymPairs = WORD_PAIRS.antonyms.slice(0, numPairs / 2);
        pairs = [...synonymPairs, ...antonymPairs];
    } else {
        const equationPairs = NUMBER_PAIRS.equations.slice(0, numPairs / 2);
        const sequencePairs = NUMBER_PAIRS.sequences.slice(0, numPairs / 2);
        pairs = [...equationPairs, ...sequencePairs];
    }

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
        if (!roomId) return;

        const cards = generateCards(room?.gameMode || 'words', room?.difficulty || 'easy');
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
                            <option value="easy">Easy (4×4 grid)</option>
                            <option value="medium">Medium (6×6 grid)</option>
                            <option value="hard">Hard (6×6 grid, more pairs)</option>
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
                <button className="back-btn" onClick={leaveRoom}>
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
                            maxWidth: gridSize === 4 ? '400px' : '500px'
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
                                        fontSize: gridSize === 4 ? '1.2rem' : '1rem',
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

            {error && <p className="error">{error}</p>}

            <button className="back-btn" onClick={leaveRoom}>
                Leave Room
            </button>
        </div>
    );
}

export default MemoryMatchGame;