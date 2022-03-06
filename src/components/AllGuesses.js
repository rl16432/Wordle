import React from "react"

const AllGuesses = ({ words, results, className }) => {
  return (
    <div className = {className}>
      {words.map((word, idx) => <WordGuess key = {idx} letters = {word} results = {results[idx]} />)}
    </div>
  )
}
const WordGuess = ({ letters, results }) => {
  return (
    <div className="d-flex flex-row bd-highlight mb-0 justify-content-center align-items-center">
      {letters.map((letter, idx) => <Letter key={idx} letter = {letter} result = {results[idx]} />)}
    </div>
  )
}
const Letter = ({ letter, result }) => {
  let bgClass
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
    <div className={`d-flex align-items-center justify-content-center m-2 rounded border border-primary ${bgClass}`} style = {{width: '4rem', height: '4rem'}}>
      <h2 className='text-white text-center mb-0'>
        {letter}
      </h2>
    </div>
  )
}

export default AllGuesses