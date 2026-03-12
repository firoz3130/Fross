import { useState, useRef } from "react"

type Props = {
  letters: string[]
  onWordSubmit: (word: string) => boolean
}

type Point = {
  x: number
  y: number
}

export default function LetterCircle({ letters, onWordSubmit }: Props) {

  const [selected, setSelected] = useState<number[]>([])
  const [mousePos, setMousePos] = useState<Point | null>(null)
  const [shake, setShake] = useState(false)
  const [particles, setParticles] = useState<Point[]>([])

  const containerRef = useRef<HTMLDivElement>(null)

  const radius = 120
  const center = { x: 150, y: 150 }

  function getLetterPosition(index:number){

    const angle = (2*Math.PI*index)/letters.length

    return{
      x:center.x + radius*Math.cos(angle),
      y:center.y + radius*Math.sin(angle)
    }

  }

  function handleStart(index:number){

    setSelected([index])

  }

  function handleEnter(index:number){

    if(selected.length===0) return
    if(selected.includes(index)) return

    setSelected(prev=>[...prev,index])

  }

  function updatePointer(clientX:number,clientY:number){

    const rect = containerRef.current?.getBoundingClientRect()

    if(!rect) return

    setMousePos({
      x:clientX-rect.left,
      y:clientY-rect.top
    })

  }

  function handleMouseMove(e:React.MouseEvent){

    updatePointer(e.clientX,e.clientY)

  }

  function handleTouchMove(e:React.TouchEvent){

    const touch = e.touches[0]
    updatePointer(touch.clientX,touch.clientY)

  }

  function triggerParticles(){

    const arr:Point[]=[]

    for(let i=0;i<15;i++){

      arr.push({
        x:center.x,
        y:center.y
      })

    }

    setParticles(arr)

    setTimeout(()=>setParticles([]),600)

  }

  function handleEnd(){

    if(selected.length===0) return

    const word = selected.map(i=>letters[i]).join("")

    const correct = onWordSubmit(word)

    if(!correct){

      setShake(true)
      setTimeout(()=>setShake(false),400)

    }else{

      triggerParticles()

    }

    setSelected([])
    setMousePos(null)

  }

  function createPath(){

    if(selected.length===0) return ""

    let path=""

    selected.forEach((index,i)=>{

      const p = getLetterPosition(index)

      if(i===0){

        path=`M ${p.x} ${p.y}`

      }else{

        const prev = getLetterPosition(selected[i-1])

        const midX=(prev.x+p.x)/2
        const midY=(prev.y+p.y)/2

        path+=` Q ${prev.x} ${prev.y} ${midX} ${midY}`

      }

    })

    if(mousePos){

      const last=getLetterPosition(selected[selected.length-1])

      path+=` Q ${last.x} ${last.y} ${mousePos.x} ${mousePos.y}`

    }

    return path

  }

  return(

    <div
      ref={containerRef}
      className={`circle-container ${shake?"shake":""}`}
      onMouseMove={handleMouseMove}
      onMouseUp={handleEnd}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleEnd}
    >

      <svg width="320" height="320" className="line-svg">

        <path
          d={createPath()}
          className="drag-line"
        />

      </svg>

      {letters.map((letter,i)=>{

        const pos = getLetterPosition(i)

        const active = selected.includes(i)

        return(

          <div
            key={i}
            className={`circle-letter ${active?"active":""}`}
            style={{
              left:pos.x,
              top:pos.y
            }}
            onMouseDown={()=>handleStart(i)}
            onMouseEnter={()=>handleEnter(i)}
            onTouchStart={()=>handleStart(i)}
          >
            {letter}
          </div>

        )

      })}

      {particles.map((p,i)=>(

        <span
          key={i}
          className="particle"
          style={{
            left:p.x,
            top:p.y
          }}
        />

      ))}

    </div>

  )

}