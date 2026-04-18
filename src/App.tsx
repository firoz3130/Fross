import { useState, useEffect } from "react";
import "./App.css";

import Board from "./components/Board";
import LetterCircle from "./components/LetterCircle";

import { generateGrid } from "./logic/generateGrid";
import { generateLevel } from "./logic/generateLevel";

import { LEVELS } from "./data/levels";
import { THEMES } from "./data/themes";
import HintButton from "./components/HintButton"
import LevelMap from "./components/LevelMap"
import { sounds } from "./logic/sound";
import NumberGuessGame from "./components/NumberGuessGame";
import MemoryMatchGame from "./components/MemoryMatchGame"
import ScribblGame from "./components/ScribblGame";

type View = 'menu' | 'crossword' | 'numberGuess' | 'memoryMatch' | 'scribbl';

function App() {
  const [currentView, setCurrentView] = useState<View>('menu');

  const [levelIndex, setLevelIndex] = useState(0)
  const [maxUnlocked, setMaxUnlocked] = useState(0)
  const [currentTheme, setCurrentTheme] = useState(THEMES[0])
  const [letters, setLetters] = useState(LEVELS[0].letters)

  const [words, setWords] = useState<string[]>([])
  const [puzzle, setPuzzle] = useState<any>(null)

  const [solvedWords, setSolvedWords] = useState<string[]>([])

  const [showLevelComplete, setShowLevelComplete] = useState(false)
  const [gameCompleted, setGameCompleted] = useState(false)
  const [showMap, setShowMap] = useState(false)
  const [menuQuote, setMenuQuote] = useState(
    "Whenever life feels overwhelming, stressed, come here, play a little, and unwind. This space was made for you , with Love."
  )

  const QUOTES = [
    "Whenever life feels overwhelming, stressed, come here, play a little, and unwind. This space was made for you , with Love.",
    "You don’t have to solve everything today. Just take it one step at a time.",
    "It’s okay to pause. Rest is part of progress.",
    "This moment is not forever. Things can and will change.",
    "You’re allowed to take a break without feeling guilty.",
    "Breathe. You’ve made it through difficult days before.",
    "You are better than you think, stronger than you know, and more capable than you imagine.",
    "It’s okay to ask for help. You don’t have to do it all alone.",
    "Focus on what you can control, and let go of what you can’t.",
    "Small steps forward are still progress. Keep going at your own pace.",
    "You’re doing better than you think, even if it doesn’t feel like it.",
    "Built for real people—join friends, play together, and don’t face tough moments alone.",
    "Built for real people, Don't be lonely. play together, and turn lonely, heavy moments into something lighter.",
    "Take a deep breath. You don’t have to carry everything at once.",
    "People should remember you for how you make them feel",
    "Slow down. Not everything needs to be figured out right now.",
    "I know you are moody, Chalo let’s just play a game and chill.",
    "Life's so short, forgetting is sooo long. Let's make some fun memories together.",
    "Be such a true friend that you’re part of the last 7 minutes of their most cherished memories.",
    "It’s okay if today is just about getting through.",
    "You are allowed to have days where you do less.",
    "Even small steps count. You’re still moving forward.",
    "Be gentle with yourself. You’re trying your best.",
    "You don’t need to rush your healing.",
    "Some days are heavy, and that’s okay.",
    "You’ve survived every hard day so far. That matters.",
    "Let today be enough, just as it is.",
    "You don’t have to be strong all the time.",
    "It’s okay to rest your mind for a while.",
    "Things may feel messy, but that doesn’t mean they’re falling apart.",
    "You’re allowed to step back and breathe.",
    "Not everything needs your energy right now.",
    "You can start again, as many times as you need.",
    "You’re not behind. You’re on your own path.",
    "It’s okay to take things slowly today.",
    "You don’t need to prove anything right now.",
    "Peace can begin with one quiet moment.",
    "Even a little progress is still progress.",
    "You’re allowed to take up space and feel your feelings.",
    "This feeling will pass, even if it takes time.",
    "You are more than what you’re going through.",
    "It’s okay if all you did today was try.",
    "You don’t have to carry yesterday into today.",
    "Give yourself the same kindness you give others.",
    "You’re still here, and that’s something to be proud of.",
    "Resting is not quitting. It’s part of continuing.",
    "Let go of the pressure to have everything figured out.",
    "You can pause without giving up.",
    "Today doesn’t need to be perfect to be meaningful.",
    "You are allowed to feel and still move forward.",
    "Take it moment by moment, not all at once."
  ];

  useEffect(() => {
    if (currentView !== 'menu') return;
    const nextQuote = QUOTES[Math.floor(Math.random() * QUOTES.length)];
    setMenuQuote(nextQuote);
  }, [currentView]);

  useEffect(() => {
    const levelData = LEVELS[levelIndex]
    const theme = THEMES.find(t => t.id === levelData.theme) || THEMES[0]
    setCurrentTheme(theme)
    setLetters(levelData.letters)

    const newWords = generateLevel(levelData.letters)
    const newPuzzle = generateGrid(newWords)

    setWords(newWords)
    setPuzzle(newPuzzle)
    setSolvedWords([])

  }, [levelIndex])


  function useHint() {

    for (const word of words) {

      if (!solvedWords.includes(word)) {

        setSolvedWords(prev => {
          const updated = [...prev, word];
          if (updated.length === words.length) {
            nextLevel();
          }
          return updated;
        });

        sounds.hint.play()

        return
      }

    }

  }

  function nextLevel() {

    if (levelIndex < maxUnlocked) {
      setLevelIndex(maxUnlocked)
      setLetters(LEVELS[maxUnlocked].letters)
      return
    }

    const next = levelIndex + 1

    if (next >= LEVELS.length) {

      setGameCompleted(true)
      return

    }

    setShowLevelComplete(true)

    setTimeout(() => {

      setLevelIndex(next)
      setMaxUnlocked(next)
      setLetters(LEVELS[next].letters)
      setShowLevelComplete(false)

    }, 1500)

  }


  function handleWordSubmit(word: string) {

    word = word.toUpperCase()

    if (words.includes(word) && !solvedWords.includes(word)) {
      sounds.correct.play()
      const updated = [...solvedWords, word]

      setSolvedWords(updated)

      if (updated.length === words.length) {
        nextLevel()
      }

      return true
    }
    sounds.wrong.play()
    return false
  }

  const renderCurrentView = () => {
    if (currentView === 'menu') {
      return (
        <div className="menu">
          <h1>🎮 Firos Creations</h1>
          <div className="menu-quote">
            <p>{menuQuote}</p>
            <span>~ F</span>
          </div>
          <div className="menu-options">
            <button type="button" className="menu-btn crossword-btn" onClick={() => setCurrentView('crossword')}>
              🧩 Crossword Puzzle
            </button>
            <button type="button" className="menu-btn number-btn" onClick={() => setCurrentView('numberGuess')}>
              🔢 Number Guess Game
            </button>
            <button type="button" className="menu-btn memory-btn" onClick={() => setCurrentView('memoryMatch')}>
              🧠 Memory Match Challenge
            </button>
            <button type="button" className="menu-btn scribbl-btn" onClick={() => setCurrentView('scribbl')}>
              🎨 FiruDraw Guess Game
            </button>
          </div>
        </div>
      );
    }

    if (currentView === 'numberGuess') {
      return <NumberGuessGame onBack={() => setCurrentView('menu')} />;
    }

    if (currentView === 'memoryMatch') {
      return <MemoryMatchGame onBack={() => setCurrentView('menu')} />;
    }

    if (currentView === 'scribbl') {
      return <ScribblGame onBack={() => setCurrentView('menu')} />;
    }

    if (currentView === 'crossword') {
      if (!puzzle) return null;

      return (
        <div className={`game ${currentTheme.animationClass || ''}`} style={{
          '--theme-bg': currentTheme.background,
          '--theme-primary': currentTheme.primaryColor,
          '--theme-secondary': currentTheme.secondaryColor,
          '--theme-accent': currentTheme.accentColor,
        } as React.CSSProperties}>

          <button className="back-to-menu-btn" onClick={() => setCurrentView('menu')}>
            ← Back to Menu
          </button>

          <h2>
            Level {levelIndex + 1} / {LEVELS.length}
          </h2>

          {showLevelComplete && (
            <div className="level-popup">
              <div className="popup-content">
                <div className="trophy">🏆</div>
                <h2>Level Complete!</h2>
                <p>Get ready for Level {levelIndex + 2}</p>
              </div>
            </div>
          )}

          {gameCompleted && (
            <div className="level-popup">
              <div className="popup-content">
                <div className="trophy">👑</div>
                <h2>You Finished The Game!</h2>
                <p>Congratulations Puzzle Master 🧠</p>
              </div>
            </div>
          )}

          <button
            className="map-btn"
            onClick={() => setShowMap(true)}
          >
            🗺 Levels
          </button>

          {showMap && (
            <div className="map-popup" onClick={() => setShowMap(false)}>
              <LevelMap
                total={LEVELS.length}
                current={levelIndex}
                maxUnlocked={maxUnlocked}
                currentTheme={currentTheme}
                onThemeChange={setCurrentTheme}
                onSelect={(l) => {
                  setLevelIndex(l)
                  setLetters(LEVELS[l].letters)
                  setShowMap(false)
                }}
                onClose={() => setShowMap(false)}
              />
            </div>
          )}

          <Board
            key={levelIndex}
            grid={puzzle.grid}
            placements={puzzle.placements}
            solvedWords={solvedWords}
          />

          <HintButton onHint={useHint} />
          <LetterCircle
            letters={letters}
            onWordSubmit={handleWordSubmit}
          />
        </div>
      );
    }

    return null;
  };

  return renderCurrentView();
}

export default App