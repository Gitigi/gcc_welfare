import React, {Component} from 'react'
import ReactDOM from 'react-dom'
import * as $ from 'jquery/dist/jquery.slim'

export default class Modal extends Component{
  modalRef = React.createRef();
  modal = null;
  
  constructor(props){
    super(props);
    this.container = document.createElement('div');
  }
  
  componentDidMount(){
    document.body.appendChild(this.container);
    
    this.modal = $(this.modalRef.current);
    
    this.modal.modal({show: !!this.props.show,
      backdrop: (this.props.backdrop ? 'true' : 'static')
    });
    
    this.modal.on('show.bs.modal shown.bs.modal hide.bs.modal hidden.bs.modal',this.props.handleEvent)
  }
  
  componentWillUnmount(){
    document.body.removeChild(this.container);
  }
  
  componentDidUpdate(prevProps,prevState,snapshot){
    this.modal.modal({show: !!this.props.show});
    this.modal.data('bs.modal').options.backdrop = this.props.backdrop ? 'true' : 'static';
  }
  
  show(){
    this.modal.modal('show');
  }
  
  hide(){
    this.modal.modal('hide');
  }
  
  render(){
    return ReactDOM.createPortal(<div ref={this.modalRef} className='modal fade' role="dialog"
        style={{zIndex: this.props.zIndex}}>
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <button type="button" className="close" data-dismiss="modal">
                &times;
              </button>
              <h2 className="modal-title">{this.props.title}</h2>
            </div>
            <div className="modal-body">
              {this.loading && <h1 ng-if='$ctrl.loading'>Loading...</h1>}
              {this.props.children}
            </div>
            <div className="modal-footer">
              <button type="button" className={`btn btn-primary ${this.props.yesClass}`}
                onClick={this.props.yes} >{this.props.yesLabel || "Yes"}</button>
              <button type="button" data-dismiss="modal" className={`btn btn-default ${this.props.noClass}`}
								onClick={this.props.no}>{this.props.noLabel || "No"}</button>
						</div>
					</div>
				</div>
			</div>,this.container)
	}
}