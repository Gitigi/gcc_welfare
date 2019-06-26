import React, {Component} from 'react'
import { CSSTransition } from "react-transition-group";
import * as Animated from "animated/lib/targets/react-dom";
import './slide-vertical.css';

export default class extends Component {
  state = {
    animate: new Animated.Value(0)
  };
  onEnter = (node) => {
    setTimeout(
			() => Animated.spring(this.state.animate, { toValue: 1 }).start(),
			250
		);
  }
  
  onExit = () => {
    Animated.spring(this.state.animate, { toValue: 0 }).start();
  }
  render(){
    const style = {
			opacity: Animated.template`${this.state.animate}`,
			transform: Animated.template`
				translate3d(0,${this.state.animate.interpolate({
				inputRange: [0, 1],
				outputRange: ["12px", "0px"]
			})},0)
			`
		};
    return <CSSTransition {...this.props} classNames='slide-vertical-transition'
        timeout={{enter: 250, exit: 175}}
        onEnter={this.onEnter}
        onEntering={this.onEntering}
        onEntered={this.onEntered}
        onExit={this.onExit}
        onExiting={this.onExiting}
      >
        <Animated.div style={style} className='slide-vertical-transition'>
          {this.props.children}
        </Animated.div>
      </CSSTransition>
  }
}
