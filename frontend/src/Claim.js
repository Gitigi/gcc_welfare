import React, {Component} from 'react';
import { Link,Route } from "react-router-dom";
import AnimatedSwitch from './animated-switch';
import ReactDOM from 'react-dom'
import * as $ from 'jquery/dist/jquery.slim';
import axios from 'axios';
import ConfirmAction from './ConfirmAction';
import NameSearchInput from './NameSearchInput';
import Pagination from './Pagination';


export default class Claim extends Component {
	render() {
		return <div>
			<AnimatedSwitch>
				<Route exact path={`${this.props.match.path}`} component={ClaimList} />
				<Route path={`${this.props.match.path}/new`} component={ClaimForm} />
			</AnimatedSwitch>
		</div>
	}
}


class ClaimList extends Component {
	dialog = React.createRef();
	disbursementChoices = {'CA': 'CASH', 'CQ': 'CHEQUE'}
	constructor(props){
		super(props);

		this.years = Array.from(new Array(50), (v,i)=>2000+i)
		this.months = ['January','February','March','April','May',
			'June','July','August','Septempber','October','November','December']

		let date = new Date();
		let year = date.getFullYear();
		let month = date.getMonth() + 1;
		this.state = {claims: {results: []},filter: {year,month,search:''}}
	}

	handleFilterChange(field,event){
		let filter = {...this.state.filter};
		filter[field] = event.target.value;
		this.setState({filter});
		this.updateClaim(filter);
	}

	componentDidMount() {
		axios.get('/api/claim/',{params: this.state.filter}).then(res=>this.setState({claims: res.data}))
	}

	updateClaim(filter={}){
		axios.get('/api/claim/',{params: filter}).then(res=>this.setState({claims: res.data}))
	}

	showDialog() {
		this.dialog.current.show();
	}

	bankingAdded(banking){
		let b = this.state.banking.splice(0);
		b.push(banking);
		this.setState({banking: b});
	}

	gotoPage(page) {
		let params = {...this.state.filter,page}
		this.updateClaim(params);
	}

	render() {
		return (
			<div>
				<h1 className='text-center'>Claims</h1>
				<div className="row">
					<Link to={`${this.props.match.url}/new`} className="btn btn-success col-sm-2 col-sm-offset-5">Record Claim</Link>
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
							<td>First Name</td>
							<td>Middle Name</td>
							<td>Last Name</td>
							<td>Bank Name</td>
							<td>Account</td>
							<td>Amount</td>
							<td>Disbursement</td>
							<td>Reason</td>
							<td>Date</td>
						</tr>
					</thead>
					<tbody>
						{this.state.claims.results.map(b=>(
							<tr key={b.id}>
								<td>{b.first_name}</td>
								<td>{b.last_name}</td>
								<td>{b.middle_name}</td>
								<td>{b.bank_name}</td>
								<td>{b.account}</td>
								<td>{b.amount}</td>
								<td>{this.disbursementChoices[b.disbursement]}</td>
								<td>{b.reason}</td>
								<td>{b.date}</td>
							</tr>
							))}
					</tbody>
				</table>
				<Pagination goto={this.gotoPage.bind(this)} data={this.state.claims} />
			</div>
		);
	}
}

class ClaimForm extends Component {
	confirm = React.createRef();
	emptyData = {bank_name: '',amount: '', account: '', date: '',disbursement: 'CA',reason: '',member: ''}
	state = {data: {...this.emptyData},error: {},saved: false,member: {}};
	handleChange(field,e) {
		let value = e.target.value;
		this.setState(state=>(state.data[field]=value,state));
	}

	handleInput(field,e) {
		let value = e.target.value;
		this.setState(state=>(state.data[field]=value,state));
	}

	memberSelected(member) {
		this.setState(state=>(state.data.member=member.id,state.member=member,state));
	}

	validate(data) {
		let error = {}
		if(!data.bank_name)
			error['bank_name'] = 'This field is required';
		if(!data.amount || parseInt(data.amount) <= 0)
			error['amount'] = 'This field is required';
		if(!data.account)
			error['account'] = 'This field is required';
		if(!data.date)
			error['date'] = 'This field is required';
		if(!data.disbursement)
			error['disbursement'] = 'This field is required';
		if(!data.member)
			error['member'] = 'This field is required';

		return error;
	}

