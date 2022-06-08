import React from "react"
import { Alert } from "react-bootstrap"

/**
 * On-screen alert used primarily for alerting user to invalid words
 * 
 * @param alertMessage The message to be displayed by the alert 
 */
const GameAlert = ({ alertMessage }) => {
  // Alert is positioned in centre of screen
  return (<>
    {alertMessage !== null
      ? <Alert
        variant='danger'
        // position-fixed makes it in centre of screen regardless of scroll height
        className='position-fixed top-50 start-50'
        style={{ transform: 'translate(-50%, -50%)', WebkitTransform: 'translate(-50%, -50%)' }}
      >
        {alertMessage}
      </Alert>
      : null
    }
  </>
  )
}

export default GameAlert