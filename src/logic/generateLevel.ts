import { DICTIONARY } from "../data/dictionary"

export function generateLevel(letters: string[]) {

  const results: string[] = []

  for (const word of DICTIONARY) {

    if (canBuild(word, letters)) {
      results.push(word)
    }

  }

  if(results.length === 0){
    console.warn("No words found for letters:", letters)
    return []
  }

  results.sort((a,b)=>a.length-b.length)

  return results.slice(0,6)

}

function canBuild(word: string, letters: string[]) {

  for (const l of word) {

    if (!letters.includes(l)) {
      return false
    }

  }

  return true
}