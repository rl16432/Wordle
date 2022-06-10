import React from "react"
import "./Components.scss"

const AllGuesses = ({ wordLength, words, results, className }) => {
  
  return (
    <div className={className}>
      {words.map((word, idx) => <WordGuess key={idx} letters={word} results={results[idx]} />)}
    </div>
  )
}

const WordGuess = ({ letters, results }) => {
  return (
    <div className="d-flex flex-row flex-nowrap bd-highlight mb-0 justify-content-center align-items-center">
      {letters.map((letter, idx) => <Letter key={idx} letter={letter} result={results[idx]} />)}
    </div>
  )
}

const Letter = ({ letter, result }) => {
  let bgClass
  const bootstrapStyle = {
    letterBox: "d-flex align-items-center me-2 mb-2 justify-content-center rounded border border-primary",
    letter: 'text-white text-center mb-0'
  }

  if (result === 3) {
    bgClass = 'bg-success'
  }
  else if (result === 2) {
    bgClass = 'bg-warning'
  }
  else if (result === 1) {
    bgClass = 'bg-dark'
  }
  else if (result === 0) {
    bgClass = 'bg-dark'
  }
  return (
    <div className={`${bootstrapStyle.letterBox} ${bgClass} letterBox`}>
      <h2 className={`${bootstrapStyle.letter} letter`}>
        {letter}
      </h2>
    </div>
  )
}

export default AllGuesses