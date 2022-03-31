import React, { useState, useEffect, useRef } from 'react'
import wordCorpus from './words'
import { Keyboard, AllGuesses, Controls, EndWindow } from './components/index'
import { Alert, Badge, Button, Col, Container, Row } from 'react-bootstrap'
import 'bootstrap/dist/css/bootstrap.min.css'

const App = () => {

  const resultKeys = {
    SUCCESS: 3, // Green for correct letter and position
    WRONGPOS: 2, // Yellow for correct letter, wrong position
    WRONG: 1, // Black for incorrect letter
    NONE: 0 // No letter
  }

  // Time which alert is displayed on screen (ms)
  const alertTime = 2000 

  // Parameters for game controls (min/max word length and min/max number of guesses) 
  const minGuesses = 3
  const maxGuesses = Infinity
  const minLength = 3
  const maxLength = 10
  
  // Current number of guesses
  const [numGuesses, setNumGuesses] = useState(6)
  // Current word length
  const [wordLength, setWordLength] = useState(5)
  // Current words displayed on screen (2D array [wordLength, numGuesses])
  const [words, setWords] = useState(Array.apply(null, Array(numGuesses)).map(val => ' '.repeat(wordLength).split('')))
  // Results for the letters typed (2D array [wordLength, numGuesses])
  const [results, setResults] = useState(Array.apply(null, Array(numGuesses)).map(val => Array.apply(null, Array(wordLength)).map(val => resultKeys.NONE)))
  // Displayed alert message
  const [alertMessage, setAlertMessage] = useState(null)
  // Toggle ability to change numGuesses and wordLength
  const [controlsToggle, setControlsToggle] = useState(true)
  // Has game started or not
  const [startState, setStartState] = useState(false)
  // Win/Loss/In progress
  const [endState, setEndState] = useState(null)
  // Number of wins and losses
  const [numWins, setNumWins] = useState(0)
  const [numLosses, setNumLosses] = useState(0)

  // Ref wrapper used to access the 2D arrays in event listener
  const wordsRef = useRef({})
  wordsRef.current = words
  const resultsRef = useRef({})
  resultsRef.current = results
  
  // Array for colors on the keyboard
  const keyboardStates = useRef(
    ['QWERTYUIOP', 'ASDFGHJKL', 'ZXCVBNM']
      .map(row => row.split(''))
      .map(row => row.map(key => ({
        display: key,
        state: resultKeys.NONE
      })))
    )

  // Current correct word
  const correctWord = useRef()
  // Number to track the current guess the user is on
  let currentGuess
  // Number representing current position in 2D array
  let currentPosition
  // List of available words for selected length 
  let availableWords
  // Whether end of word has been reached when user types
  let endOfWord

  // Display alert message 
  const displayAlert = (alertMessage, timeout) => {
    setAlertMessage(alertMessage)
    setTimeout(() => {
      setAlertMessage(null)
    }, timeout)
  }

  // Function to get all indices of an element in array (needed for determining
  // whether wrong position, correct position or non-existent) 
  const getAllIndices = (arr, val) => {
    let indices = [], i
    for (i = 0; i < arr.length; i++) 
      if (arr[i] === val)
        indices.push(i)
    return indices
  }

  // Update the colors on the keyboard as new words are entered
  const updateKeyboard = (currentResult, newResult) => {
    // Inputs:
    // currentResult - The color already displayed on the keyboard
    // newResult - The color of the letter in the most recent input
    return newResult === resultKeys.SUCCESS ? resultKeys.SUCCESS 
         : newResult === resultKeys.WRONGPOS && currentResult !== resultKeys.SUCCESS ? resultKeys.WRONGPOS // Don't override if already a 'SUCCESS'
         : newResult === resultKeys.WRONG && currentResult !== resultKeys.SUCCESS && currentResult !== resultKeys.WRONGPOS ? 1
         : currentResult
  }
  
  // Reset the board when new game started
  const resetBoard = (numGuesses, wordLength) => {
    if (numGuesses !== null)
      setWords(Array.apply(null, Array(numGuesses)).map(val => ' '.repeat(wordLength).split('')))
    if (wordLength !== null)
      setResults(Array.apply(null, Array(numGuesses)).map(val => Array.apply(null, Array(wordLength)).map(val => resultKeys.NONE)))
  }

  // Handle user win
  const onWin = () => {
    // Remove key logger
    window.removeEventListener('keydown', onKeyDown)
    setNumWins(numWins + 1)
    setStartState(false)
    setControlsToggle(true)
    setEndState("W")
  }
  // Handle user loss
  const onLoss = () => {
    window.removeEventListener('keydown', onKeyDown)
    setNumLosses(numLosses + 1)
    setStartState(false)
    setControlsToggle(true)
    setEndState("L")
  }

  // Handle when user submits guess
  const submitGuess = (word) => {
    console.log('correct', correctWord.current)

    const lowerCaseWord = word.toLowerCase()
    // Check if user's word is real
    if (availableWords.includes(lowerCaseWord)) { 
      // Store results/colors to indicate the results of the user's word
      let newResult = []
      // Split into array of characters
      const correctWordSplit = correctWord.current.split('')
      const userWordSplit = lowerCaseWord.split('')
      let userWordTemp = userWordSplit

      // Iterate through letters in user's word
      userWordSplit.forEach((letter, index) => {
        // Result for current letter
        let currentResult
        // Get first occurrence of current letter
        const letterPosition = correctWordSplit.indexOf(letter)
        // WRONG if letter does not exist
        if (letterPosition === -1) {
          currentResult = resultKeys.WRONG
        }
        else {
          // Correct if position of current letter matches the correct word
          if (userWordSplit[index] === correctWordSplit[index]) {
            currentResult = resultKeys.SUCCESS
            // Replace the first occurrence of letter with hash to avoid repeat
            correctWordSplit[letterPosition] = "#"
          }
          // Checks if there are more of the letters in the user's word than the correct word
          // In this case, the letter should be considered wrong
          // If there are 2 'E' in the correct word, but 3 'E' in the user's word, one
          // of them have to be wrong
          else if (getAllIndices(userWordTemp, letter).length > getAllIndices(correctWordSplit, letter).length) { 
            currentResult = resultKeys.WRONG
          }
          else {
            currentResult = resultKeys.WRONGPOS
            // correctWordSplit[letterPosition] = "#"
          }
          // Replace current letter with # to allow the letter count to reflect the remaining letters
          userWordTemp[index] = "#"
        }
        // Add to results array
        newResult.push(currentResult)
        // Update keyboard states
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

  const handleGuessChange = (changeValue) => (event) => {
    const newNumGuesses = numGuesses + changeValue
    setNumGuesses(newNumGuesses)
    resetBoard(newNumGuesses, wordLength)
  }

  const handleLengthChange = (changeValue) => (event) => {
    const newWordLength = wordLength + changeValue
    setWordLength(newWordLength)
    resetBoard(numGuesses, newWordLength)
  }
  
  const clickStart = (event) => {
    if (startState === false) {
      resetBoard(numGuesses, wordLength)

      availableWords = wordCorpus.filter(word => word.length === wordLength)
      correctWord.current = availableWords[Math.floor(Math.random() * availableWords.length)]
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
    // pe-none disables interactions when game is ended
    <Container fluid className={`bg-dark overflow-auto${endState !== null ? ' pe-none' : ''}`}>
      {alertMessage !== null 
        ? <Alert 
            variant = 'danger'
            className='position-absolute top-50 start-50' 
            style={{transform: 'translate(-50%, -50%)', WebkitTransform: 'translate(-50%, -50%)'}}
          >
            {alertMessage}
          </Alert>
        : null
      }
      
      <div style={{height: '100vh'}}>
        <EndWindow
          endStatus = {endState}
          closeHandle = {() => {setEndState(null)}}
          correctWord = {correctWord.current}
          numWins = {numWins}
          numLosses = {numLosses}
        />

        <Row className= "h-100 align-items-center">
        {/* style={{height: '100vh', position:'fixed', top: '50%', bottom:'50%'}} */}
          
          <Col className = "d-md-flex d-none flex-column justify-content-center align-items-center fixed-top" style={{height: '100vh'}} md = {3}>
            <Controls 
              text = 'Number of guesses' 
              value = {numGuesses}
              minValue = {minGuesses}
              maxValue = {maxGuesses}
              enabled = {controlsToggle}
              onClickUp = {handleGuessChange(1)} 
              onClickDown = {handleGuessChange(-1)}
            />
            <Controls 
              text = 'Word length' 
              value = {wordLength}
              minValue = {minLength}
              maxValue = {maxLength}
              enabled = {controlsToggle}
              onClickUp = {handleLengthChange(1)} 
              onClickDown = {handleLengthChange(-1)}
            />
            <div className='d-inline-block'>
              <Button size='lg' variant='primary' disabled = {startState === true ? true : false} onClick={clickStart}>Start</Button>{' '}
              <Button size='lg' variant='danger'>Retry</Button>
            </div>
          </Col>
          <Col xs = {12} md = {{span: 6, offset: 3}}>
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
      </div>
    </Container>
  )
}

export default App