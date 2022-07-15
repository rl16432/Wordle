import React from "react"
import { Alert, Badge, CloseButton } from "react-bootstrap"

const EndWindow = ({ endStatus, closeHandle, correctWords, numWins, numLosses }) => {
  if (endStatus === null || (endStatus !== "W" && endStatus !== "L")) {
    return null
  }

  return (
    <Alert
      className='position-fixed top-50 start-50 pe-auto'
      style={{ transform: 'translate(-50%, -50%)', WebkitTransform: 'translate(-50%, -50%)' }}
    >
      <div className='d-flex flex-row-reverse mb-2'>
        <CloseButton onClick={closeHandle} />
      </div>
      <h4 className='d-block text-center'>You {endStatus === "W" ? "Won!" : "Lost!"}</h4>
      {endStatus === "L"
        ?
        <h5 className='text-center my-3'>
          {correctWords.length > 1 ? 'The words were ' : 'The word was '}
          <strong>{correctWords.map((word, idx) => idx === correctWords.length - 1 ? word.toUpperCase() : `${word.toUpperCase()}, `)}</strong>
        </h5>
        : null}
      <p className="mb-2 text-center">Wins: <Badge>{numWins}</Badge></p>
      <p className="text-center">Losses: <Badge>{numLosses}</Badge></p>
    </Alert>
  )
}

export default EndWindow