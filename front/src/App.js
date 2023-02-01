import React, { useEffect, useRef, useState } from "react"
import { Badge, Button, Col, Container, Row } from "react-bootstrap"
import {
  Board, ControlSet, EndWindow, GameAlert, Keyboard, OffcanvasControls
} from "./components/index"
import wordCorpus from "./words"

import "bootstrap-icons/font/bootstrap-icons.css"
import "bootstrap/dist/css/bootstrap.min.css"
import "./App.scss"

const App = () => {
  const resultKeys = {
    SUCCESS: 3, // Green for correct letter and position
    WRONGPOS: 2, // Yellow for correct letter, wrong position
    WRONG: 1, // Black for incorrect letter
    NONE: 0, // No letter
  }

  // Time which alert is displayed on screen (ms)
  const alertTime = 2000
  let alertCounter = 0

  // Parameters for game controls (min/max word length and min/max number of guesses)
  const minGuesses = 3
  const maxGuesses = Infinity
  const minLength = 3
  const maxLength = 10
  const minBoards = 1
  const maxBoards = 8

  // Breakpoint for the controls to be shrunk
  const breakpoint = "lg"

  // Current number of guesses
  const [numGuesses, setNumGuesses] = useState(6)
  // Current word length
  const [wordLength, setWordLength] = useState(5)
  // Number of boards
  const [numBoards, setNumBoards] = useState(1)
  // Current words displayed on screen (2D array [wordLength, numGuesses])
  const [words, setWords] = useState(
    Array.apply(null, Array(numGuesses)).map((val) =>
      " ".repeat(wordLength).split("")
    )
  )

  // Results for the letters typed (3D array [wordLength, numGuesses, numBoards])
  const [results, setResults] = useState(
    Array.apply(null, Array(numBoards)).map((val) =>
      Array.apply(null, Array(numGuesses)).map((val) =>
        Array.apply(null, Array(wordLength)).map((val) => resultKeys.NONE)
      )
    )
  )
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
  // Ref used to access the board's parent element
  const boardElemRef = useRef(null)

  // Array for colors on the keyboard
  const keyboardStates = useRef(
    ["QWERTYUIOP", "ASDFGHJKL", "ZXCVBNM"]
      .map((row) => row.split(""))
      .map((row) =>
        row.map((key) => ({
          display: key,
          state: resultKeys.NONE,
        }))
      )
  )

  // Current correct word(s)
  const correctWords = useRef(Array.apply(null, Array(wordLength)))

  // Number to track the current guess the user is on
  let currentGuess
  // Number representing current position in 2D array
  let currentPosition
  // List of available words for selected length
  let availableWords
  // Whether end of word has been reached when user types
  let endOfWord
  // Array to show whether the correct word has been reached in each board
  let isWordCorrect
  // Array to show how many guesses it took for a particular word
  const wordGuessedOn = useRef(Array.apply(null, Array(numBoards)))

  useEffect(() => {
    console.log("width", boardElemRef.current.offsetWidth)
  }, [])

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
    let indices = [],
      i
    for (i = 0; i < arr.length; i++) if (arr[i] === val) indices.push(i)
    return indices
  }

  // Update the colors on the keyboard as new words are entered
  const updateKeyboard = (currentResult, newResult) => {
    // Inputs:
    // currentResult - The color already displayed on the keyboard
    // newResult - The color of the letter in the most recent input
    return newResult === resultKeys.SUCCESS
      ? resultKeys.SUCCESS
      : newResult === resultKeys.WRONGPOS &&
        currentResult !== resultKeys.SUCCESS
      ? resultKeys.WRONGPOS // Don't override if already a 'SUCCESS'
      : newResult === resultKeys.WRONG &&
        currentResult !== resultKeys.SUCCESS &&
        currentResult !== resultKeys.WRONGPOS
      ? 1
      : currentResult
  }

  /**
   * Reset the board when new game started
   *
   * @param numBoards Specify the number of boards the game should have
   * @param numGuesses Specify the number of guesses the board should have
   * @param wordLength Specify the length of the words in the game
   */
  const resetBoard = (numBoards, numGuesses, wordLength) => {
    if (numGuesses !== null)
      setWords(
        Array.apply(null, Array(numGuesses)).map((val) =>
          " ".repeat(wordLength).split("")
        )
      )
    if (wordLength !== null)
      setResults(
        Array.apply(null, Array(numBoards)).map((val) =>
          Array.apply(null, Array(numGuesses)).map((val) =>
            Array.apply(null, Array(wordLength)).map((val) => resultKeys.NONE)
          )
        )
      )
  }

  /**
   * Reset game state when the user wins
   */
  const onWin = () => {
    // Remove key logger
    window.removeEventListener("keydown", onKeyDown)
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
    window.removeEventListener("keydown", onKeyDown)
    setNumLosses(numLosses + 1)
    setStartState(false)
    setControlsToggle(true)
    setEndState("L")
  }

  /**
   * When the Enter button is pressed and a guess is submitted
   *
   * @param word The word that the user submits as part of guess
   * @param correctWord The correct word to compare against
   * @returns The results of the user's guess (Yellow/Green/Black)
   */
  const submitGuess = (word, correctWord) => {
    console.log("correct", correctWords.current)

    const lowerCaseWord = word.toLowerCase()
    // Check if user's word is real
    if (availableWords.includes(lowerCaseWord)) {
      // Store results/colors to indicate the results of the user's word
      let newResult = []
      // Split into array of characters
      const correctWordSplit = correctWord.split("")
      const userWordSplit = lowerCaseWord.split("")
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
        } else {
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
          else if (
            getAllIndices(userWordTemp, letter).length >
            getAllIndices(correctWordSplit, letter).length
          ) {
            currentResult = resultKeys.WRONG
          } else {
            currentResult = resultKeys.WRONGPOS
          }
          // Replace current letter with # to allow the 'getAllIndices' letter count to reflect the remaining letters
          userWordTemp[index] = "#"
        }
        // Add to results array
        newResult.push(currentResult)
        // Update keyboard states
        keyboardStates.current = keyboardStates.current.map((row) =>
          row.map((key) =>
            key.display === letter.toUpperCase()
              ? {
                  display: key.display,
                  state: updateKeyboard(key.state, currentResult),
                }
              : key
          )
        )
      })
      return newResult
    } else {
      return null
    }
  }

  /**
   * Handles the response when the Enter button is pressed
   *
   * @param words The 3D array which contains the list of user inputted words
   * @param row The row after the row which contains the most recent word the user is attempting to submit
   */
  const onEnterPress = (words, row) => {
    // 3D array of new results
    let allResults = []
    console.log(currentGuess)
    console.log(wordGuessedOn)

    for (let idx = 0; idx < correctWords.current.length; idx++) {
      const outcome = submitGuess(
        words[row - 1].join(""),
        correctWords.current[idx]
      )

      // Don't run the submit if the word has already been correctly identified
      if (isWordCorrect[idx] !== true) {
        if (outcome === null) {
          displayAlert(
            `Word '${words[row - 1].join("")}' does not exist.`,
            alertTime
          )
          return
        } else {
          const tempResults = resultsRef.current[idx].map((result, index) =>
            index === row - 1 ? outcome : result
          )

          allResults.push(tempResults)

          // Create new 2D array for results
          if (outcome.every((val) => val === resultKeys.SUCCESS)) {
            isWordCorrect[idx] = true
            wordGuessedOn.current[idx] = currentGuess
            // Check if all words have been identified
            if (isWordCorrect.every((val) => val === true)) {
              onWin()
            }
          } else if (currentGuess === numGuesses) {
            console.log("hi")
            onLoss()
          }
        }
      } else {
        allResults.push(resultsRef.current[idx])
      }
    }
    // New word is reached
    endOfWord = false
    currentGuess++
    // Update state for results
    setResults(allResults) //.map(result => [...result]))
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
    tempWords[Math.floor(currentPosition / wordLength)][
      currentPosition % wordLength
    ] = " "
    setWords(tempWords)
  }

  const onKeyDown = (event) => {
    // console.log('currpos', currentPosition)
    // console.log('currgue', currentGuess)
    const key = event.key
    const row = Math.floor(currentPosition / wordLength)
    const col = currentPosition % wordLength

    // If reached the beginning of next row
    if (key === "Enter" && endOfWord === true) {
      onEnterPress(wordsRef.current, row)
    } else if (
      /^[a-z]$/i.test(key) === true &&
      (endOfWord === false || endOfWord === undefined)
    ) {
      onLetterPress(wordsRef.current, key, row, col, wordLength)
    } else if (
      key === "Backspace" &&
      currentPosition > (currentGuess - 1) * wordLength
    ) {
      onBackspacePress(wordsRef.current, col)
    }
  }

  /**
   * onClick event handler for changing the number of guesses
   *
   * @param changeValue The amount of which to change by
   */
  const handleGuessChange = (changeValue) => (event) => {
    const newNumGuesses = numGuesses + changeValue
    setNumGuesses(newNumGuesses)
    resetBoard(numBoards, newNumGuesses, wordLength)
  }

  /**
   * onClick event handler for changing the word length
   *
   * @param changeValue The amount of which to change by
   */
  const handleLengthChange = (changeValue) => (event) => {
    const newWordLength = wordLength + changeValue
    setWordLength(newWordLength)
    resetBoard(numBoards, numGuesses, newWordLength)
  }

  /**
   * onClick event handler for changing the number of boards
   *
   * @param changeValue The amount of which to change by
   */
  const handleBoardsChange = (changeValue) => (event) => {
    const newNumBoards = numBoards + changeValue
    setNumBoards(newNumBoards)
    resetBoard(newNumBoards, numGuesses, wordLength)
  }

  /**
   * onClick event handler for the Start button
   *
   * @param event Parameter to signify the click event
   */
  const clickStart = (event) => {
    if (startState === false) {
      resetBoard(numBoards, numGuesses, wordLength)

      availableWords = wordCorpus.filter((word) => word.length === wordLength)
      // Get new list of correct words
      correctWords.current = Array.apply(null, Array(numBoards)).map(
        () => availableWords[Math.floor(Math.random() * availableWords.length)]
      )
      currentPosition = 0
      currentGuess = 1

      // Reset the isWordCorrect and wordGuessedOn.current arrays
      isWordCorrect = Array.apply(null, Array(numBoards)).map(() => false)
      wordGuessedOn.current = Array.apply(null, Array(numBoards))

      keyboardStates.current = ["QWERTYUIOP", "ASDFGHJKL", "ZXCVBNM"]
        .map((row) => row.split(""))
        .map((row) =>
          row.map((key) => ({ display: key, state: resultKeys.NONE }))
        )

      window.addEventListener("keydown", onKeyDown)

      setStartState(true)
      event.target.blur() // Remove focus on button after disabling
      setControlsToggle(false)
    }
  }

  return (
    <>
      {/* Invalid word alert */}
      <GameAlert alertMessage={alertMessage} />

      {/* Shrunk controls */}
      <OffcanvasControls
        breakpoint={breakpoint}
        texts={["Number of Guesses", "Word Length", "Number of Boards"]}
        values={[numGuesses, wordLength, numBoards]}
        minValues={[minGuesses, minLength, minBoards]}
        maxValues={[maxGuesses, maxLength, maxBoards]}
        enabled={controlsToggle}
        onClickUps={[
          handleGuessChange(1),
          handleLengthChange(1),
          handleBoardsChange(1),
        ]}
        onClickDowns={[
          handleGuessChange(-1),
          handleLengthChange(-1),
          handleBoardsChange(-1),
        ]}
        startState={startState}
        clickStart={clickStart}
        className={`bg-dark mb-3 d-${breakpoint}-none sticky-top border-bottom border-primary`}
      />

      <EndWindow
        endStatus={endState}
        closeHandle={() => {
          setEndState(null)
        }}
        correctWords={correctWords.current}
        numWins={numWins}
        numLosses={numLosses}
      />

      {/* pe-none disables interactions when game is ended */}
      <Container
        fluid
        className={`bg-dark ${endState !== null ? " pe-none" : ""}`}
      >
        <Row className=" h-100 align-items-center">
          <Col
            className={`col-${breakpoint}-3 d-${breakpoint}-flex d-none flex-column justify-content-center align-items-center fixed-top vh-100`}
          >
            <ControlSet
              texts={["Number of Guesses", "Word Length", "Number of Boards"]}
              values={[numGuesses, wordLength, numBoards]}
              minValues={[minGuesses, minLength, minBoards]}
              maxValues={[maxGuesses, maxLength, maxBoards]}
              enabled={controlsToggle}
              onClickUps={[
                handleGuessChange(1),
                handleLengthChange(1),
                handleBoardsChange(1),
              ]}
              onClickDowns={[
                handleGuessChange(-1),
                handleLengthChange(-1),
                handleBoardsChange(-1),
              ]}
            />
            <div className="d-inline-block">
              <Button
                size="lg"
                variant="primary"
                disabled={startState === true ? true : false}
                onClick={clickStart}
              >
                Start
              </Button>{" "}
            </div>
          </Col>
          <Col
            ref={boardElemRef}
            xs={{ span: 10, offset: 1 }}
            className={`board-parent col-${breakpoint}-6 offset-${breakpoint}-3`}
          >
            <Board
              wordLength={wordLength}
              words={words}
              wordGuessedOn={wordGuessedOn.current}
              allResults={results}
              numBoards={numBoards}
              className={`mt-${breakpoint}-5`}
            />
          </Col>
          <Col
            className={`col-${breakpoint}-3 offset-${breakpoint}-9 d-${breakpoint}-flex d-none flex-column justify-content-center align-items-center fixed-top text-white`}
            style={{ height: "100vh" }}
          >
            <h4>
              Wins: <Badge>{numWins}</Badge>
            </h4>
            <h4>
              Losses: <Badge>{numLosses}</Badge>
            </h4>
          </Col>
        </Row>
        <Keyboard
          keyboardStates={keyboardStates.current}
          className={`col-12 offset-1 col-${breakpoint}-4 offset-${breakpoint}-4 pt-3 bg-dark mx-auto`}
        />
      </Container>
    </>
  )
}

export default App
