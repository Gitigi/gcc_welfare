import React, {Component} from 'react';

import * as $ from 'jquery/dist/jquery.slim';


let tabsCount = 0;
export class Tabs extends Component{
  tabs = React.createRef();
  tabId = `tab-id-${++tabsCount}-`;
  tabCount = 0;
  isFirstRender = false;
  componentDidMount(){
    this.setTab();
    $(this.tabs.current).find('a').on('show.bs.tab shown.bs.tab',this.handleEvent.bind(this));
  }
  
  getSnapshotBeforeUpdate(prevProps,prevState){
    return this.props.children.length !== prevProps.children.length;
  }
  
  componentDidUpdate(prevProps,prevState,snapshot){
    if(this.props.selected !== prevProps.selected){
      this.setTab();
    }
    
    //if snapshot update tab event listener
    if(snapshot){
      //reset event listener for tab events
      $(this.tabs.current).find('a').off('show.bs.tab shown.bs.tab')
      $(this.tabs.current).find('a').on('show.bs.tab shown.bs.tab',this.handleEvent.bind(this));
    }
  }
  
  setTab(){
    if(!this.props.selected)
      $(this.tabs.current).find('a:first').trigger('click')
    else
      $(this.tabs.current).find(`[data-target=\\#${this.tabId+this.props.selected}]`).trigger('click');
  }
  
  handleEvent(e){
    if(this.props.handleEvent)
      this.props.handleEvent(e);
  }
  
  render(){
    if(this.isFirstRender)
        this.isFirstRender = false;
    else
      this.tabCount = 0;
    
    let children = [];
    let headings = this.props.children.map((child,index)=>{ 
      if(!child) return;
      let id = `${this.tabId + (child.props.id || ++this.tabCount)}`;
      
      children.push(<child.type {...child.props} id={id} key={id} />);
      return <li key={id}>
            <a  data-toggle='tab' role='tab' data-target={'#' + id}>{child.props.title}</a>
        </li>
    })
    
    return <React.Fragment>
        <ul className='nav nav-tabs nav-justified' role='tablist' ref={this.tabs}>
          {headings}
        </ul>
        <div className='tab-content' style={{'paddingTop': '10px'}}>
          {children}
        </div>
      </React.Fragment>
	}
}

export class Tab extends Component{
  render(){
    return <div className="tab-pane fade" id={this.props.id}>
      {this.props.children}
    </div>
  }
}