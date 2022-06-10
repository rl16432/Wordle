import React from "react"
import Controls from "./Controls"

/**
 * Shows the set of controls by passing in an array of the values required for Controls
 * 
 * @param texts An array of the texts to display beside the controls 
 * @param values An array of the numerical value of the control
 * @param minValues An array of the minimum value the control can take
 * @param maxValues An array of the maximum value the control can take
 * @param enabled A boolean value to indicate if the controls are enabled
 * @param onClickUps An array of event handlers, when the up button is clicked for each control
 * @param onClickDowns An array of event handlers, when the down button is clicked for each control
 * @returns Set of controls component
 */
const ControlSet = ({ texts, values, minValues, maxValues, enabled, onClickUps, onClickDowns, className }) => {
  return (
    <div className={className}>
      {texts.map((text, idx) =>
        <Controls
          text={text}
          value={values[idx]}
          minValue={minValues[idx]}
          maxValue={maxValues[idx]}
          enabled={enabled}
          onClickUp={onClickUps[idx]}
          onClickDown={onClickDowns[idx]}
          key={text}
        />)
      }
    </div>
  )
}

export default ControlSet