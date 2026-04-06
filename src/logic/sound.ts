import { Howl } from "howler"

export const sounds = {

  correct: new Howl({
    src: ["/sounds/correct.mp3"],
    volume: 0.5
  }),

  wrong: new Howl({
    src: ["/sounds/wrong.mp3"],
    volume: 0.5
  }),

  level: new Howl({
    src: ["/sounds/level.mp3"],
    volume: 0.6
  }),

  hint: new Howl({
    src: ["/sounds/hint.mp3"],
    volume: 0.6
  })

}