function court(name, judgeCount, candidates) {
  const people = candidates.split(" ")
  const peopleCount = people.length

  let before = 0
  let rounds = 1

  for (let i = 0; i < peopleCount; i++) {
    if (people[i] < name) {
      before++
      if (before === judgeCount) {
        rounds++
        before = 0
      }
    }
  }

  return rounds * 30
}
