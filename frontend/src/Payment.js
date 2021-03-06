import React, {Component} from 'react';
import { Link,Route } from "react-router-dom";
import AnimatedSwitch from './animated-switch';
import * as $ from 'jquery';
import axios from 'axios';
import NameSearchInput from './NameSearchInput';
import ConfirmAction from './ConfirmAction';
import Pagination from './Pagination';
import DateInput from './DateInput';
import lodash from 'lodash';

export default class Payment extends Component {
	render() {
		return <div>
			<AnimatedSwitch>
				<Route exact path={`${this.props.match.path}`} component={PaymentList} />
				<Route path={`${this.props.match.path}/new`} component={NewPayment} />
				<Route path={`${this.props.match.path}/:id`} component={EditPayment} />
			</AnimatedSwitch>
		</div>
	}
}

class PaymentList extends Component {
	methodChoices = {'CA': 'CASH', 'BK': 'BANK', 'MP': 'MPESA'}
	constructor(props){
		super(props);

		this.years = Array.from(new Array(20), (v,i)=>2016+i)
		this.months = ['January','February','March','April','May',
			'June','July','August','Septempber','October','November','December']

		let date = new Date();
		let year = date.getFullYear();
		let month = date.getMonth() + 1;
		this.state = {error:{},loading: false,payments: {results: []},filter: {year,month,search:''},_search: ''}
	}

	handleFilterChange(field,event){
		let filter = {...this.state.filter,page: 1};
		filter[field] = event.target.value;
		this.setState({filter});
		this.updatePayments(filter);
	}

	timeout = null
	handleNameChange(e) {
		let value = e.target.value;
		this.setState({_search: value});
		clearTimeout(this.timeout);
		this.timeout = setTimeout(()=>{
			let filter = {...this.state.filter,page:1};
			filter['search'] = value;
			this.setState({filter});
			this.updatePayments(filter);
		},500)
	}

	componentDidMount() {
		this.updatePayments(this.state.filter);
	}

	updatePayments(filter={}){
		this.setState({loading: true});
		axios.get('/api/payments/',{params: filter}).then(res=>this.setState({payments: res.data}),error=>this.setState({error:error.response.data})).finally(_=>this.setState({loading:false}))
	}

	gotoPage(page){
		let params = {...this.state.filter,page}
		this.updatePayments(params);
	}

	formatDate(date){
		date = date.split('.')[0]
		date = date.split('T');
		date[0] = date[0].split('-').reverse().join('/')
		return date.join(' ')
	}

	render() {
		return (
			<div>
				<div className={`alert alert-danger alert-dismissible ${this.state.error.detail ? 'show' : 'hide'}`} role="alert">
          <a href="#" className="close" data-dismiss="alert" aria-label="close">&times;</a>
          {this.state.error.detail}
        </div>
				<h1 className='text-center'>Receipt <i className={`fa fa-circle-o-notch fa-spin fa-fw ${this.state.loading ? '' : 'fade'}`}></i></h1>
				<div className="row">
					<Link to={`${this.props.match.url}/new`} className="btn btn-success col-sm-3 col-sm-offset-4">Record Receipt <i className='glyphicon glyphicon-plus'></i></Link>
				</div>
				<form>
					<div className="form-group">
						<div className="col-sm-4">
				      <select value={this.state.filter.year} onChange={this.handleFilterChange.bind(this,'year')} className="form-control">
				      	<option value=''>ALL</option>
				      	{this.years.map( v => <option key={v} value={v}>{v}</option> )}
				      </select>
				    </div>
				    <div className="col-sm-4">
				      <select value={this.state.filter.month} onChange={this.handleFilterChange.bind(this,'month')} className="form-control">
				      	<option value=''>ALL</option>
				      	{this.months.map( (m,index) => <option key={m} value={index+1}>{m}</option> )}
				      </select>
				    </div>
				    <div className="col-sm-4">
				      <input value={this.state._search} onChange={this.handleNameChange.bind(this)} type="text" className="form-control" id="inputSearch" placeholder="Search" />
				    </div>
					</div>
				</form>
				<table className="table table-striped table-responsive">
					<thead>
						<tr>
							<th>First name</th>
							<th>Middle name</th>
							<th>Last name</th>
							<th>Amount</th>
							<th>Method</th>
							<th>Mobile Number</th>
							<th>Bank Name</th>
							<th>Reference No</th>
							<th>Date</th>
						</tr>
					</thead>
					<tbody>
						{this.state.payments.results.map(payment=>(
							<tr key={payment.id}>
								<td><Link to={`${this.props.match.path}/${payment.id}`}>{payment.first_name}</Link></td>
								<td>{payment.middle_name}</td>
								<td>{payment.last_name}</td>
								<td>{payment.amount}</td>
								<td>{this.methodChoices[payment.method]}</td>
								<td>{payment.mobile_no}</td>
								<td>{payment.bank_name}</td>
								<td>{payment.ref_no}</td>
								<td>{this.formatDate(payment.date)}</td>
							</tr>
							))}
					</tbody>
				</table>
				<Pagination goto={this.gotoPage.bind(this)} data={this.state.payments} />
			</div>
		);
	}
}

