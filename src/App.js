import React, { useState, useEffect, useRef } from 'react'
import wordCorpus from './words'
import { GameAlert, ControlSet, OffcanvasControls, AllGuesses, Board, Keyboard, EndWindow } from './components/index'
import { Badge, Button, Col, Container, Navbar, Row } from 'react-bootstrap'

import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap-icons/font/bootstrap-icons.css'
import './App.scss'

const App = () => {

  const resultKeys = {
    SUCCESS: 3, // Green for correct letter and position
    WRONGPOS: 2, // Yellow for correct letter, wrong position
    WRONG: 1, // Black for incorrect letter
    NONE: 0 // No letter
  }

  // Time which alert is displayed on screen (ms)
  const alertTime = 2000
  let alertCounter = 0;

  // Parameters for game controls (min/max word length and min/max number of guesses) 
  const minGuesses = 3
  const maxGuesses = Infinity
  const minLength = 3
  const maxLength = 10
  // Breakpoint for the controls to be shrunk
  const breakpoint = "md"

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
  const displayAlert = (newAlert, timeout) => {

    setAlertMessage(newAlert)
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

  /** 
   * Reset the board when new game started
   * 
   * @param {*} numGuesses Specify the number of guesses the board should have
   * @param {*} wordLength Specify the length of the words in the game
   */
  const resetBoard = (numGuesses, wordLength) => {
    if (numGuesses !== null)
      setWords(Array.apply(null, Array(numGuesses)).map(val => ' '.repeat(wordLength).split('')))
    if (wordLength !== null)
      setResults(Array.apply(null, Array(numGuesses)).map(val => Array.apply(null, Array(wordLength)).map(val => resultKeys.NONE)))
  }


  /**
   * Reset game state when the user wins
   */
  const onWin = () => {
    // Remove key logger
    window.removeEventListener('keydown', onKeyDown)
    setNumWins(numWins + 1)
    setStartState(false)
    // The controls for the game options are enabled again
    setControlsToggle(true)
    setEndState("W")
  }

  /**
   * Reset game state when the user loses
   */
  const onLoss = () => {
    window.removeEventListener('keydown', onKeyDown)
    setNumLosses(numLosses + 1)
    setStartState(false)
    setControlsToggle(true)
    setEndState("L")
  }

  /**
   * When the Enter button is pressed and a guess is submitted
   * 
   * @param word The word that the user submits as part of guess
   * @returns The results of the user's guess (Yellow/Green/Black)
   */
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
          }
          // Replace current letter with # to allow the 'getAllIndices' letter count to reflect the remaining letters
          userWordTemp[index] = "#"
        }
        // Add to results array
        newResult.push(currentResult)
        // Update keyboard states
        keyboardStates.current = keyboardStates.current.map(row => (
          row.map(key => (
            key.display === letter.toUpperCase() ? { display: key.display, state: updateKeyboard(key.state, currentResult) } : key
          ))
        ))
      })
      return newResult
    }
    else {
      return null
    }
  }

  /**
   * Handles the response when the Enter button is pressed
   * 
   * @param {*} words The 2D array which contains the list of user inputted words 
   * @param {*} row The row which contains the most recent word the user is attempting to 
   */
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
    // Determine if the end of the word has been reached
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

      keyboardStates.current = ['QWERTYUIOP', 'ASDFGHJKL', 'ZXCVBNM'].map(row => row.split('')).map(row => row.map(key => ({ display: key, state: resultKeys.NONE })))

      window.addEventListener('keydown', onKeyDown)

      setStartState(true)
      event.target.blur() // Remove focus on button after disabling
      setControlsToggle(false)
    }
  }

  return (

    <>
      {/* Invalid word alert */}
      <GameAlert alertMessage={alertMessage} />

      {/* Shrunk controls
      <Container fluid className={`sticky-top d-${breakpoint}-none bg-dark border-bottom border-primary`}>
        <Button variant="outline-primary" className='d-inline-block my-2'>
          <h1 className='mb-0'><i className="bi bi-list"></i></h1>
        </Button>
      </Container> */}

      {/* Shrunk controls */}


      <OffcanvasControls
        breakpoint={breakpoint}
        texts={['Number of Guesses', 'Word Length']}
        values={[numGuesses, wordLength]}
        minValues={[minGuesses, minLength]}
        maxValues={[maxGuesses, maxLength]}
        enabled={controlsToggle}
        onClickUps={[handleGuessChange(1), handleLengthChange(1)]}
        onClickDowns={[handleGuessChange(-1), handleLengthChange(-1)]}
        startState={startState}
        clickStart={clickStart}
        className="bg-dark mb-3 d-md-none"
      />

      <EndWindow
        endStatus={endState}
        closeHandle={() => { setEndState(null) }}
        correctWord={correctWord.current}
        numWins={numWins}
        numLosses={numLosses}
      />

      {/* pe-none disables interactions when game is ended */}
      <Container fluid className={`bg-dark ${endState !== null ? ' pe-none' : ''}`}>

        <Row className=" h-100 align-items-center">
          <Col className={`col-${breakpoint}-3 d-${breakpoint}-flex d-none flex-column justify-content-center align-items-center fixed-top vh-100`}>
            <ControlSet
              texts={['Number of Guesses', 'Word Length']}
              values={[numGuesses, wordLength]}
              minValues={[minGuesses, minLength]}
              maxValues={[maxGuesses, maxLength]}
              enabled={controlsToggle}
              onClickUps={[handleGuessChange(1), handleLengthChange(1)]}
              onClickDowns={[handleGuessChange(-1), handleLengthChange(-1)]}
            />
            <div className='d-inline-block'>
              <Button size='lg' variant='primary' disabled={startState === true ? true : false} onClick={clickStart}>Start</Button>{' '}
            </div>
          </Col>
          <Col xs={{ span: 10, offset: 1 }} className={`col-${breakpoint}-6 offset-${breakpoint}-3`}>
            <AllGuesses wordLength={wordLength} words={words} results={results} className={`mt-${breakpoint}-5 mb-3`} />
            {/* <Board wordLength={wordLength} words={words} allResults={results} className={`mt-${breakpoint}-5`}/> */}
            <Keyboard keyboardStates={keyboardStates.current} />
          </Col>
          <Col
            className={`col-${breakpoint}-3 offset-${breakpoint}-9 d-${breakpoint}-flex d-none flex-column justify-content-center align-items-center fixed-top text-white`}
            style={{ height: '100vh' }}
          >
            <h4>Wins: <Badge>{numWins}</Badge></h4>
            <h4>Losses: <Badge>{numLosses}</Badge></h4>
          </Col>
        </Row>

      </Container>
    </>
  )
}

export default App