import React, {Component} from 'react';
// import 'eonasdan-bootstrap-datetimepicker'
// import 'eonasdan-bootstrap-datetimepicker/build/css/bootstrap-datetimepicker.min.css';
import 'bootstrap-datepicker'
import 'bootstrap-datepicker/dist/css/bootstrap-datepicker.min.css';
import jquery from 'jquery';

export default class DateInput extends Component {
	state = {date: ''}
	dateInput = React.createRef()
	hiddenInput = React.createRef()
	componentDidMount(){
		var self = this;
		jquery(this.dateInput.current).datepicker({format: 'dd/mm/yyyy'}).on('changeDate changeMonth changeYear',e=>self.handleChange(e))
		this.dateInput.current.value = this.props.value ? this.props.value.split('-').reverse().join('/') : '';
	}
	componentDidUpdate(prevProp,prevState){
		if(prevProp.value !== this.props.value){
			let val = this.props.value ? this.props.value.split('-').reverse().join('/') : '';
			this.dateInput.current.value = val;
			if((new Date(this.props.value)).getDate())
				jquery(this.dateInput.current).datepicker('setDate',val);
		}
	}
	handleChange(e){
		let val = e.target.value.split('/').reverse().join('-');
		var nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
		nativeInputValueSetter.call(this.hiddenInput.current, val);

		var ev2 = new Event('input', { bubbles: true});
		this.hiddenInput.current.dispatchEvent(ev2);
	}
	render(){
		let props = {...this.props};
		delete props.value;
		return <>
			<input onChange={this.handleChange.bind(this)} {...props} type='text' ref={this.dateInput} />
			<input onChange={this.props.onChange} style={{display: 'none'}} ref={this.hiddenInput} value={this.state.date} />
		</>
	}
}