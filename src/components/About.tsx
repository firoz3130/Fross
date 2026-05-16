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
                        This project was built with a simple idea: games should bring people closer, not push them further apart.
                    </p>

                    <p>
                        Most games today allow you to play instantly against a computer or random strangers. But this platform was intentionally designed differently. There is no "Play vs Computer" option  becuase the goal was nevre just to win a game. The goal was to create a reason to reach out to someone.
                    </p>

                    <p>
                        To play here, you need another person. You need to whatsapp that person, call them, share our game code, and spend a few moments together playing and connecting. That small interaction matters more than the game itself.
                    </p>

                    <p>
                        This idea came from a deeply personal place. The author went through periods of intense loneliness, emotional heaviness, and moments where it felt like there was nobody to talk to. During those times, one message, one call, or one shared moment could have made a difference.
                        In my mother tongue, there’s a saying that roughly translates to:
                            <blockquote>"The heart becomes quieter when another voice enters it."</blockquote>
                    </p>

                    <p>
                        <em>And it was born from that feeling.</em>
                    </p>

                    <p>
                        So I genuinely believe that "Distance between people is rarely measured in kilometers". Every multiplayer room created here is meant to encourage human connection , between friends, siblings, classmates, coworkers, or even people reconnecting after a long time. Sometimes, a simple game can become the reason a conversation starts again.
                    </p>

                    <p>
                        If this platform helps even one person feel a little less alone, then it has already achieved its purpose.
                    </p>
                </div>

               <div className="about-contact">
                <h3>If this project connected with you in any way, let's connect.</h3>
                <h4>
                    Whether it's feedback, ideas, collaboration, or just a conversation,
                    I'd genuinely love to hear from you.
                </h4>
                <p>
                        📧 <a href="mailto:firosk7@gmail.com">firosk7@gmail.com</a>
                    </p>
                    <p>
                        📱 <a href="https://instagram.com/firoz18__" target="_blank" rel="noopener noreferrer">@firoz18__</a> on Instagram
                    </p>
                    <p>
                        <a href="https://www.firos.in" target="_blank" rel="noopener noreferrer">firos.in</a>
                    </p>
                </div>
            </div>
        </div>
    );
}
