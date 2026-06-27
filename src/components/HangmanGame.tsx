import { useEffect, useMemo, useState } from "react";
import { HANGMAN_CATEGORIES } from "../data/hangmanWords";

type HangmanGameProps = {
    onBack: () => void;
};

type HangmanStats = {
    wins: number;
    losses: number;
    currentStreak: number;
    bestStreak: number;
};

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
const MAX_MISTAKES = 6;
const STORAGE_KEY = "hangmanStats";

const DIFFICULTY_LABELS = {
    easy: "Easy",
    medium: "Medium",
    hard: "Hard",
} as const;

type Difficulty = keyof typeof DIFFICULTY_LABELS;

const difficultyFilter: Record<Difficulty, (word: string) => boolean> = {
    easy: (word) => word.replace(/\s+/g, "").length <= 5,
    medium: (word) => {
        const length = word.replace(/\s+/g, "").length;
        return length >= 6 && length <= 8;
    },
    hard: (word) => word.replace(/\s+/g, "").length >= 9,
};

function getStoredStats(): HangmanStats {
    try {
        const stored = window.localStorage.getItem(STORAGE_KEY);
        if (stored) {
            return JSON.parse(stored) as HangmanStats;
        }
    } catch {
        // ignore parse errors
    }
    return {
        wins: 0,
        losses: 0,
        currentStreak: 0,
        bestStreak: 0,
    };
}

function getRandomItem<T>(items: T[]): T {
    return items[Math.floor(Math.random() * items.length)];
}

function chooseGameWord(difficulty: Difficulty) {
    const categoriesWithWords = HANGMAN_CATEGORIES.map((category) => ({
        category,
        words: category.words.filter(difficultyFilter[difficulty]),
    })).filter((entry) => entry.words.length > 0);

    const entry = getRandomItem(categoriesWithWords.length ? categoriesWithWords : HANGMAN_CATEGORIES.map((category) => ({ category, words: category.words })));
    const word = getRandomItem(entry.words.length ? entry.words : entry.category.words);
    return { categoryName: entry.category.name, word };
}

