export default function About({ onClose }: { onClose: () => void }) {
    return (
        <div className="about-container">
            <button className="about-close-btn" onClick={onClose}>
                ← Back
            </button>

            <div className="about-content">
                <div className="about-header">
                    <h1>🎮 Firos Creations</h1>
                    <p className="about-tagline">Building connections through games</p>
                </div>

                <div className="about-body">
                    <p>
                        Firos Creations was built with a simple idea: games should bring people closer, not push them further apart.
                    </p>

                    <p>
                        Most games today allow you to play instantly against a computer or random strangers. But this platform was intentionally designed differently(not because I dont want too much complexity in code😁). There is no "Play vs Computer" option  because the goal was never just to win a game. The goal was to create a reason to reach out to someone.
                    </p>

                    <p>
                        To play here, you need another person. You need to whatsapp that person, call them, share our game code, and spend a few moments together playing and connecting. That small interaction matters more than the game itself.
                    </p>

                    <p>
                        This idea came from a deeply personal place. The author went through periods of intense loneliness, emotional heaviness, and moments where it felt like there was nobody to talk to. During those times, one message, one call, or one shared moment could have made a difference.
                    </p>

                    <p>
                        <em>And it was born from that feeling.</em>
                    </p>

                    <p>
                        Every multiplayer room created here is meant to encourage human connection , between friends, siblings, classmates, coworkers, or even people reconnecting after a long time. Sometimes, a simple game can become the reason a conversation starts again.
                    </p>

                    <p>
                        If this platform helps even one person feel a little less alone, then it has already achieved its purpose.
                    </p>
                </div>

                <div className="about-contact">
                    <h3>If you'd like to know me, Let's connect</h3>
                    <p>
                        📧 <a href="mailto:firosk7@gmail.com">firosk7@gmail.com</a>
                    </p>
                    <p>
                        📱 <a href="https://instagram.com/firoz18__" target="_blank" rel="noopener noreferrer">@firoz18__</a> on Instagram
                    </p>
                </div>
            </div>
        </div>
    );
}
