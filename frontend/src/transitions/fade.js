import React from 'react'
import { CSSTransition } from "react-transition-group"

import './fade.css'

export default (props) => {
  let c = 'fade-transition'
  if(props.visible)
    c = 'fade-transition-visible';
  else if(props.switch)
    c = 'fade-transition-switch';
  return <CSSTransition
    {...props}
    classNames={c}
    timeout={{ enter: 500, exit: 300 }}
    appear
    mountOnEnter
  />
}