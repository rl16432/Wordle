import React, { useState, useEffect, useRef } from 'react'
import wordCorpus from './words'
import { Keyboard, AllGuesses, Controls } from './components/index'
import { Alert, Badge, Button, Col, Container, Form, Row } from 'react-bootstrap'
import 'bootstrap/dist/css/bootstrap.min.css'

const App = () => {

  const resultKeys = {
    SUCCESS: 3,
    WRONGPOS: 2,
    WRONG: 1,
    NONE: 0
  }
  const alertTime = 2000
  const [numGuesses, setNumGuesses] = useState(7)
  const [wordLength, setWordLength] = useState(5)
  const [words, setWords] = useState(Array.apply(null, Array(numGuesses)).map(val => ' '.repeat(wordLength).split('')))
  // Results for the letters in typed
  const [results, setResults] = useState(Array.apply(null, Array(numGuesses)).map(val => Array.apply(null, Array(wordLength)).map(val => resultKeys.NONE)))
  const [alertMessage, setAlertMessage] = useState(null)
  const [controlsToggle, setControlsToggle] = useState(true)
  const [startState, setStartState] = useState(false)
  const [numWins, setNumWins] = useState(0)
  const [numLosses, setNumLosses] = useState(0)

  const wordsRef = useRef({})
  wordsRef.current = words
  const resultsRef = useRef({})
  resultsRef.current = results
 
  // const currentGuess = useRef(0)
  const keyboardStates = useRef(['QWERTYUIOP', 'ASDFGHJKL', 'ZXCVBNM'].map(row => row.split('')).map(row => row.map(key => ({display: key, state: resultKeys.NONE}))))

  let correctWord
  let currentGuess
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
    return newResult === resultKeys.SUCCESS ? resultKeys.SUCCESS 
         : newResult === resultKeys.WRONGPOS && currentResult !== resultKeys.SUCCESS ? resultKeys.WRONGPOS
         : newResult === resultKeys.WRONG && currentResult !== resultKeys.SUCCESS && currentResult !== resultKeys.WRONGPOS ? 1
         : currentResult
  }

  const onWin = () => {
    window.removeEventListener('keydown', onKeyDown)
    setNumWins(numWins + 1)
    setStartState(false)
    setControlsToggle(true)
    
  }

  const onLoss = () => {
    window.removeEventListener('keydown', onKeyDown)
    setNumLosses(numLosses + 1)
    setStartState(false)
    setControlsToggle(true)

  }
  const resetBoard = (numGuesses, wordLength) => {
    setWords(Array.apply(null, Array(numGuesses)).map(val => ' '.repeat(wordLength).split('')))
    setResults(Array.apply(null, Array(numGuesses)).map(val => Array.apply(null, Array(wordLength)).map(val => resultKeys.NONE)))

  }
  const submitGuess = (word) => {
    console.log('correct', correctWord)
    const lowerCaseWord = word.toLowerCase()
    if (availableWords.includes(lowerCaseWord)) {
      
      let newResult = []
      const correctWordSplit = correctWord.split('')
      lowerCaseWord.split('').forEach((letter, index) => {
        let currentResult
        if (correctWordSplit.includes(letter)) {
          if (getAllIndices(correctWordSplit, letter).includes(index)) {
            currentResult = resultKeys.SUCCESS
          } 
          else if (getAllIndices(correctWordSplit, letter).length >= getAllIndices(lowerCaseWord.split(''), letter).length) {
            currentResult = resultKeys.WRONGPOS
          }
          // else if (getAllIndices(correctWordSplit, letter).length >= 0 && getAllIndices(lowerCaseWord.split(''), letter).length >= 0 && )
          else {
            currentResult = resultKeys.WRONG
          }
        }
        else {
          currentResult = resultKeys.WRONG
        }
        newResult.push(currentResult)
        keyboardStates.current = keyboardStates.current.map(row => (
          row.map(key => (
            key.display === letter.toUpperCase() ? {display: key.display, state: updateKeyboard(key.state, currentResult)} : key
          ))
        ))
      })
      return newResult
    }
    else {
      return null
    } 
  }

  const onEnterPress = (words, row) => {
    const outcome = submitGuess(words[row - 1].join(''))
    console.log(currentGuess)
    if (outcome !== null) {
      const tempResults = resultsRef.current.map((result, index) => index === row - 1 ? outcome : result)
      // Update state for results
      setResults(tempResults.map(result => [...result]))
      // New word is reached
      endOfWord = false
      currentGuess++
      // Create new 2D array for results
      if (outcome.every(val => val === resultKeys.SUCCESS)) {
        onWin()
      }
      else if (currentGuess === numGuesses) {
        onLoss()
      }
    }
    else {
      displayAlert(`Word '${words[row - 1].join('')}' does not exist.`, alertTime)
    }
  }

  const onLetterPress = (words, key, row, col, wordLength) => {
    if (col === wordLength - 1) {
      endOfWord = true
    } 
    currentPosition++  
    const tempWords = [...words]
    tempWords[row][col] = key.toUpperCase()
    setWords(tempWords)
  }

  const onBackspacePress = (words, col) => {
    
    if (col === 0) {
      endOfWord = false
    }
    currentPosition--
    const tempWords = [...words]
    tempWords[Math.floor(currentPosition / wordLength)][currentPosition % wordLength] = ' '
    setWords(tempWords)
  }

  const onKeyDown = (event) => {

    console.log(wordsRef.current)

    const key = event.key
    const row = Math.floor(currentPosition / wordLength)
    const col = currentPosition % wordLength
    
    // If reached the beginning of next row
    if (key === 'Enter' && endOfWord === true) {
      onEnterPress(wordsRef.current, row)
    }
    else if (/^[a-z]$/i.test(key) === true && (endOfWord === false || endOfWord === undefined)) {
      onLetterPress(wordsRef.current, key, row, col, wordLength)
    }
    else if (key === 'Backspace' && currentPosition > currentGuess * wordLength) {
      onBackspacePress(wordsRef.current, col)
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
    resetBoard(numGuesses, newWordLength)
  }
  const handleLengthDecrease = (event) => {
    const newWordLength = wordLength - 1
    setWordLength(newWordLength)
    resetBoard(numGuesses, newWordLength)
  }
  
  const clickStart = (event) => {
    if (startState === false) {
      resetBoard(numGuesses, wordLength)

      availableWords = wordCorpus.filter(word => word.length === wordLength)
      correctWord = availableWords[Math.floor(Math.random() * availableWords.length)]
      currentPosition = 0
      currentGuess = 0
      
      keyboardStates.current = ['QWERTYUIOP', 'ASDFGHJKL', 'ZXCVBNM'].map(row => row.split('')).map(row => row.map(key => ({display: key, state: resultKeys.NONE})))
      
      window.addEventListener('keydown', onKeyDown)

      setStartState(true)
      event.target.blur() // Remove focus on button after disabling
      setControlsToggle(false)
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
            <Button size='lg' variant='primary' disabled = {startState === true ? true : false} onClick={clickStart}>Start</Button>{' '}
            <Button size='lg' variant='danger'>Retry</Button>
          </div>
        </Col>
        <Col xs = {12} md = {{span: 6, offset: 3}}>
          {alertMessage !== null ? <Alert variant = 'danger'>{alertMessage}</Alert> : null}
          <AllGuesses words = {words} results = {results} className = 'mb-3'/>
          <Keyboard keyboardStates={keyboardStates.current}/>
        </Col>
        <Col 
          className = "d-md-flex d-none flex-column justify-content-center align-items-center fixed-top text-white"
          style={{height: '100vh'}} 
          md = {{span: 3, offset: 9}}
        >
          <h4>Wins: <Badge>{numWins}</Badge></h4>
          <h4>Losses: <Badge>{numLosses}</Badge></h4>
        </Col>
      </Row>
      <Row>
        
      </Row>
      </div>
    </Container>
  )
}

export default App