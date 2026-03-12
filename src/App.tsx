import { useState } from "react";
import "./App.css";

import Board from "./components/Board";
import LetterCircle from "./components/LetterCircle";

import { generateGrid } from "./logic/generateGrid";
import { generateLevel } from "./logic/generateLevel";

function App() {

  const letters = ["W","E","H","N","I"];

  const [words] = useState(() => generateLevel(letters));
  const [puzzle] = useState(() => generateGrid(words));

  const [solvedWords, setSolvedWords] = useState<string[]>([]);

    function handleWordSubmit(word:string){

      if(words.includes(word) && !solvedWords.includes(word)){
        setSolvedWords(prev=>[...prev,word])
        return true
      }

      return false
    }

  return (

    <div className="game">

      <Board
        grid={puzzle.grid}
        placements={puzzle.placements}
        solvedWords={solvedWords}
      />

      <LetterCircle
        letters={letters}
        onWordSubmit={handleWordSubmit}
      />

    </div>

  );

}

export default App;