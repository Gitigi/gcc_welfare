import React, {Component} from 'react'
import {Switch, withRouter} from 'react-router-dom'
import { TransitionGroup } from "react-transition-group";
import {SlideVertical} from './transitions'
import './animated-switch.css';



class AnimatedSwitch extends Component{
  render(){
    let index;
    let parentPath = this.props.match.path.replace(/^\/+|\/+$/g, '');
    if(!parentPath.length){
      index = 0;
    }else{
      index = parentPath.split('/').length;
    }
    let key = this.props.location.pathname.replace(/^\/+|\/+$/g, '').split('/')
      .slice(index,index+(this.props.fields||1)).join('') || '';
    return <TransitionGroup appear={true} className='animated-switch'>
        <SlideVertical key={key}>  
          <Switch location={this.props.location}>
            {this.props.children}
          </Switch>
        </SlideVertical>
      </TransitionGroup>
		
	}
}

export default withRouter(AnimatedSwitch);
