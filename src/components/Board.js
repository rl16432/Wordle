import React from "react"
import { Row, Col } from "react-bootstrap"
import AllGuesses  from "./AllGuesses"

const Board = ({ wordLength, words, allResults, numBoards, className }) => {
  const breakpoint = "md"
  return (
    <div className={className}>
      <Row className="mb-4">
        <Col className={`col-${breakpoint}-6 px-2`}>
          <AllGuesses wordLength={wordLength} words={words} results={allResults} />
        </Col>
        <Col className={`col-${breakpoint}-6 px-2`}>
          <AllGuesses wordLength={wordLength} words={words} results={allResults} />
        </Col>
      </Row>
      <Row className="mb-4">
        <Col className={`col-${breakpoint}-6 px-2`}>
          <AllGuesses wordLength={wordLength} words={words} results={allResults} />
        </Col>
        <Col className={`col-${breakpoint}-6 px-2`}>
          <AllGuesses wordLength={wordLength} words={words} results={allResults} />
        </Col>
      </Row>
    </div>
  )
}

export default Board