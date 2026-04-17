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
import MemoryMatchGame from "./components/MemoryMatchGame";
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
            <p>Whenever life feels overwhelming, stressed, come here, play a little, and unwind. This space was made for you , with Love.</p>
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