class NewPayment extends Component {
	state = {error: {}}
	submit(data) {
		return axios.post(`/api/payments/`,data).then(res=>{
			this.setState({error: {}});
			return res;
		},error=>{
			this.setState({error: error.response.data})
			return Promise.reject(error);
		})
	}

	close() {
		this.props.history.push('/home/receipt')
	}

	render() {
		return <div>
				<h1 className='text-center'>New Receipt</h1>
				<PaymentForm error={this.state.error} submit={this.submit.bind(this)} close={this.close.bind(this)} />
			</div>
	}
}

class EditPayment extends Component {
	state = {data: {}, error: {}}
	componentDidMount(){
		axios.get(`/api/payments/${this.props.match.params.id}/`).then(res=>this.setState({data: res.data}),
			error=>this.setState({error: error.response.data}))
	}

	submit(data) {
		return axios.put(`/api/payments/${this.props.match.params.id}/`,data).then(res=>{
			this.setState({data: res.data,error: {}});
			return res;
		},error=>{
			this.setState({error: error.response.data})
			return Promise.reject(error);
		})
	}

	close() {
		this.props.history.push('/home/receipt')
	}

	render() {
		return <div>
				<h1 className='text-center'>Edit Payment</h1>
				<PaymentForm edit={true} data={this.state.data} error={this.state.error} submit={this.submit.bind(this)} close={this.close.bind(this)} />
			</div>
	}
}

class PaymentForm extends Component {
	confirm = React.createRef();
	emptyData = {method: 'CA',amount: '', member: '', ref_no: '',
		mobile_no: '', date_of_payment: null,bank_name: '',start_period: null}
	state = {loading:false,data: {...this.emptyData},error: {},saved: false,member: {},advanced: false};

	componentDidUpdate(prevProps,prevState) {
		if(this.props.edit){
			if(!lodash.isEqual(this.props.data, prevProps.data)){
				this.setState({data: {...this.state.data,...this.props.data}})
			}
		}
		if(!lodash.isEqual(this.props.error,prevProps.error)){
			this.setState({error: {...this.state.error,...this.props.error}})
		}
	}

	handleInput(field,e) {
		let value = e.target.value;
		this.setState(state=>(state.data[field]=value,state));
	}

	userSelected(user) {
		this.setState(state=>(state.data.member=user.id,state.member=user,state));
	}
	show() {
		$(this.modal.current).modal('show');
	}

	validate(data) {
		let error = {}
		if(!data.member)
			error['member'] = 'This field is required';
		if(!data.amount || parseInt(data.amount) <= 0)
			error['amount'] = 'This field is required';
		if(!data.method)
			error['method'] = 'This field is required';

		if(data.method == 'MP'){
			if(!data.mobile_no)
				error['mobile_no'] = 'This field is required';
			if(!data.ref_no)
				error['ref_no'] = 'This field is required';
			if(!data.date_of_payment)
				error['date_of_payment'] = 'This field is required';
		}

		if(data.method == 'BK'){
			if(!data.bank_name)
				error['bank_name'] = 'This field is required';
			if(!data.ref_no)
				error['ref_no'] = 'This field is required';
			if(!data.date_of_payment)
				error['date_of_payment'] = 'This field is required';
		}

		return error;
	}

