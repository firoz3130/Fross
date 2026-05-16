import { useEffect, useState } from "react";
import { doc, getDoc, onSnapshot, setDoc, updateDoc } from "firebase/firestore";
import { db } from "../../firebaseConfig";
import PasscodeInput from "./PasscodeInput";
import GuessHistory from "./GuessHistory";

type RoomHistoryItem = {
    player: 1 | 2;
    guess: string;
    correctPositions: number[];
    ts: number;
};

type PasscodeRoom = {
    roomId: string;
    player1Name: string;
    player2Name: string;
    player1Secret: string | null;
    player2Secret: string | null;
    player1Locked: (string | null)[];
    player2Locked: (string | null)[];
    currentPlayer: 1 | 2 | null;
    started: boolean;
    winner: 1 | 2 | null;
    history: RoomHistoryItem[];
    status: string;
};

export default function PasscodeClash({ onBack }: { onBack: () => void }) {
    const [roomCode, setRoomCode] = useState("");
    const [stage, setStage] = useState<"lobby" | "room">("lobby");
    const [joinCode, setJoinCode] = useState("");
    const [name, setName] = useState("");
    const [toast, setToast] = useState("");
    const [error, setError] = useState("");
    const [room, setRoom] = useState<PasscodeRoom | null>(null);
    const [playerNumber, setPlayerNumber] = useState<1 | 2 | null>(null);

    useEffect(() => {
        if (!roomCode || stage === 'lobby') return;

        const roomRef = doc(db, "passcodeRooms", roomCode);
        const unsubscribe = onSnapshot(roomRef, (snapshot) => {
            if (!snapshot.exists()) {
                setRoom(null);
                setError("Room not found.");
                return;
            }
            setRoom(snapshot.data() as PasscodeRoom);
            setError("");
        }, (err) => {
            setError("Unable to load room: " + err.message);
        });

        return () => unsubscribe();
    }, [roomCode, stage]);

    function resetToast(message: string, duration = 3000) {
        setToast(message);
        setTimeout(() => setToast(""), duration);
    }

    function generateRoomId() {
        return Math.random().toString(36).substring(2, 8).toUpperCase();
    }

    async function createRoom() {
        setError("");
        if (!name.trim()) {
            setError("Please enter your name.");
            return;
        }
        const code = generateRoomId();
        const roomRef = doc(db, "passcodeRooms", code);
        const newRoom: PasscodeRoom = {
            roomId: code,
            player1Name: name.trim(),
            player2Name: "",
            player1Secret: null,
            player2Secret: null,
            player1Locked: [null, null, null, null],
            player2Locked: [null, null, null, null],
            currentPlayer: 1,
            started: false,
            winner: null,
            history: [],
            status: "Waiting for another player to join...",
        };

        await setDoc(roomRef, newRoom);
        try {
            await navigator.clipboard.writeText(code);
            resetToast("Room code copied! Share it with your friend.");
        } catch (err) {
            resetToast("Room created. Please copy the code manually.");
        }
        setRoomCode(code);
        setPlayerNumber(1);
        setStage("room");
    }

    async function joinRoom() {
        setError("");
        if (!name.trim()) {
            setError("Please enter your name.");
            return;
        }
        if (!joinCode.trim()) {
            setError("Enter a room code to join.");
            return;
        }

        const code = joinCode.trim().toUpperCase();
        const roomRef = doc(db, "passcodeRooms", code);
        const snapshot = await getDoc(roomRef);
        if (!snapshot.exists()) {
            setError("Room not found.");
            return;
        }

        const data = snapshot.data() as PasscodeRoom;
        if (data.player2Name) {
            setError("Room already has two players.");
            return;
        }

        await updateDoc(roomRef, {
            player2Name: name.trim(),
            status: `${name.trim()} joined! Enter your secret passcode.`,
        });

        setRoomCode(code);
        setPlayerNumber(2);
        setStage("room");
        resetToast("Joined room " + code);
    }

    async function saveSecret(code: string) {
        if (!code.match(/^\d{4}$/)) {
            setError("Enter a 4-digit secret passcode.");
            return;
        }
        if (!room || !playerNumber) {
            setError("Room is not ready yet.");
            return;
        }

        const roomRef = doc(db, "passcodeRooms", room.roomId);
        const updateData: any = {};
        if (playerNumber === 1) {
            updateData.player1Secret = code;
        } else {
            updateData.player2Secret = code;
        }

        const otherSecret = playerNumber === 1 ? room.player2Secret : room.player1Secret;
        if (otherSecret) {
            updateData.status = "Both secrets set. Ready to start.";
        } else {
            updateData.status = "Secret saved. Waiting for the other player to enter theirs...";
        }

        await updateDoc(roomRef, updateData);
        resetToast("Secret saved.");
    }

    async function startGame() {
        if (!room || !playerNumber) return;
        if (!room.player1Secret || !room.player2Secret) {
            setError("Both players must set secrets before starting.");
            return;
        }

        const roomRef = doc(db, "passcodeRooms", room.roomId);
        await updateDoc(roomRef, {
            started: true,
            status: "Game started! " + room.player1Name + " goes first.",
        });
    }

    async function resetRound() {
        if (!room) return;
        const roomRef = doc(db, "passcodeRooms", room.roomId);
        await updateDoc(roomRef, {
            player1Secret: null,
            player2Secret: null,
            player1Locked: [null, null, null, null],
            player2Locked: [null, null, null, null],
            currentPlayer: 1,
            started: false,
            winner: null,
            history: [],
            status: "Secrets cleared. Enter new passcodes to start again.",
        });
        resetToast("New round ready. Enter fresh secrets.");
    }

    async function submitGuess(guess: string) {
        if (!room || !playerNumber || !room.started) return;
        if (room.currentPlayer !== playerNumber) return;
        const opponent = playerNumber === 1 ? 2 : 1;
        const opponentSecret = opponent === 1 ? room.player1Secret : room.player2Secret;
        if (!opponentSecret) return;

        const correctPositions: number[] = [];
        for (let i = 0; i < 4; i++) {
            if (guess[i] === opponentSecret[i]) correctPositions.push(i);
        }

        const roomRef = doc(db, "passcodeRooms", room.roomId);
        const updateData: any = {};
        const lockedField = playerNumber === 1 ? "player1Locked" : "player2Locked";
        const previousLocked = playerNumber === 1 ? room.player1Locked : room.player2Locked;
        const nextLocks = [...previousLocked];
        correctPositions.forEach((pos) => {
            nextLocks[pos] = guess[pos];
        });
        updateData[lockedField] = nextLocks;

        const nextPlayer = opponent;
        updateData.currentPlayer = nextPlayer;
        updateData.history = [
            { player: playerNumber, guess, correctPositions, ts: Date.now() },
            ...room.history,
        ];

        if (correctPositions.length === 4) {
            updateData.winner = playerNumber;
            updateData.started = false;
            updateData.status = `${playerNumber === 1 ? room.player1Name : room.player2Name} cracked the code!`;
        } else {
            updateData.status = `${playerNumber === 1 ? room.player1Name : room.player2Name} guessed. ${nextPlayer === 1 ? room.player1Name : room.player2Name}'s turn.`;
        }

        await updateDoc(roomRef, updateData);
    }

    const myName = playerNumber === 1 ? room?.player1Name : room?.player2Name;
    const opponentName = playerNumber === 1 ? room?.player2Name : room?.player1Name;
    const mySecretSet = playerNumber === 1 ? room?.player1Secret : room?.player2Secret;
    const lockedForMe = playerNumber === 1 ? room?.player1Locked : room?.player2Locked;
    const isMyTurn = room?.currentPlayer === playerNumber;

    return (
        <div className="passcode-clash">
            <button className="back-to-menu-btn" onClick={onBack}>← Back</button>

            <div className="pc-header">
                <h2>Passcode Clash</h2>
                <div className="room-code">Room: <strong>{roomCode || "—"}</strong> <button className="copy-room" onClick={() => navigator.clipboard?.writeText(roomCode)}>Copy</button></div>
            </div>

            {toast && <div className="toast">{toast}</div>}
            {error && <div className="error">{error}</div>}

            {stage === 'lobby' && (
                <div className="pc-lobby">
                    <div className="pc-lobby-col">
                        <h3>Create a room</h3>
                        <label>Name</label>
                        <input value={name} onChange={e => setName(e.target.value)} placeholder="Your name" />
                        <button className="glow-btn large" onClick={createRoom}>Create Room</button>
                    </div>

                    <div className="pc-lobby-col join">
                        <h3>Join a room</h3>
                        <label>Name</label>
                        <input value={name} onChange={e => setName(e.target.value)} placeholder="Your name" />
                        <label>Room code</label>
                        <input className="room-input" placeholder="Enter room code" value={joinCode} onChange={e => setJoinCode(e.target.value.toUpperCase())} />
                        <button className="glow-btn large" onClick={joinRoom}>Join Room</button>
                    </div>
                </div>
            )}

            {stage === 'room' && (
                <div className="pc-room">
                    <div className="pc-room-status">{room?.status || "Waiting for room..."}</div>

                    <div className="pc-player-summary">
                        <div className="pc-player-card">
                            <h4>{room?.player1Name || "Player 1"}</h4>
                            <div>{room?.player1Secret ? "Secret set" : "Waiting for secret"}</div>
                        </div>
                        <div className="pc-player-card">
                            <h4>{room?.player2Name || "Player 2"}</h4>
                            <div>{room?.player2Secret ? "Secret set" : "Waiting for secret"}</div>
                        </div>
                    </div>

                    {room && playerNumber && !mySecretSet && (
                        <div className="pc-secret-entry">
                            <h4>Hi {myName || "Player"}, enter your secret passcode</h4>
                            <PasscodeInput onSubmit={saveSecret} />
                        </div>
                    )}

                    {room && playerNumber && mySecretSet && !room.started && (
                        <div className="pc-secret-entry">
                            <h4>Your secret is set.</h4>
                            <p>{opponentName ? `Waiting for ${opponentName} to set theirs...` : "Waiting for opponent to join."}</p>
                        </div>
                    )}

                    {room && room.player1Secret && room.player2Secret && !room.started && !room.winner && (
                        <button className="glow-btn start-btn" onClick={startGame}>Start Game</button>
                    )}

                    {room && room.winner && !room.started && (
                        <button className="glow-btn start-btn" onClick={resetRound}>Play Again</button>
                    )}

                    {room?.started && (
                        <div className="pc-game-area">
                            <div className="pc-side">
                                <h4>Your progress</h4>
                                <div className="locked-display">{lockedForMe?.map((d, i) => <span key={i} className={d ? 'locked' : ''}>{d ?? '_'}</span>)}</div>
                                {room?.winner ? (
                                    <div className="pc-win-message">{room.winner === playerNumber ? "You cracked it!" : `${opponentName || "Opponent"} cracked it.`}</div>
                                ) : isMyTurn ? (
                                    <PasscodeInput locked={lockedForMe} onSubmit={submitGuess} />
                                ) : (
                                    <div className="waiting">Waiting for {opponentName || "opponent"}...</div>
                                )}
                            </div>

                            <div className="pc-side">
                                <h4>Guess history</h4>
                                <GuessHistory items={room.history} player1Name={room?.player1Name} player2Name={room?.player2Name} />
                            </div>
                        </div>
                    )}

                    {room?.winner && !room.started && (
                        <div className="pc-win">
                            <h3>{room.winner === playerNumber ? "You win 🎉" : `${opponentName || "Opponent"} wins 🎉`}</h3>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
