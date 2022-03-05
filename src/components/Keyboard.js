import React from "react"
import 'bootstrap/dist/css/bootstrap.min.css'
import { Button } from "react-bootstrap"

const Keyboard = ({ keyboardStates }) => {
  // const keys = ['QWERTYUIOP', 'ASDFGHJKL', 'ZXCVBNM'].map(row => row.split('')) 

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
              onClick={onButtonClick(key.display)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault()
                } 
              }}
              onMouseEnter = {(event) => {
                event.target.style.background = "none"
              }}
              className = "d-flex rounded text-white p-2"
              variant = {key.state === 3 ? "success" : key.state === 2 ? "warning" : "outline-primary"}
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