	submit() {
    let error = this.validate(this.state.data);
    if(Object.keys(error).length){
      this.setState({error});
      return Promise.reject()
    }
    
		return this.confirm.current.show().then(_=>{
			this.setState({loading:true});
			let data = this.state.data;
			let payload = {member: data.member,amount:parseFloat(data.amount),method:data.method, start_period: data.start_period};
			if(data.method == 'BK'){
				payload['bank_name'] = data.bank_name;
				payload['ref_no'] = data.ref_no;
				payload['date_of_payment'] = data.date_of_payment;
			}
			else if(data.method == 'MP'){
				payload['mobile_no'] = data.mobile_no;
				payload['ref_no'] = data.ref_no;
				payload['date_of_payment'] = data.date_of_payment;
			}
			return this.props.submit(payload).then(_=>{},error=>{
				window.scrollTo(0,0);
				this.setState({error: error.response.data});
				return Promise.reject(error.response.data);
			}).finally(_=>this.setState({loading:false}))
		})
	}

	save() {
		this.submit().then(()=>this.props.close());
	}

	saveContinue() {
		this.submit().then(()=>{
			this.setState({data: {...this.emptyData},error: {},saved: true,member: {}});
			setTimeout(_=>this.setState({saved: false}),2000);
		})
	}

	apply() {
		this.submit().then(()=>{
			this.setState({error: {},saved: true})
			setTimeout(_=>this.setState({saved: false}),2000);
		})
	}

	toggleAdvanced(e) {
		e.target.classList.toggle("fa-plus");
		e.target.classList.toggle("fa-minus");
		let expanded = this.state.advanced ? false : true;
		this.setState({advanced: expanded});
	}


