type HistoryItem = {
    player: number;
    guess: string;
    correctPositions: number[];
    ts: number;
};

export default function GuessHistory({ items, player1Name, player2Name }: { items: HistoryItem[], player1Name?: string, player2Name?: string }) {
    const label = (player: number) => player === 1 ? (player1Name || "Player 1") : (player2Name || "Player 2");

    return (
        <div className="guess-history">
            <h4>Guess History</h4>
            <div className="history-list">
                {items.length === 0 && <div className="empty">No guesses yet</div>}
                {items.map((it, idx) => (
                    <div className="history-card" key={idx}>
                        <div className="history-meta">{label(it.player)} • {new Date(it.ts).toLocaleTimeString()}</div>
                        <div className="history-guess">{it.guess.split('').map((c, i) => (
                            <span key={i} className={it.correctPositions.includes(i) ? 'correct' : ''}>{c}</span>
                        ))}</div>
                    </div>
                ))}
            </div>
        </div>
    )
}
