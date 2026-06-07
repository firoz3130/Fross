export default function About({ onClose }: { onClose: () => void }) {
    return (
        <div className="about-container">
            <button className="about-close-btn" onClick={onClose}>
                ← Back
            </button>

            <div className="about-content">
                <div className="about-header">
                    <h1>🎮 Firos Creations</h1>
                    <p className="about-tagline">Building connection through thoughtful game design</p>
                </div>

                <div className="about-highlights">
                    <div className="about-highlight-card">
                        <h4>Play with purpose</h4>
                        <p>Every room is made to bring two people together, not to beat a machine.</p>
                    </div>
                    <div className="about-highlight-card">
                        <h4>Designed for shared moments</h4>
                        <p>Simple gameplay and warm visuals create space for real conversation.</p>
                    </div>
                    <div className="about-highlight-card">
                        <h4>More than a score</h4>
                        <p>Matches are about connection, laughter, and the joy of playing together.</p>
                    </div>
                </div>

                <div className="about-body">
                    <p>
                        This project started with one belief: games should help people feel closer, not more alone.
                    </p>

                    <p>
                        Instead of instant solo wins, this platform invites you to reach out, share a room code, and spend time with someone you care about.
                    </p>

                    <div className="about-callout">
                        <p>Every room is a small reason to text, call, or laugh with another person. It turns a game into a shared memory.</p>
                    </div>

                    <p>
                        The idea was born from personal experience with loneliness and the reminder that even one message or one shared moment can change a day.
                    </p>

                    <blockquote>"The heart becomes quieter when another voice enters it."</blockquote>

                    <p>
                        I truly believe distance between people is rarely measured in kilometers. This project exists to help people reconnect, whether they are friends, siblings, classmates, coworkers, or people who have lost touch.
                    </p>

                    <p>
                        If this platform helps even one person feel a little less alone, then it has already done what it set out to do.
                    </p>
                </div>

                <div className="about-contact">
                    <h3>Let's keep the conversation going.</h3>
                    <h4>Feedback, ideas, and collaboration are always welcome.</h4>
                    <p>📧 <a href="mailto:firosk7@gmail.com">firosk7@gmail.com</a></p>
                    <p>📱 <a href="https://instagram.com/firoz18__" target="_blank" rel="noopener noreferrer">@firoz18__</a> on Instagram</p>
                    <p><a href="https://www.firos.in" target="_blank" rel="noopener noreferrer">firos.in</a></p>
                </div>
            </div>
        </div>
    );
}
