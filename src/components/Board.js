import React from "react"
import { Row, Col } from "react-bootstrap"
import AllGuesses from "./AllGuesses"

const Board = ({ wordLength, words, wordGuessedOn, allResults, numBoards, className }) => {
  const breakpoint = "md"
  const boardWidth = Math.floor(Math.sqrt(numBoards))

  if (true) { //words.length <= 3) {
    return (
      <div className={`board ${className}`}>
        {
          allResults.map(
            (results, resultsIdx) => (
              <Row key={resultsIdx} className="mb-3">
                {/* Stacks the boards when passed the breakpoint */}
                <Col className={`col-${breakpoint}-12 px-2`}>
                  <AllGuesses
                    wordLength={wordLength}
                    boardWidth={boardWidth}
                    words={
                      words.map((word, wordIdx) =>
                        // If the word has already been identified, then don't render the rest of the guesses in that board
                        wordGuessedOn[resultsIdx] === undefined || wordIdx <= wordGuessedOn[resultsIdx] - 1
                          ? word
                          : ' '.repeat(wordLength).split('')
                      )
                    }
                    results={results}
                  />
                </Col>
              </Row>
            )
          )
        }
      </div>
    )
  }
  // return (
  //   <div className={className}>
  //     <Row className="mb-4">
  //       <Col className={`col-${breakpoint}-6 px-2`}>
  //         <AllGuesses wordLength={wordLength} words={words} results={allResults} />
  //       </Col>
  //       <Col className={`col-${breakpoint}-6 px-2`}>
  //         <AllGuesses wordLength={wordLength} words={words} results={allResults} />
  //       </Col>
  //     </Row>
  //     <Row className="mb-4">
  //       <Col className={`col-${breakpoint}-6 px-2`}>
  //         <AllGuesses wordLength={wordLength} words={words} results={allResults} />
  //       </Col>
  //       <Col className={`col-${breakpoint}-6 px-2`}>
  //         <AllGuesses wordLength={wordLength} words={words} results={allResults} />
  //       </Col>
  //     </Row>
  //   </div>
  // )
}

export default Board