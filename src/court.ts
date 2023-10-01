#!/usr/bin/env tsx
import { suite, add, cycle, complete, save } from "benny"
import { assertEqual } from "./_utils"

// Question:
//
// You are at the court for a traffic ticket and there are 4 other people with you.
// You are told that everyone’s hearing is in alphabetical order and it takes 30 minutes
// for each hearing. All of the judges are free now and can see one person at a time.
// How long will it take for your hearing to end?
//
// Write the fastest JavaScript routine (include a simple benchmark) you can. Submit
// when you can not get it any faster and explain your optimization journey.

// The simplest way to solve this problem is to use native JavaScript sorting.
// 782 022 ops/s, ±0.44%
function court1(name: string, judgeCount: number, candidates: string) {
  const people = candidates.split(" ").concat(name).sort()
  const before = people.indexOf(name)
  const rounds = before / judgeCount
  // If it’s an integer, you need another round to finish the hearing, otherwise you
  // can join the last round since there is at least one judge free.
  return (Number.isInteger(rounds) ? rounds + 1 : Math.ceil(rounds)) * 30
}

// Since we only need to find out how many people are in front, we can skip the rest
// of the job of Array#sort. We don’t care how many people are behind us, or what the order
// of people before us is.
// 2 935 110 ops/s, ±0.23%
function court2(name: string, judgeCount: number, candidates: string) {
  const people = candidates.split(" ")

  // Just count it manually.
  let before = 0
  for (const person of people) {
    if (person < name) {
      before++
    }
  }

  const rounds = before / judgeCount
  return (Number.isInteger(rounds) ? rounds + 1 : Math.ceil(rounds)) * 30
}

// Let’s merge the round calculation logic into the loop.
// 3 211 418 ops/s, ±0.26%
function court3(name: string, judgeCount: number, candidates: string) {
  const people = candidates.split(" ")

  let before = 0
  let rounds = 0

  for (const person of people) {
    if (person < name) {
      before++
      if (before === judgeCount) {
        rounds++
        before = 0
      }
    }
  }

  return (rounds + 1) * 30
}

// Optimization techniques that didn’t work:
//
// 1. We are not optimizing the `<` operator, since native string comparison is already
//    fast enough (also I tried to use `charCodeAt` but it’s slower).
// 2. Eliminating TDZ by replacing `let`/`const` with `var` doesn’t help.
// 3. Reimplementing String#split.

// Bonus around: use a native for loop instead of `for...of`.
// 3 302 138 ops/s, ±0.20%
function court4(name: string, judgeCount: number, candidates: string) {
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

// Running the script with v8-deopt-viewer shows no deoptimization.
// `court4` is the fastest implementation.

function test(fn: typeof court1) {
  // Alphabetical order: ABCDE FGHIJ KLMNO PQRST UVWXY Z
  assertEqual(fn("Jules", 3, "Adam Betty Frank Mike"), 60)
  assertEqual(fn("Zane", 1, "Mark Hank Ana Vivian"), 150)
  assertEqual(fn("Benny", 4, "Adam Betty Frank Mike"), 30)
  assertEqual(fn("Johnathan", 4, "Derek Adam Betty Frank Mike"), 60)
  // assertEqual(fn("Johnathan", 1, "Derek Adam Betty Frank Mike"), 150)
}

suite(
  "court",
  add("algo 1", () => test(court1)),
  add("algo 2", () => test(court2)),
  add("algo 3", () => test(court3)),
  add("algo 4", () => test(court4)),
  cycle(),
  complete(),
  save({ file: "court", format: "chart.html" })
)
