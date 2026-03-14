export type Placement = {
  word: string
  row: number
  col: number
  direction: "horizontal" | "vertical"
}

export function generateGrid(words: string[]) {

  const size = 10

  const grid: string[][] = Array.from(
    { length: size },
    () => Array(size).fill("")
  )

  const placements: Placement[] = []

  if (words.length === 0) {
    return { grid, placements }
  }

  // sort longest first
  words = [...words].sort((a, b) => b.length - a.length)

  const first = words[0]

  const row = Math.floor(size / 2)
  const col = Math.floor(size / 2) - Math.floor(first.length / 2)

  // place first word horizontally
  for (let i = 0; i < first.length; i++) {
    grid[row][col + i] = first[i]
  }

  placements.push({
    word: first,
    row,
    col,
    direction: "horizontal"
  })

  // place remaining words
  for (let w = 1; w < words.length; w++) {

    const word = words[w]
    let placed = false

    for (const p of placements) {

      for (let i = 0; i < p.word.length; i++) {

        for (let j = 0; j < word.length; j++) {

          if (p.word[i] === word[j]) {

            const crossRow =
              p.direction === "horizontal"
                ? p.row
                : p.row + i

            const crossCol =
              p.direction === "horizontal"
                ? p.col + i
                : p.col

            const newRow =
              p.direction === "horizontal"
                ? crossRow - j
                : crossRow

            const newCol =
              p.direction === "horizontal"
                ? crossCol
                : crossCol - j

            const direction =
              p.direction === "horizontal"
                ? "vertical"
                : "horizontal"

            if (canPlace(grid, word, newRow, newCol, direction)) {

              placeWord(grid, word, newRow, newCol, direction)

              placements.push({
                word,
                row: newRow,
                col: newCol,
                direction
              })

              placed = true
              break

            }

          }

        }

        if (placed) break
      }

      if (placed) break
    }

  }

  return { grid, placements }

}

function canPlace(
  grid: string[][],
  word: string,
  row: number,
  col: number,
  direction: "horizontal" | "vertical"
) {

  const size = grid.length

  for (let i = 0; i < word.length; i++) {

    const r = direction === "horizontal" ? row : row + i
    const c = direction === "horizontal" ? col + i : col

    if (r < 0 || c < 0 || r >= size || c >= size) {
      return false
    }

    const cell = grid[r][c]

    if (cell !== "" && cell !== word[i]) {
      return false
    }

    // check side neighbors (avoid touching words)

    if (direction === "horizontal") {

      if (r > 0 && grid[r-1][c] !== "" && cell === "") return false
      if (r < size-1 && grid[r+1][c] !== "" && cell === "") return false

    } else {

      if (c > 0 && grid[r][c-1] !== "" && cell === "") return false
      if (c < size-1 && grid[r][c+1] !== "" && cell === "") return false

    }

  }

  // prevent extending another word

  if (direction === "horizontal") {

    if (col > 0 && grid[row][col-1] !== "") return false
    if (col + word.length < size && grid[row][col + word.length] !== "") return false

  } else {

    if (row > 0 && grid[row-1][col] !== "") return false
    if (row + word.length < size && grid[row + word.length][col] !== "") return false

  }

  return true
}

function placeWord(
  grid: string[][],
  word: string,
  row: number,
  col: number,
  direction: "horizontal" | "vertical"
) {

  for (let i = 0; i < word.length; i++) {

    const r = direction === "horizontal" ? row : row + i
    const c = direction === "horizontal" ? col + i : col

    grid[r][c] = word[i]

  }

}