	submit() {
		let error = this.validate(this.state.data);
    if(Object.keys(error).length){
      this.setState({error});
      return Promise.reject()
    }

		return this.confirm.current.show().then(_=>{
			let data = this.state.data;
			data.date = data.date.split('/').reverse().join('-');
			return axios.post('/api/claim/',data).then(_=>{},error=>{
				console.log(error.response.data);
				this.setState({error: error.response.data});
				return Promise.reject(error.response.data);
			})
		})
	}

	save() {
		this.submit().then(res=>this.props.history.push('/home/claim'));
	}

	saveContinue() {
		this.submit().then(()=>this.setState({data: {...this.emptyData},error: {},saved: true,member: {}}))
		setTimeout(_=>this.setState({saved: false}),2000);
	}

	close() {
		this.props.history.push('/home/claim')
	}

	render() {
		let error = this.state.error;
		return <div>
			<h1 className='text-center'>New Claim</h1>
			<div className={`alert alert-success ${this.state.saved ? 'show' : 'hide'}`} role="alert">
				Successfully Saved Payment Record
			</div>
			<ConfirmAction ref={this.confirm} yesLabel="Save" noLabel="Cancel" title="Saving">
				<p>Do you want to save changes</p>
			</ConfirmAction>
			<form className="form-horizontal">

				<div className={`form-group col-sm-6 ${error.member ? 'has-error': ''}`}>
			    <label className="col-sm-3 control-label">Member</label>
					<div className="col-sm-9">
				      <NameSearchInput member={this.state.member} userSelected={this.memberSelected.bind(this)}/>
			    </div>
				</div>

				<div className={`form-group col-sm-6 ${error.amount ? 'has-error': ''}`}>
					<label className="col-sm-3 control-label">Amount</label>
			    <div className="col-sm-9">
			      <input value={this.state.data.amount} onChange={this.handleInput.bind(this,'amount')} type="text" className="form-control" />
			    </div>
			  </div>

				<div className={`form-group col-sm-6 ${error.bank_name ? 'has-error': ''}`}>
			    <label className="col-sm-3 control-label">Bank Name</label>
					<div className="col-sm-9">
				      <input value={this.state.data.bank_name} onChange={this.handleInput.bind(this,'bank_name')} type="text" className="form-control" />
			    </div>
				</div>

				<div className={`form-group col-sm-6 ${error.account ? 'has-error': ''}`}>
					<label className="col-sm-3 control-label">Account</label>
			    <div className="col-sm-9">
			      <input value={this.state.data.account} onChange={this.handleInput.bind(this,'account')} type="text" className="form-control" />
			    </div>
			  </div>

			  <div className={`form-group col-sm-6 ${error.date ? 'has-error': ''}`}>
					<label className="col-sm-3 control-label">Deposit Date</label>
			    <div className="col-sm-9">
			      <input value={this.state.data.date} onChange={this.handleInput.bind(this,'date')} type="text" placeholder="dd/mm/year" className="form-control" />
			    </div>
			  </div>

			  <div className={`form-group col-sm-6 ${error.disbursement ? 'has-error': ''}`}>
			    <label className="col-sm-3 control-label">Mode of Disbursement</label>
			    <div className="col-sm-9">
			      <select onChange={this.handleInput.bind(this,'disbursement')} value={this.state.data.disbursement} id="inputMethod" className="form-control">
		        	<option value="CA">Cash</option>
		        	<option value="CQ">Cheque</option>
		        </select>
			    </div>
				</div>

			  <div className={`form-group col-sm-6 ${error.reason ? 'has-error': ''}`}>
					<label className="col-sm-3 control-label">Reason</label>
			    <div className="col-sm-9">
			      <textarea value={this.state.data.reason} onChange={this.handleInput.bind(this,'reason')} type="text" className="form-control" />
			    </div>
			  </div>

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
