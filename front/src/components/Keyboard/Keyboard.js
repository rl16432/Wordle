import 'bootstrap-icons/font/bootstrap-icons.css'
import 'bootstrap/dist/css/bootstrap.min.css'
import React from "react"
import { Button } from "react-bootstrap"
import './Keyboard.scss'

const Keyboard = ({ keyboardStates, className }) => {

  const onButtonClick = (letter) => () => {
    window.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: letter
      })
    )
  }

  return (
    <div className="fixed-bottom row">
      <div className={className}>
        {keyboardStates.map((row, rowIdx) => (
          <div key={rowIdx} className="d-flex flex-row justify-content-center align-items-center bd-highlight mb-3">
            {row.map((key, keyIdx) => (
              <Button
                key={keyIdx}
                className="letter-key d-flex border border-primary rounded text-white justify-content-center p-2 mx-1"
                onClick={onButtonClick(key.display)}
                onKeyDown={(event) => {
                  // Stops the key from pression if the key is focused on Enter
                  if (event.key === 'Enter') {
                    event.preventDefault()
                  }
                }}
                variant={
                  key.state === 3 ? "success"
                    : key.state === 2 ? "warning"
                      : key.state === 1 ? "dark"
                        : "secondary"
                }
              >
                {key.display}
              </Button>
            ))}
            {
              rowIdx === keyboardStates.length - 1
                ? (
                  <>
                    <Button
                      className="backspace-key d-flex border border-primary rounded text-white justify-content-center p-2 mx-1"
                      onClick={onButtonClick("Backspace")}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter') {
                          event.preventDefault()
                        }
                      }}
                      variant="dark"
                    >
                      <i className="bi bi-backspace"></i>
                    </Button>
                    <Button
                      className="enter-key d-flex border border-primary rounded text-white justify-content-center p-2 mx-1"
                      onClick={onButtonClick("Enter")}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter') {
                          event.preventDefault()
                        }
                      }}
                      variant="dark"
                    >
                      <i className="bi bi-arrow-return-left"></i>
                    </Button>
                  </>
                )
                : null
            }
          </div>
        ))}
      </div>
    </div>
  )
}

export default Keyboard