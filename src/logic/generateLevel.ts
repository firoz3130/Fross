export function generateLevel(letters:string[]){

  const dictionary=[
    "HEN",
    "NEW",
    "HEW",
    "WHEN",
    "WIN",
    "HINE"
  ]

  const valid = dictionary.filter(word=>{
    return word.split("").every(l=>letters.includes(l))
  })

  return Array.from(new Set(valid))

}