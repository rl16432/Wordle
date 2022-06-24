import React from "react"
import { Button, ButtonGroup, Badge } from "react-bootstrap"

const Controls = ({ text, value, minValue, maxValue, enabled, onClickUp, onClickDown }) => {
  const bootstrapStyle = {
    container: 'd-block text-center py-2',
    controlText: 'text-white d-inline-block mx-3',
    controlsGroup: "d-inline-flex",
  }
  
  return (
    <div className={`${bootstrapStyle.container}`} >
      <h4 className={`${bootstrapStyle.controlText} control-text`}>
        {text} <Badge>{value}</Badge>
      </h4>
      <ButtonGroup vertical size = "md" className={`${bootstrapStyle.controlsGroup} control-button-group`}>
        <Button variant='outline-primary' className="control-button" onClick={onClickUp} disabled={enabled === true && value < maxValue ? false : true}>
          <i className="bi bi-arrow-up control-arrow"></i>
        </Button>
        <Button variant='outline-primary' className="control-button" onClick={onClickDown} disabled={enabled === true && value > minValue ? false : true}>
          <i className="bi bi-arrow-down control-arrow"></i>
        </Button>
      </ButtonGroup>
    </div>
  )
}

export default Controls