function HangmanGame({ onBack }: HangmanGameProps) {
    const [difficulty, setDifficulty] = useState<Difficulty>("easy");
    const [category, setCategory] = useState<string>("");
    const [word, setWord] = useState<string>("");
    const [guessedLetters, setGuessedLetters] = useState<string[]>([]);
    const [mistakes, setMistakes] = useState(0);
    const [remainingHints, setRemainingHints] = useState(3);
    const [stats, setStats] = useState<HangmanStats>(getStoredStats());
    const [gameOver, setGameOver] = useState(false);
    const [won, setWon] = useState(false);
    const [resultRecorded, setResultRecorded] = useState(false);
    const [showConfetti, setShowConfetti] = useState(false);

    useEffect(() => {
        setStats(getStoredStats());
    }, []);

    useEffect(() => {
        if (stats) {
            try {
                window.localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
            } catch {
                // ignore storage errors
            }
        }
    }, [stats]);

    const hiddenLetters = useMemo(
        () => word.split("").map((letter) => (letter === " " ? " " : guessedLetters.includes(letter) ? letter : "_")),
        [word, guessedLetters]
    );

    const hasWon = useMemo(() => word.length > 0 && hiddenLetters.every((letter) => letter !== "_"), [hiddenLetters, word]);

    const disabledLetters = useMemo(() => new Set(guessedLetters), [guessedLetters]);

    const incorrectGuesses = useMemo(
        () => guessedLetters.filter((letter) => !word.includes(letter)).length,
        [guessedLetters, word]
    );

    const showGameOver = gameOver || hasWon || incorrectGuesses >= MAX_MISTAKES;

    useEffect(() => {
        function handleKeyUp(event: KeyboardEvent) {
            if (showGameOver) return;
            const key = event.key.toUpperCase();
            if (ALPHABET.includes(key)) {
                handleLetterGuess(key);
            }
        }

        window.addEventListener("keyup", handleKeyUp);
        return () => window.removeEventListener("keyup", handleKeyUp);
    }, [showGameOver, guessedLetters, word]);

    useEffect(() => {
        startNewGame(difficulty);
    }, [difficulty]);

    useEffect(() => {
        if (!word || resultRecorded) return;
        if (hasWon) {
            setWon(true);
            setShowConfetti(true);
            updateStats(true);
            setResultRecorded(true);
            window.setTimeout(() => setShowConfetti(false), 2000);
            return;
        }

        if (incorrectGuesses >= MAX_MISTAKES) {
            setGameOver(true);
            updateStats(false);
            setResultRecorded(true);
        }
    }, [hasWon, incorrectGuesses, word, resultRecorded]);

    function updateStats(didWin: boolean) {
        setStats((current) => {
            const next = { ...current };
            if (didWin) {
                next.wins += 1;
                next.currentStreak += 1;
                next.bestStreak = Math.max(next.bestStreak, next.currentStreak);
            } else {
                next.losses += 1;
                next.currentStreak = 0;
            }
            return next;
        });
    }

    function startNewGame(overriddenDifficulty: Difficulty = difficulty) {
        const chosen = chooseGameWord(overriddenDifficulty);
        setCategory(chosen.categoryName);
        setWord(chosen.word);
        setGuessedLetters([]);
        setMistakes(0);
        setRemainingHints(3);
        setGameOver(false);
        setWon(false);
        setResultRecorded(false);
        setShowConfetti(false);
    }

    function handleLetterGuess(letter: string) {
        if (showGameOver || disabledLetters.has(letter)) return;
        const nextLetters = [...guessedLetters, letter];
        setGuessedLetters(nextLetters);
        if (!word.includes(letter)) {
            setMistakes((current) => Math.min(MAX_MISTAKES, current + 1));
        }
    }

    function handleHint() {
        if (remainingHints <= 0 || showGameOver) return;
        const hidden = word
            .split("")
            .filter((letter) => letter !== " " && !guessedLetters.includes(letter));

        if (!hidden.length) return;

        const nextLetter = hidden[Math.floor(Math.random() * hidden.length)];
        setGuessedLetters((current) => [...current, nextLetter]);
        setRemainingHints((current) => current - 1);
    }

    function renderWord() {
        return (
            <div className="hangman-word" aria-label="Mystery word">
                {hiddenLetters.map((letter, index) => (
                    <div key={`${letter}-${index}`} className="hangman-letter-box">
                        <span className={`hangman-letter ${letter !== " " ? "revealed" : "space"}`}>
                            {letter}
                        </span>
                    </div>
                ))}
            </div>
        );
    }

    function handleDifficultyChange(value: Difficulty) {
        setDifficulty(value);
    }

    return (
        <div className="hangman-page">
            <div className="hangman-shell">
                <div className="hangman-header">
                    <button className="back-to-menu-btn" type="button" onClick={onBack}>
                        ← Back to Menu
                    </button>
                    <div className="hangman-score-panel">
                        <div>
                            <p>Wins</p>
                            <strong>{stats.wins}</strong>
                        </div>
                        <div>
                            <p>Losses</p>
                            <strong>{stats.losses}</strong>
                        </div>
                        <div>
                            <p>Streak</p>
                            <strong>{stats.currentStreak}</strong>
                        </div>
                        <div>
                            <p>Best</p>
                            <strong>{stats.bestStreak}</strong>
                        </div>
                    </div>
                </div>

                <section className="hangman-info-panel">
                    <div>
                        <p className="hangman-label">Category</p>
                        <h2>{category || "Loading..."}</h2>
                    </div>
                    <div className="hangman-difficulty-row" role="group" aria-label="Difficulty selector">
                        {Object.entries(DIFFICULTY_LABELS).map(([key, label]) => (
                            <button
                                key={key}
                                type="button"
                                className={`hangman-difficulty-btn ${difficulty === key ? "active" : ""}`}
                                onClick={() => handleDifficultyChange(key as Difficulty)}
                            >
                                {label}
                            </button>
                        ))}
                    </div>
                </section>

                <div className="hangman-card">
                    <div className="hangman-display">
                        <div className="hangman-word-card">
                            <p className="hangman-label">Guess the word</p>
                            {renderWord()}
                        </div>

                        <div className="hangman-figure" aria-hidden="true">
                            <svg viewBox="0 0 260 320" className="hangman-svg">
                                <path d="M40 300 L180 300" className="hangman-base" />
                                <path d="M90 300 L90 40 L220 40 L220 80" className="hangman-post" />
                                <path d="M220 80 L170 80" className="hangman-beam" />
                                <line x1="170" y1="80" x2="170" y2="110" className="hangman-rope" />
                                <circle cx="170" cy="135" r="22" className={`hangman-part hangman-head ${mistakes > 0 ? "visible" : ""}`} />
                                <line x1="170" y1="157" x2="170" y2="220" className={`hangman-part hangman-body ${mistakes > 1 ? "visible" : ""}`} />
                                <line x1="170" y1="170" x2="140" y2="200" className={`hangman-part hangman-arm ${mistakes > 2 ? "visible" : ""}`} />
                                <line x1="170" y1="170" x2="200" y2="200" className={`hangman-part hangman-arm ${mistakes > 3 ? "visible" : ""}`} />
                                <line x1="170" y1="220" x2="150" y2="265" className={`hangman-part hangman-leg ${mistakes > 4 ? "visible" : ""}`} />
                                <line x1="170" y1="220" x2="190" y2="265" className={`hangman-part hangman-leg ${mistakes > 5 ? "visible" : ""}`} />
                            </svg>
                        </div>
                    </div>

                    <div className="hangman-controls">
                        <div className="hangman-hint-row">
                            <button
                                type="button"
                                className="hint-btn"
                                onClick={handleHint}
                                disabled={remainingHints <= 0 || showGameOver}
                            >
                                Hint ({remainingHints})
                            </button>
                            <button type="button" className="play-again-btn" onClick={() => startNewGame(difficulty)}>
                                Start New Word
                            </button>
                        </div>

                        <div className="hangman-keyboard" role="application" aria-label="Letter keyboard">
                            {ALPHABET.map((letter) => {
                                const isCorrect = word.includes(letter);
                                const isGuessed = disabledLetters.has(letter);
                                return (
                                    <button
                                        key={letter}
                                        type="button"
                                        className={`keyboard-key ${isGuessed ? (isCorrect ? "correct" : "incorrect") : ""}`}
                                        onClick={() => handleLetterGuess(letter)}
                                        disabled={isGuessed || showGameOver}
                                        aria-pressed={isGuessed}
                                        aria-label={`Letter ${letter}${isGuessed ? ", guessed" : ""}`}
                                    >
                                        {letter}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>

            <div className={`hangman-modal-overlay ${showGameOver ? "visible" : ""}`}>
                <div className="hangman-modal" role="dialog" aria-modal="true" aria-labelledby="hangman-modal-title">
                    <div className="hangman-modal-icon">{won ? "🎉" : "☠️"}</div>
                    <h2 id="hangman-modal-title">{won ? "You Won!" : "Game Over"}</h2>
                    <p>{won ? "Nice work!" : "The word was:"}</p>
                    <p className="hangman-answer">{word}</p>
                    <button type="button" className="play-again-btn" onClick={() => startNewGame(difficulty)}>
                        Play Again
                    </button>
                </div>
            </div>

            {showConfetti && <div className="hangman-confetti" aria-hidden="true" />}
        </div>
    );
}

export default HangmanGame;
