import React from "react"
import 'bootstrap/dist/css/bootstrap.min.css'
import { Button } from "react-bootstrap"

const Keyboard = ({ keyboardStates }) => {

  const onButtonClick = (letter) => () => {
    window.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: letter
      })
    )
  }
  return (
    <>
      {keyboardStates.map((row, rowIdx) => (
        <div key = {rowIdx} className="d-flex flex-row justify-content-center align-items-center bd-highlight mb-3">
          {row.map((key, keyIdx) => (
            <Button 
              key = {keyIdx}
              className = "d-flex border border-primary rounded text-white justify-content-center p-2 mx-1"
              style = {{width: "1.8rem"}}
              onClick={onButtonClick(key.display)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault()
                } 
              }}
              // onMouseEnter = {(event) => {
              //   event.target.style.background = "none"
              // }}
              variant = {
                key.state === 3 ? "success" 
              : key.state === 2 ? "warning"
              : key.state === 1 ? "dark"
              : "secondary"}
            >
              {key.display}
            </Button>
          ))}
        </div>
      ))}
    </>
  )
}

export default Keyboard