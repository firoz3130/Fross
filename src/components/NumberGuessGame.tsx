import { useEffect, useState } from "react";
import {

    doc,
    getDoc,
    onSnapshot,
    setDoc,
    updateDoc
} from "firebase/firestore";
import { db } from "../firebaseConfig";

interface NumberGuessGameProps {
    onBack: () => void;
}

type RoomData = {
    roomId: string;
    player1Name: string;
    player2Name: string;
    player1Secret: number | null;
    player2Secret: number | null;
    player1Ready: boolean;
    player2Ready: boolean;
    currentPlayer: 1 | 2 | null;
    lastGuess: number | null;
    lastGuessBy: 1 | 2 | null;
    feedback: string;
    winner: 1 | 2 | null;
    history: Array<{ player: string; guess: number; hint: string }>;
    player1Wins: number;
    player2Wins: number;
    streak: number;
    streakPlayer: 1 | 2 | null;
    wrongGuessCount: number;
};

function generateRoomId() {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
}

function NumberGuessGame({ onBack }: NumberGuessGameProps) {
    const [step, setStep] = useState<"menu" | "room">("menu");
    const [roomId, setRoomId] = useState("");
    const [joinCode, setJoinCode] = useState("");
    const [playerNumber, setPlayerNumber] = useState<1 | 2 | null>(null);
    const [playerName, setPlayerName] = useState("");
    const [secret, setSecret] = useState<number | null>(null);
    const [room, setRoom] = useState<RoomData | null>(null);
    const [guess, setGuess] = useState("");
    const [error, setError] = useState("");
    const [status, setStatus] = useState("");
    const [toast, setToast] = useState("");
    const [showStreak, setShowStreak] = useState(false);
    const [showSpecialStreakPopup, setShowSpecialStreakPopup] = useState(false);
    const [specialStreakMessage, setSpecialStreakMessage] = useState("");

    useEffect(() => {
        if (!roomId) return;

        const roomRef = doc(db, "rooms", roomId);
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
        const roomRef = doc(db, "rooms", id);

        await setDoc(roomRef, {
            roomId: id,
            player1Name: playerName.trim(),
            player2Name: "",
            player1Secret: null,
            player2Secret: null,
            player1Ready: false,
            player2Ready: false,
            currentPlayer: null,
            lastGuess: null,
            lastGuessBy: null,
            feedback: "Waiting for both players...",
            winner: null,
            history: [],
            player1Wins: 0,
            player2Wins: 0,
            streak: 0,
            streakPlayer: null,
            wrongGuessCount: 0,
        });

        // Copy room code to clipboard
        try {
            await navigator.clipboard.writeText(id);
            setToast("Room code copied! Share with your best friend. Have fun!");
            setTimeout(() => setToast(""), 3000);
        } catch (err) {
            console.error("Failed to copy room code:", err);
        }

        setRoomId(id);
        setPlayerNumber(1);
        setStep("room");
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

        const roomRef = doc(db, "rooms", code);
        const snapshot = await getDoc(roomRef);

        if (!snapshot.exists()) {
            setError("Room not found.");
            return;
        }

        const data = snapshot.data() as RoomData;
        if (data.player2Ready || data.player2Secret !== null) {
            setError("This room already has two players.");
            return;
        }

        await updateDoc(roomRef, {
            player2Name: playerName.trim(),
        });

        setRoomId(code);
        setPlayerNumber(2);
        setStep("room");
        setStatus("Joined room. Enter your secret number.");
    };

    const submitSecret = async () => {
        setError("");
        if (secret === null || secret < 0 || secret > 100) {
            setError("Secret must be a number between 0 and 100.");
            return;
        }
        if (!roomId || !playerNumber) {
            setError("Room not ready.");
            return;
        }

        const roomRef = doc(db, "rooms", roomId);
        const snapshot = await getDoc(roomRef);
        const data = snapshot.data() as RoomData | undefined;

        if (!data) {
            setError("Room no longer exists.");
            return;
        }

        const updateData: any = {};
        if (playerNumber === 1) {
            updateData.player1Secret = secret;
            updateData.player1Ready = true;
        } else {
            updateData.player2Secret = secret;
            updateData.player2Ready = true;
        }

        const nextPlayer1Secret = playerNumber === 1 ? secret : data.player1Secret;
        const nextPlayer2Secret = playerNumber === 2 ? secret : data.player2Secret;
        const nextPlayer1Ready = playerNumber === 1 ? true : data.player1Ready;
        const nextPlayer2Ready = playerNumber === 2 ? true : data.player2Ready;
        const bothReady = nextPlayer1Ready && nextPlayer2Ready;
        const bothSecretsSet = nextPlayer1Secret !== null && nextPlayer2Secret !== null;

        if (bothReady && bothSecretsSet && data.currentPlayer === null) {
            updateData.currentPlayer = 1;
            updateData.feedback = `Game started! ${data.player1Name} goes first.`;
        } else if (!bothReady || !bothSecretsSet) {
            updateData.feedback = "Waiting for the other player to enter their secret...";
        }

        await updateDoc(roomRef, updateData);
        setStatus((bothReady && bothSecretsSet) ? "Secret saved. Game started." : "Secret saved. Waiting for the other player...");
    };

    const makeGuess = async () => {
        setError("");
        if (!room || !playerNumber) return;
        const guessNum = parseInt(guess);
        if (isNaN(guessNum) || guessNum < 0 || guessNum > 100) {
            setError("Enter a valid guess between 0 and 100.");
            return;
        }

        if (!room.currentPlayer) {
            setError("Waiting for the game to start.");
            return;
        }

        if (room.winner) {
            setError("Game already finished.");
            return;
        }

        if (room.currentPlayer !== playerNumber) {
            setError("It is not your turn.");
            return;
        }

        const target = room.currentPlayer === 1 ? room.player2Secret : room.player1Secret;
        if (target === null) {
            setError("Opponent's secret is not set yet.");
            return;
        }

        const roomRef = doc(db, "rooms", roomId);
        const nextPlayer = room.currentPlayer === 1 ? 2 : 1;
        let feedbackText = "";
        let winner: 1 | 2 | null = null;
        let newHistory = [...room.history];
        let newPlayer1Wins = room.player1Wins;
        let newPlayer2Wins = room.player2Wins;
        let newStreak = room.streak;
        let newStreakPlayer = room.streakPlayer;
        let newWrongGuessCount = room.wrongGuessCount;

        if (guessNum === target) {
            const winnerName = room.currentPlayer === 1 ? room.player1Name : room.player2Name;
            feedbackText = `${winnerName} guessed correctly!`;
            winner = room.currentPlayer;
            if (winner === 1) newPlayer1Wins++;
            else newPlayer2Wins++;
            if (newStreakPlayer === winner) newStreak++;
            else {
                newStreak = 1;
                newStreakPlayer = winner;
            }
            newWrongGuessCount = 0; // Reset on win
            setShowStreak(true);
            setTimeout(() => setShowStreak(false), 5000);
            if (newStreak >= 3) {
                const messages = [
                    "3 wins in a row—this is getting suspicious…",
                    "You did it again. And again. And again. Wow."
                ];
                setSpecialStreakMessage(messages[Math.floor(Math.random() * messages.length)]);
                setShowSpecialStreakPopup(true);
                setTimeout(() => setShowSpecialStreakPopup(false), 5000);
            }
        } else {
            newWrongGuessCount++;
            let hint = "";
            if (newWrongGuessCount >= 3) {
                const diff = Math.abs(guessNum - target);
                if (diff <= 10) hint = " (Hot!)";
                else if (diff <= 50) hint = " (Warm)";
                else hint = " (Cold)";
            }
            if (guessNum < target) {
                feedbackText = `Too low! Guess higher.${hint}`;
            } else {
                feedbackText = `Too high! Guess lower.${hint}`;
            }
        }

        newHistory.push({
            player: room.currentPlayer === 1 ? room.player1Name : room.player2Name,
            guess: guessNum,
            hint: feedbackText
        });

        await updateDoc(roomRef, {
            lastGuess: guessNum,
            lastGuessBy: room.currentPlayer,
            feedback: feedbackText,
            currentPlayer: winner ? room.currentPlayer : nextPlayer,
            winner,
            history: newHistory,
            player1Wins: newPlayer1Wins,
            player2Wins: newPlayer2Wins,
            streak: newStreak,
            streakPlayer: newStreakPlayer,
            wrongGuessCount: newWrongGuessCount
        });

        setGuess("");
    };

    const playAgain = async () => {
        setError("");
        if (!roomId) return;

        const roomRef = doc(db, "rooms", roomId);
        await updateDoc(roomRef, {
            player1Secret: null,
            player2Secret: null,
            player1Ready: false,
            player2Ready: false,
            currentPlayer: null,
            lastGuess: null,
            lastGuessBy: null,
            feedback: "Waiting for both players...",
            winner: null,
            history: [],
            wrongGuessCount: 0,
        });

        setSecret(null);
        setGuess("");
        setStatus("New round started. Enter your secret number.");
    };

    const leaveRoom = () => {
        setStep("menu");
        setRoomId("");
        setJoinCode("");
        setPlayerNumber(null);
        setPlayerName("");
        setSecret(null);
        setRoom(null);
        setGuess("");
        setError("");
        setStatus("");
    };

    if (step === "menu") {
        return (
            <div className="number-guess-setup">
                <h1>Number Guess Game</h1>
                <p>Play with a friend on another device. Create or join a room.</p>
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

    if (step === "room" && !room) {
        return (
            <div className="number-guess-game">
                <h1>Number Guess Game</h1>
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

    const myReady = playerNumber === 1 ? room?.player1Ready : room?.player2Ready;
    const bothReady = room?.player1Ready && room?.player2Ready;
    const isSecretValid = secret !== null && secret >= 0 && secret <= 100;
    const guessNum = guess === "" ? NaN : Number(guess);
    const isGuessValid = !Number.isNaN(guessNum) && guessNum >= 0 && guessNum <= 100;

    return (
        <div className="number-guess-game">
            {toast && <div className="toast">{toast}</div>}
            <h1>Number Guess Game</h1>
            <div className="room-card">
                <p><strong>Room Code:</strong> {roomId}</p>
                <p><strong>You are:</strong> {playerName}</p>
                <p><strong>Status:</strong> {room?.feedback || status}</p>
                <p>{room?.player1Name} ready: {room?.player1Ready ? "Yes" : "No"} | Wins: {room?.player1Wins || 0}</p>
                <p>{room?.player2Name} ready: {room?.player2Ready ? "Yes" : "No"} | Wins: {room?.player2Wins || 0}</p>
                {room?.streak && room?.streakPlayer && showStreak && (
                    <p className="streak">{room.streakPlayer === 1 ? room.player1Name : room.player2Name} is on a {room.streak}-round streak!</p>
                )}
            </div>

            {!myReady && (
                <div className="secret-inputs">
                    <label>Enter your secret number</label>
                    <input
                        type="number"
                        min="0"
                        max="100"
                        value={secret ?? ""}
                        onChange={(e) => {
                            const value = e.target.value;
                            if (value === "") {
                                setSecret(null);
                                return;
                            }
                            const num = parseInt(value, 10);
                            if (!Number.isNaN(num)) {
                                setSecret(Math.min(100, Math.max(0, num)));
                            }
                        }}
                    />
                    <button className="start-btn" onClick={submitSecret} disabled={!isSecretValid}>
                        Save Secret
                    </button>
                </div>
            )}

            {myReady && !bothReady && (
                <p>Waiting for the other player to enter their secret...</p>
            )}

            {bothReady && !room?.winner && (
                <div className="guess-section">
                    <p>Current turn: {room?.currentPlayer ? (room.currentPlayer === 1 ? room.player1Name : room.player2Name) : "starting soon..."}</p>
                    {room.currentPlayer === playerNumber ? (
                        <>
                            <label>Enter your guess</label>
                            <input
                                type="number"
                                min="0"
                                max="100"
                                value={guess}
                                onChange={(e) => setGuess(e.target.value)}
                                onKeyPress={(e) => e.key === "Enter" && makeGuess()}
                            />
                            <button className="start-btn" onClick={makeGuess} disabled={!isGuessValid}>
                                Guess
                            </button>
                        </>
                    ) : (
                        <p>Waiting for {room.currentPlayer === 1 ? room.player1Name : room.player2Name} to guess.</p>
                    )}
                </div>
            )}

            {room && room.lastGuess !== null && room.lastGuessBy !== null && (
                <p className="feedback">
                    {room.lastGuessBy === 1 ? room.player1Name : room.player2Name} guessed {room.lastGuess}. {room.feedback}
                </p>
            )}

            {room && room.history.length > 0 && (
                <div className="round-history">
                    <h3>Round History</h3>
                    <ul>
                        {room.history.slice(-5).map((entry, index) => (
                            <li key={index}>{entry.player} guessed {entry.guess} → {entry.hint}</li>
                        ))}
                    </ul>
                </div>
            )}

            {room?.winner && (
                <div className="winner-banner">
                    <h2>{room.winner === playerNumber ? "YAY!! Guessing champion!" : "OOPPS... not this time."}</h2>
                    <p>
                        {room.winner === playerNumber
                            ? `YAY!! You are a master at guessing. ${room.winner === 1 ? room.player1Name : room.player2Name} wins this round!`
                            : `${room.winner === 1 ? room.player1Name : room.player2Name} had the golden guess. Keep your head up, the next round is yours.`}
                    </p>
                    <p className="winner-note">Your opponent may already be waiting for a rematch.</p>
                    {showSpecialStreakPopup ? (
                        <div className="special-streak-popup">
                            <p>{specialStreakMessage}</p>
                        </div>
                    ) : (
                        <button className="start-btn" onClick={playAgain}>
                            Play Again
                        </button>
                    )}
                </div>
            )}

            {error && <p className="error">{error}</p>}

            <button className="back-btn" onClick={leaveRoom}>
                Leave Room
            </button>
        </div>
    );
}

export default NumberGuessGame;