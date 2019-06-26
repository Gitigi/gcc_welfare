import React, {Component} from 'react';
import ReactDOM from 'react-dom'
import * as $ from 'jquery/dist/jquery.slim';


export default class ConfirmAction extends Component {
	modal = React.createRef();
	componentDidMount(){
		$(this.modal.current).on('hide.bs.modal',()=>{
			if(this.reject)
				this.reject();
		})
	}
	show() {
		$(this.modal.current).modal('show');
		return new Promise((resolve,reject)=>{
			this.resolve = resolve;
			this.reject = reject;
		})
	}
	hide(){
    $(this.modal.current).modal('hide');
  }

  yes(){
  	if(this.resolve)
  		this.resolve();
  	$(this.modal.current).modal('hide');
  }
	render() {
		return ReactDOM.createPortal(<div ref={this.modal} className = "modal fade" id = "updateModal" tabIndex = "-1" role = "dialog" 
		    aria-labelledby = "myModalLabel" aria-hidden = "true" data-backdrop='static'>
		   
		    <div className = "modal-dialog">
		      <div className = "modal-content">
		         
		         <div className = "modal-header">
		            <button type = "button" className = "close" data-dismiss = "modal" aria-hidden = "true">
		                  &times;
		            </button>
		            
		            <h4 className = "modal-title" id = "myModalLabel">
		               {this.props.title}
		            </h4>
		         </div>
		         
		         <div className = "modal-body">
		            
		    
		        	{this.props.children}


		         </div>

		         <div className="modal-footer">
              <button type="button" className={`btn btn-primary ${this.props.yesClass}`}
                onClick={this.yes.bind(this)} >{this.props.yesLabel || "Yes"}</button>
              <button type="button" data-dismiss="modal" className={`btn btn-default ${this.props.noClass}`}
								onClick={this.hide.bind(this)}>{this.props.noLabel || "No"}</button>
						</div>
		         
		      </div>
		   	</div>
			</div>,document.body);
	}
}