import React, { useState, useEffect, useRef } from 'react'
import wordCorpus from './words'
import { Keyboard } from './components/index'
import { Alert, Badge, Button, ButtonGroup, Col, Container, Form, Row } from 'react-bootstrap'
import 'bootstrap/dist/css/bootstrap.min.css'

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
  return (
    <div className={`d-flex align-items-center justify-content-center m-2 rounded border border-primary ${bgClass}`} style = {{width: '4rem', height: '4rem'}}>
      <h2 className='text-white text-center mb-0'>
        {letter}
      </h2>
    </div>
  )
}

const Controls = ({ text, value, enabled, onClickUp, onClickDown }) => {
  return (
    <div className='d-block text-center py-2' >
      <h4 className='text-white d-inline-block mx-3'>
        {text} <Badge>{value}</Badge>
      </h4>
      <ButtonGroup vertical>
        <Button variant = 'outline-primary' onClick={onClickUp} disabled={enabled === true ? false : true}>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-arrow-up" viewBox="0 0 16 16">
            <path fillRule="evenodd" d="M8 15a.5.5 0 0 0 .5-.5V2.707l3.146 3.147a.5.5 0 0 0 .708-.708l-4-4a.5.5 0 0 0-.708 0l-4 4a.5.5 0 1 0 .708.708L7.5 2.707V14.5a.5.5 0 0 0 .5.5z"/>
          </svg>
        </Button>
        <Button variant = 'outline-primary' onClick={onClickDown} disabled={enabled === true ? false : true}>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-arrow-down" viewBox="0 0 16 16">
            <path fillRule="evenodd" d="M8 1a.5.5 0 0 1 .5.5v11.793l3.146-3.147a.5.5 0 0 1 .708.708l-4 4a.5.5 0 0 1-.708 0l-4-4a.5.5 0 0 1 .708-.708L7.5 13.293V1.5A.5.5 0 0 1 8 1z"/>
          </svg>
        </Button>
      </ButtonGroup>
    </div>
  )
}
const App = () => {
  const alertTime = 2000
  const [numGuesses, setNumGuesses] = useState(7)
  const [wordLength, setWordLength] = useState(5)
  const [words, setWords] = useState(Array.apply(null, Array(numGuesses)).map(val => ' '.repeat(wordLength).split('')))  
  const [results, setResults] = useState(Array.apply(null, Array(numGuesses)).map(val => Array.apply(null, Array(wordLength)).map(val => 1)))
  const [alertMessage, setAlertMessage] = useState(null)
  const [controlsToggle, setControlsToggle] = useState(true)

  const resultsRef = useRef({})
  resultsRef.current = results
  const startState = useRef(false)
  const currentGuess = useRef(0)
  const keyboardStates = useRef(['QWERTYUIOP', 'ASDFGHJKL', 'ZXCVBNM'].map(row => row.split('')).map(row => row.map(key => ({display: key, state: 1}))))

  let correctWord 
  let currentPosition // Number representing current position in array
  let availableWords // List of available words for selected length
  let endOfWord // Whether end of word has been reached

  const displayAlert = (alertMessage, timeout) => {
    setAlertMessage(alertMessage)
    setTimeout(() => {
      setAlertMessage(null)
    }, timeout)
  }

  const getAllIndices = (arr, val) => {
    let indices = [], i
    for (i = 0; i < arr.length; i++) 
      if (arr[i] === val)
        indices.push(i)
    return indices
  }
  const updateKeyboard = (currentResult, newResult) => {
    return newResult === 3 ? 3 
         : newResult === 2 && currentResult !== 3 ? 2
         : currentResult
  }
  const submitGuess = (word) => {
    console.log('bg', word)
    console.log('correct', correctWord)
    const lowerCaseWord = word.toLowerCase()
    if (availableWords.includes(lowerCaseWord)) {
      
      let result = []
      const correctWordSplit = correctWord.split('')
      lowerCaseWord.split('').forEach((letter, index) => {
        let currentResult
        if (correctWordSplit.includes(letter)) {
          if (getAllIndices(correctWordSplit, letter).includes(index)) {
            currentResult = 3
          } 
          else if (getAllIndices(correctWordSplit, letter).length >= getAllIndices(lowerCaseWord.split(''), letter).length) {
            currentResult = 2
          }
          // else if (getAllIndices(correctWordSplit, letter).length >= 0 && getAllIndices(lowerCaseWord.split(''), letter).length >= 0 && )
          else {
            currentResult = 1
          }
        }
        else {
          currentResult = 1
        }
        result.push(currentResult)
        keyboardStates.current = keyboardStates.current.map(row => (
          row.map(key => (
            key.display === letter.toUpperCase() ? {display: key.display, state: updateKeyboard(key.state, currentResult)} : key
          ))
        ))
      })
      return result
    }
    else {
      return null
    } 
  }

  const onEnterPress = (words, row) => {
    const outcome = submitGuess(words[row - 1].join(''))

    if (outcome !== null) {
      // Create new 2D array for results

      const tempResults = resultsRef.current.map((result, index) => index === row - 1 ? outcome : result)
      // Update state for results
      setResults(tempResults.map(result => [...result]))
      // New word is reached
      endOfWord = false
      currentGuess.current++
    }
    else {
      displayAlert(`Word '${words[row - 1].join('')}' does not exist.`, alertTime)
    }
  }

  const onLetterPress = (key, row, col, wordLength) => {
    if (col === wordLength - 1) {
      endOfWord = true
    } 
    currentPosition++  
    const tempWords = [...words]
    tempWords[row][col] = key.toUpperCase()
    setWords(tempWords)
  }

  const onBackspacePress = (words, col) => {
    console.log(words)
    if (col === 0) {
      endOfWord = false
    }
    currentPosition--
    const tempWords = [...words]
    tempWords[Math.floor(currentPosition / wordLength)][currentPosition % wordLength] = ' '
    setWords(tempWords)
  }

  const onKeyDown = (event) => {

    const key = event.key
    const row = Math.floor(currentPosition / wordLength)
    const col = currentPosition % wordLength
    
    // If reached the beginning of next row
    if (key === 'Enter' && endOfWord === true) {
      onEnterPress(words, row)
    }
    else if (/^[a-z]$/i.test(key) === true && (endOfWord === false || endOfWord === undefined)) {
      onLetterPress(key, row, col, wordLength)
    }
    else if (key === 'Backspace' && currentPosition > currentGuess.current * wordLength) {
      onBackspacePress(words, col)
    }
  }

  const handleGuessIncrease = (event) => {
    setNumGuesses(numGuesses + 1)
  }
  const handleGuessDecrease = (event) => {
    setNumGuesses(numGuesses - 1)
  }

  const handleLengthIncrease = (event) => {
    const newWordLength = wordLength + 1
    setWordLength(newWordLength)
    setWords(Array.apply(null, Array(numGuesses)).map(val => ' '.repeat(newWordLength).split('')))
    setResults(Array.apply(null, Array(numGuesses)).map(val => Array.apply(null, Array(newWordLength).map(val => 1))))
  }
  const handleLengthDecrease = (event) => {
    const newWordLength = wordLength - 1
    setWordLength(newWordLength)
    setWords(Array.apply(null, Array(numGuesses)).map(val => ' '.repeat(newWordLength).split('')))
    setResults(Array.apply(null, Array(numGuesses)).map(val => Array.apply(null, Array(newWordLength).map(val => 1))))
  }
  
  const clickStart = (event) => {
    if (startState.current === false) {
      availableWords = wordCorpus.filter(word => word.length === wordLength)
      startState.current = true
      correctWord = availableWords[Math.floor(Math.random() * availableWords.length)]
      currentPosition = 0
      setControlsToggle(false)
      window.addEventListener('keydown', onKeyDown)
    }
  }

  return (
    <Container fluid className='bg-dark overflow-auto'>
      <div style={{height: '100vh'}}>
      <Row className= "h-100 align-items-center">
      {/* style={{height: '100vh', position:'fixed', top: '50%', bottom:'50%'}} */}
        
        <Col className = "d-md-flex d-none flex-column justify-content-center align-items-center fixed-top" style={{height: '100vh'}} md = {3}>
          <Controls 
            text = 'Number of guesses' 
            value = {numGuesses}
            enabled = {controlsToggle}
            onClickUp = {handleGuessIncrease} 
            onClickDown = {handleGuessDecrease}
          />
          <Controls 
            text = 'Word length' 
            value = {wordLength} 
            enabled = {controlsToggle}
            onClickUp = {handleLengthIncrease} 
            onClickDown = {handleLengthDecrease}
          />
          <div className='d-inline-block'>
          <Button size='lg' variant='primary' onClick={clickStart}>Start</Button>{' '}
          <Button size='lg' variant='danger'>Retry</Button>
          </div>
        </Col>
        <Col xs = {12} md = {{span: 6, offset: 3}}>
          {alertMessage !== null ? <Alert variant = 'danger'>{alertMessage}</Alert> : null}
          <AllGuesses words = {words} results = {results} className = 'mb-3'/>
          <Keyboard keyboardStates={keyboardStates.current}/>
        </Col>
        <Col md = {3}></Col>
      </Row>
      <Row>
        
      </Row>
      </div>
    </Container>
  )
}

export default App