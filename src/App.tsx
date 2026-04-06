import { useState, useEffect } from "react";
import "./App.css";

import Board from "./components/Board";
import LetterCircle from "./components/LetterCircle";

import { generateGrid } from "./logic/generateGrid";
import { generateLevel } from "./logic/generateLevel";

import { LEVELS } from "./data/levels";
import HintButton from "./components/HintButton"
import LevelMap from "./components/LevelMap"
import { sounds } from "./logic/sound";

function App() {

  const [levelIndex, setLevelIndex] = useState(0)
  const [maxUnlocked, setMaxUnlocked] = useState(0)
  const [letters, setLetters] = useState(LEVELS[0])

  const [words, setWords] = useState<string[]>([])
  const [puzzle, setPuzzle] = useState<any>(null)

  const [solvedWords, setSolvedWords] = useState<string[]>([])

  const [showLevelComplete, setShowLevelComplete] = useState(false)
  const [gameCompleted, setGameCompleted] = useState(false)
  const [showMap, setShowMap] = useState(false)


  useEffect(() => {

    const newWords = generateLevel(letters)
    const newPuzzle = generateGrid(newWords)

    setWords(newWords)
    setPuzzle(newPuzzle)
    setSolvedWords([])

  }, [letters])


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
      setLetters(LEVELS[maxUnlocked])
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
      setLetters(LEVELS[next])
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

  if (!puzzle) return null


  return (

    <div className="game">

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
            onSelect={(l) => {
              setLevelIndex(l)
              setLetters(LEVELS[l])
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

  )

}

export default App