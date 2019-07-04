import React, {Component} from 'react';
import { Link,Route } from "react-router-dom";
import AnimatedSwitch from './animated-switch';
import * as $ from 'jquery/dist/jquery.slim';
import axios from 'axios';
import NameSearchInput from './NameSearchInput';
import ConfirmAction from './ConfirmAction';
import Pagination from './Pagination';

export default class Payment extends Component {
	render() {
		return <div>
			<AnimatedSwitch>
				<Route exact path={`${this.props.match.path}`} component={PaymentList} />
				<Route path={`${this.props.match.path}/new`} component={PaymentForm} />
			</AnimatedSwitch>
		</div>
	}
}

class PaymentList extends Component {
	dialog = React.createRef();
	methodChoices = {'CA': 'CASH', 'BK': 'BANK', 'MP': 'MPESA'}
	constructor(props){
		super(props);

		this.years = Array.from(new Array(20), (v,i)=>2015+i)
		this.months = ['January','February','March','April','May',
			'June','July','August','Septempber','October','November','December']

		let date = new Date();
		let year = date.getFullYear();
		let month = date.getMonth() + 1;
		this.state = {payments: {results: []},filter: {year,month,search:''}}
	}

	handleFilterChange(field,event){
		let filter = {...this.state.filter,page: 1};
		filter[field] = event.target.value;
		this.setState({filter});
		this.updatePayments(filter);
	}

	componentDidMount() {
		axios.get('/api/payments/',{params: this.state.filter}).then(res=>this.setState({payments: res.data}))
	}

	updatePayments(filter={},page=1){
		axios.get('/api/payments/',{params: filter}).then(res=>this.setState({payments: res.data}))
	}

	showDialog() {
		this.dialog.current.show();
	}

	paymentAdded(payment){
		let p = this.state.payments.splice(0);
		p.push(payment);
		this.setState({payments: p});
	}

	gotoPage(page){
		let params = {...this.state.filter,page}
		this.updatePayments(params);
	}

	render() {
		return (
			<div>
				<h1 className='text-center'>Receipt</h1>
				<div className="row">
					<Link to={`${this.props.match.url}/new`} className="btn btn-success col-sm-2 col-sm-offset-5">Record Payment <i className='glyphicon glyphicon-plus'></i></Link>
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
				      <input value={this.state.filter.search} onChange={this.handleFilterChange.bind(this,'search')} type="text" className="form-control" id="inputSearch" placeholder="Search" />
				    </div>
					</div>
				</form>
				<table className="table table-striped table-responsive">
					<thead>
						<tr>
							<td>First name</td>
							<td>Middle name</td>
							<td>Last name</td>
							<td>Amount</td>
							<td>Method</td>
							<td>Period</td>
						</tr>
					</thead>
					<tbody>
						{this.state.payments.results.map(payment=>(
							<tr key={payment.id}>
								<td>{payment.first_name}</td>
								<td>{payment.middle_name}</td>
								<td>{payment.last_name}</td>
								<td>{payment.amount}</td>
								<td>{this.methodChoices[payment.method]}</td>
								<td>{payment.period}</td>
							</tr>
							))}
					</tbody>
				</table>
				<Pagination goto={this.gotoPage.bind(this)} data={this.state.payments} />
			</div>
		);
	}
}

class PaymentForm extends Component {
	confirm = React.createRef();
	emptyData = {method: 'CA',amount: '', member: '', ref_no: '',
		phone_no: '', date: '',bank_name: ''}
	state = {data: {...this.emptyData},error: {},saved: false,member: {}};

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
			if(!data.phone_no)
				error['phone_no'] = 'This field is required';
			if(!data.ref_no)
				error['ref_no'] = 'This field is required';
			if(!data.date)
				error['date'] = 'This field is required';
		}

		if(data.method == 'BK'){
			if(!data.bank_name)
				error['bank_name'] = 'This field is required';
			if(!data.ref_no)
				error['ref_no'] = 'This field is required';
			if(!data.date)
				error['date'] = 'This field is required';
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
			let data = {...this.state.data}
			data['amount'] = parseFloat(data.amount);
			return axios.post('/api/payments/',data).then(_=>{},error=>{
				console.log(error.response.data);
				this.setState({error: error.response.data});
				return Promise.reject(error.response.data);
			})
		})
	}

	save() {
		this.submit().then(()=>this.props.history.push('/home/receipt'));
	}

	saveContinue() {
		this.submit().then(()=>this.setState({data: {...this.emptyData},error: {},saved: true,member: {}}))
		setTimeout(_=>this.setState({saved: false}),2000);
	}

	close() {
		this.props.history.push('/home/receipt')
	}

	render() {
		let error = this.state.error;
		return <div>
			<h1 className='text-center'>New Receipt</h1>
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
				      <NameSearchInput member={this.state.member} userSelected={this.userSelected.bind(this)}/>
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
				  	<div className={`form-group col-sm-6 ${error.phone_no ? 'has-error': ''}`}>
							<label className="col-sm-3 control-label">Phone Number</label>
							<div className="col-sm-9">
					      <input value={this.state.data.phone_no} onChange={this.handleInput.bind(this,'phone_no')} type="text" className="form-control" />
					    </div>
					  </div>
					  <div className={`form-group col-sm-6 ${error.ref_no ? 'has-error': ''}`}>
							<label className="col-sm-3 control-label">Referrence Number</label>
							<div className="col-sm-9">
					      <input value={this.state.data.ref_no} onChange={this.handleInput.bind(this,'ref_no')} type="text" className="form-control" />
					    </div>
					  </div>
					  <div className={`form-group col-sm-6 ${error.date ? 'has-error': ''}`}>
							<label className="col-sm-3 control-label">Date</label>
							<div className="col-sm-9">
					      <input value={this.state.data.date} onChange={this.handleInput.bind(this,'date')} type="text" placeholder="dd/mm/year" className="form-control" />
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
					  <div className={`form-group col-sm-6 ${error.date ? 'has-error': ''}`}>
							<label className="col-sm-3 control-label">Date</label>
							<div className="col-sm-9">
					      <input value={this.state.data.date} onChange={this.handleInput.bind(this,'date')} type="text" placeholder="dd/mm/year" className="form-control" />
					    </div>
					  </div>
				  </>}

				  <div className="clearfix" />

      	<hr/>

      	<div className="form-group">
          <div className="col-sm-offset-4 col-sm-2">
            <input onClick={this.save.bind(this)} type="button" value="SAVE" className="btn btn-success" />
          </div>
          <div className="col-sm-4">
            <input onClick={this.saveContinue.bind(this)} type="button" value="SAVE AND CONTINUE" className="btn btn-primary" />
          </div>
          <div className="col-sm-2">
            <input onClick={this.close.bind(this)} type="button" value="CLOSE" className="btn btn-warning" />
          </div>
        </div>
      </form>
		</div>
	}
}