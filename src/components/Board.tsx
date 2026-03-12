type Placement = {
  word:string
  row:number
  col:number
  direction:"horizontal"|"vertical"
}

type Props = {
  grid:string[][]
  placements:Placement[]
  solvedWords:string[]
}

export default function Board({grid,placements,solvedWords}:Props){

  function revealCell(row:number,col:number){

    for(const p of placements){

      if(!solvedWords.includes(p.word)) continue

      for(let i=0;i<p.word.length;i++){

        const r = p.direction==="horizontal" ? p.row : p.row+i
        const c = p.direction==="horizontal" ? p.col+i : p.col

        if(r===row && c===col){
          return true
        }

      }

    }

    return false
  }

  return(

    <div className="board">

      {grid.map((row,r)=>(

        <div key={r} className="row">

          {row.map((cell,c)=>{

            if(cell===""){
              return <div key={c} className="cell empty"></div>
            }

            return(
              <div key={c} className="cell">
                {revealCell(r,c)?cell:""}
              </div>
            )

          })}

        </div>

      ))}

    </div>

  )

}