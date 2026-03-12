export type Placement = {
  word:string
  row:number
  col:number
  direction:"horizontal"|"vertical"
}

export function generateGrid(words:string[]){

  const size = 10

  const grid:string[][] = Array.from(
    {length:size},
    ()=>Array(size).fill("")
  )

  const placements:Placement[] = []

  if(words.length===0){
    return {grid,placements}
  }

  const first = words[0]

  const row = Math.floor(size/2)
  const col = Math.floor(size/2)-Math.floor(first.length/2)

  for(let i=0;i<first.length;i++){
    grid[row][col+i]=first[i]
  }

  placements.push({
    word:first,
    row,
    col,
    direction:"horizontal"
  })

  let currentRow=row+1

  for(let w=1;w<words.length;w++){

    const word = words[w]

    const startCol = Math.floor(size/2)-Math.floor(word.length/2)

    for(let i=0;i<word.length;i++){
      grid[currentRow][startCol+i]=word[i]
    }

    placements.push({
      word,
      row:currentRow,
      col:startCol,
      direction:"horizontal"
    })

    currentRow++

    if(currentRow>=size) break

  }

  return {grid,placements}

}