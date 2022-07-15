import React, { useState } from "react"
import { Navbar, Container, Button } from "react-bootstrap"
import ControlSet from "./ControlSet"

/**
 * 
 * @param breakpoint Bootstrap breakpoint to signify when the offcanvas should show
 * @param texts An array of the texts to display beside the controls 
 * @param values An array of the numerical value of the control
 * @param minValues An array of the minimum value the control can take
 * @param maxValues An array of the maximum value the control can take
 * @param enabled A boolean value to indicate if the controls are enabled
 * @param onClickUps An array of event handlers, when the up button is clicked for each control
 * @param onClickDowns An array of event handlers, when the down button is clicked for each control
 * @param startState Boolean to show if the game already started
 * @param clickStart Event handler for when the start button is clicked
 * @returns Offcanvas controls component for small screens
 */

const OffcanvasControls = (props) => {
  const {
    breakpoint,
    texts,
    values,
    minValues,
    maxValues,
    enabled,
    onClickUps,
    onClickDowns,
    startState, // Is the game already started
    clickStart, // Event handler for when the start button is clicked
    className
  } = props

  const [show, setShow] = useState(false)

  const handleClose = () => {
    setShow(false)
  }

  const handleShow = (event) => {
    event.preventDefault()
    setShow(true)
  }

  return (
    <Navbar expand={breakpoint} className={`d-${breakpoint}-none ${className}`}>
      <Container fluid>
        <Navbar.Toggle className='btn btn-outline-primary border-primary' aria-controls="offcanvasControls" onClick={handleShow} />
        <Navbar.Offcanvas
          id="offcanvasControls"
          aria-labelledby="offcanvasControlsLabel"
          placement="start"
          show={show}
          onHide={handleClose}
          className="bg-dark justify-content-center align-items-center d-flex flex-column"
        >
          <Button
            variant="outline-dark"
            id="offcanvas-close"
            className="position-absolute top-0 end-0 mt-3 me-3 p-0"
            onClick={handleClose}
          >
            {/* svg used instead of web font in order for size customisability */}
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill = "currentColor" className="bi bi-x" viewBox="0 0 16 16">
              <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z" />
            </svg>
          </Button>
          <ControlSet
            texts={texts}
            values={values}
            minValues={minValues}
            maxValues={maxValues}
            enabled={enabled}
            onClickUps={onClickUps}
            onClickDowns={onClickDowns}
            className="mx-auto"
          />
          <div className='d-inline-block'>
            <Button size='lg' variant='primary' disabled={startState === true ? true : false} onClick={(event) => { clickStart(event); handleClose(); }}>Start</Button>{' '}
          </div>
        </Navbar.Offcanvas>
      </Container>
    </Navbar>
  )
}

export default OffcanvasControls