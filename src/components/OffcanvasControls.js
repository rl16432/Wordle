import React, { useState } from "react"
import { Navbar, Container, Button } from "react-bootstrap"
import ControlSet from "./ControlSet"

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
    <Navbar expand={breakpoint} className={className}>
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