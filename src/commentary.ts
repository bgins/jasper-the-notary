type Commentary = string[]

export const getComment = (): string => {
  let comment: string | undefined

  // Weighted towards encouragement
  const categoryIndex = weightedBetween(0, 2)

  switch (categoryIndex) {
    case 0:
      comment = encouragement[between(0, encouragement.length - 1)]
      break

    case 1:
      comment = utterNonesense[between(0, utterNonesense.length - 1)]
      break

    case 2:
      comment = critiques[between(0, critiques.length - 1)]
      break

    default:
      break
  }

  return comment ?? '😵‍💫 Jasper confused, but it\'s all good.'
}

const between = (min: number, max: number): number => {
  return Math.floor(
    Math.random() * (max - min + 1) + min
  )
}

const weightedBetween = (min: number, max: number): number => {
  const weighted = Math.pow(Math.random(), 2)

  return Math.floor(weighted * (max - min + 1)) + min
} 

const utterNonesense: Commentary = [
  '🍊 Could you bring an orange next time? I love oranges so much!',
  '📜 Did you know I might live until 20? This bird is gonna be stamping out UCANs for while.',
  '🐦 Kyeeuh-kyeeah-kuh! Kyeeuh-kyeeah-kuh!',
  '💥 Holy hand grenade!',
]

const critiques: Commentary = [
  '🤭 Hmmm... that doesn\'t seem right, but it\'s worth a try I suppose.',
  '🤔 Ole Blinky told you what? I wouldn\'t trust that guy',
  '⁉️ Alright yeah, but isn\'t \\attenuation going to be one of the answers?',
]

const encouragement: Commentary = [
  '✨ You\'re doing great!',
  '🔥 Wow, never seen anyone speed run like this before!',
  '👏 Fantastic work on that last out!',
  '💯 Oh this next one is so good.',
  '💃 Ole Blinky can\'t stump you!',
  '💪 Don\'t sweat it, you got this one.',
]