	render() {
		let error = this.state.error;
		return <div>
			<div className={`alert alert-danger alert-dismissible ${this.state.error.detail ? 'show' : 'hide'}`} role="alert">
        <a href="#" className="close" data-dismiss="alert" aria-label="close">&times;</a>
        {this.state.error.detail}
      </div>
			<div className={`alert alert-success ${this.state.saved ? 'show' : 'hide'}`} role="alert">
				Successfully Saved Payment Record
			</div>
			<ConfirmAction ref={this.confirm} yesLabel="Save" noLabel="Cancel" title="Saving">
				<p>Do you want to save changes</p>
			</ConfirmAction>
			<form className="form-horizontal">

				<div className={`form-group col-sm-6 ${error.member ? 'has-error': ''}`}>
			    <label className="col-sm-3 control-label">Name</label>
					<div className="col-sm-9">
				      <NameSearchInput member={this.state.member} memberId={this.state.data.member} userSelected={this.userSelected.bind(this)}/>
			    </div>
				</div>

				<div className={`form-group col-sm-6 ${error.amount ? 'has-error': ''}`}>
					<label className="col-sm-3 control-label">Amount</label>
			    <div className="col-sm-9">
			      <input value={this.state.data.amount} onChange={this.handleInput.bind(this,'amount')} type="text" className="form-control" />
			    </div>
			  </div>
			  <div className={`form-group col-sm-6 ${error.method ? 'has-error': ''}`}>
			    <label className="col-sm-3 control-label">Method</label>
			    <div className="col-sm-9">
			      <select onChange={this.handleInput.bind(this,'method')} value={this.state.data.method} id="inputMethod" className="form-control">
		        	<option value="CA">Cash</option>
		        	<option value="MP">Mpesa</option>
		        	<option value="BK">Bank</option>
		        </select>
			    </div>
				</div>


				  {this.state.data.method === "MP" && <>
				  	<div className={`form-group col-sm-6 ${error.mobile_no ? 'has-error': ''}`}>
							<label className="col-sm-3 control-label">Phone Number</label>
							<div className="col-sm-9">
					      <input value={this.state.data.mobile_no} onChange={this.handleInput.bind(this,'mobile_no')} type="text" className="form-control" />
					    </div>
					  </div>
					  <div className={`form-group col-sm-6 ${error.ref_no ? 'has-error': ''}`}>
							<label className="col-sm-3 control-label">Referrence Number</label>
							<div className="col-sm-9">
					      <input value={this.state.data.ref_no} onChange={this.handleInput.bind(this,'ref_no')} type="text" className="form-control" />
					    </div>
					  </div>
					  <div className={`form-group col-sm-6 ${error.date_of_payment ? 'has-error': ''}`}>
							<label className="col-sm-3 control-label">Date</label>
							<div className="col-sm-9">
					      <DateInput value={this.state.data.date_of_payment} onChange={this.handleInput.bind(this,'date_of_payment')} type="text" placeholder="dd/mm/year" className="form-control" />
					    </div>
					  </div>
				  </>}

				  {this.state.data.method === "BK" && <>
				  	<div className={`form-group col-sm-6 ${error.bank_name ? 'has-error': ''}`}>
							<label className="col-sm-3 control-label">Bank Name</label>
							<div className="col-sm-9">
					      <input value={this.state.data.bank_name} onChange={this.handleInput.bind(this,'bank_name')} type="text" className="form-control" />
					    </div>
					  </div>
					  <div className={`form-group col-sm-6 ${error.ref_no ? 'has-error': ''}`}>
							<label className="col-sm-3 control-label">Referrence/Cheque</label>
							<div className="col-sm-9">
					      <input value={this.state.data.ref_no} onChange={this.handleInput.bind(this,'ref_no')} type="text" className="form-control" />
					    </div>
					  </div>
					  <div className={`form-group col-sm-6 ${error.date_of_payment ? 'has-error': ''}`}>
							<label className="col-sm-3 control-label">Date</label>
							<div className="col-sm-9">
					      <DateInput value={this.state.data.date_of_payment} onChange={this.handleInput.bind(this,'date_of_payment')} type="text" placeholder="dd/mm/year" className="form-control" />
					    </div>
					  </div>
				  </>}

				  <div className="clearfix" />
				  <fieldset>
						<legend><i onClick={this.toggleAdvanced.bind(this)} className={`fa fa-${this.state.advanced ? "minus": "plus"}`} /> Advanced Settings</legend>
						<div className={`${!this.state.advanced ? "hide": ""}`}>
						  <div className={`form-group col-sm-6 ${error.start_period ? 'has-error': ''}`}>
						  	<label className="col-sm-6 control-label">Set start period of payment (optional)</label>
						  	<div className="col-sm-6">
							      <DateInput value={this.state.data.start_period} onChange={this.handleInput.bind(this,'start_period')} type="text" placeholder="dd/mm/year" className="form-control" />
							    </div>
						  </div>
					  </div>
				  </fieldset>

				  <div className="clearfix" />

      	<hr/>

        <div className="form-group">
      		{this.props.edit ? <div className="col-sm-offset-6 col-sm-2">
            <input onClick={this.apply.bind(this)} type="button" value="APPLY" disabled={this.state.loading?true:false} className="btn btn-primary" />
          </div> : <div className="col-sm-offset-5 col-sm-3">
            <input onClick={this.saveContinue.bind(this)} type="button" value="SAVE AND CONTINUE" disabled={this.state.loading?true:false} className="btn btn-primary" />
          </div>}
          <div className="col-sm-2">
            <input onClick={this.save.bind(this)} type="button" value="SAVE" disabled={this.state.loading?true:false} className="btn btn-success" />
          </div>
          <div className="col-sm-2">
            <input onClick={this.props.close} type="button" value="CLOSE" disabled={this.state.loading?true:false} className="btn btn-warning" />
          </div>
        </div>
      </form>
		</div>
	}
}