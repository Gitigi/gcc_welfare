import React, {Component} from 'react';
import { Link,Route } from "react-router-dom";
import AnimatedSwitch from './animated-switch';
import ReactDOM from 'react-dom'
import * as $ from 'jquery/dist/jquery.slim';
import axios from 'axios';
import ConfirmAction from './ConfirmAction';


export default class Banking extends Component {
	render() {
		return <div>
			<AnimatedSwitch>
				<Route exact path={`${this.props.match.path}`} component={BankingList} />
				<Route path={`${this.props.match.path}/new`} component={BankingForm} />
			</AnimatedSwitch>
		</div>
	}
}


class BankingList extends Component {
	dialog = React.createRef();
	methodChoices = {'CA': 'CASH', 'BK': 'BANK', 'MP': 'MPESA'}
	constructor(props){
		super(props);

		this.years = Array.from(new Array(50), (v,i)=>2000+i)
		this.months = ['January','February','March','April','May',
			'June','July','August','Septempber','October','November','December']

		let date = new Date();
		let year = date.getFullYear();
		let month = date.getMonth() + 1;
		this.state = {banking: [],filter: {year,month,search:''}}
	}

	handleFilterChange(field,event){
		let filter = {...this.state.filter};
		filter[field] = event.target.value;
		this.setState({filter});
		this.updateBanking(filter);
	}

	componentDidMount() {
		axios.get('/api/banking/',{params: this.state.filter}).then(res=>this.setState({banking: res.data}))
	}

	updateBanking(filter={}){
		axios.get('/api/banking/',{params: filter}).then(res=>this.setState({banking: res.data}))
	}

	showDialog() {
		this.dialog.current.show();
	}

	bankingAdded(banking){
		let b = this.state.banking.splice(0);
		b.push(banking);
		this.setState({banking: b});
	}
	render() {
		return (
			<div>
				<h1 className='text-center'>Banking</h1>
				<div className="row">
					<Link to={`${this.props.match.url}/new`} className="btn btn-success col-sm-2 col-sm-offset-5">Record Bank Transaction</Link>
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
							<td>Bank Name</td>
							<td>Account</td>
							<td>Amount</td>
							<td>Banked By</td>
							<td>Date</td>
						</tr>
					</thead>
					<tbody>
						{this.state.banking.map(b=>(
							<tr key={b.id}>
								<td>{b.bank_name}</td>
								<td>{b.account}</td>
								<td>{b.amount}</td>
								<td>{b.banked_by}</td>
								<td>{b.date}</td>
							</tr>
							))}
					</tbody>
				</table>
			</div>
		);
	}
}

class BankingForm extends Component {
	confirm = React.createRef();
	emptyData = {bank_name: '',amount: 0, account: '', date: '',banked_by: ''}
	state = {data: {...this.emptyData},error: {},saved: false};
	handleChange(field,e) {
		let value = e.target.value;
		this.setState(state=>(state.data[field]=value,state));
	}

	handleInput(field,e) {
		let value = e.target.value;
		this.setState(state=>(state.data[field]=value,state));
	}

	submit() {
		return this.confirm.current.show().then(_=>{
			let data = this.state.data;
			data.date = data.date.split('/').reverse().join('-');
			return axios.post('/api/banking/',data).then(_=>{},error=>{
				console.log(error.response.data);
				this.setState({error: error.response.data});
				return Promise.reject(error.response.data);
			})
		})
	}

	save() {
		this.submit().then(res=>this.props.history.push('/home/banking'));
	}

	saveContinue() {
		this.submit().then(()=>this.setState({data: {...this.emptyData},error: {},saved: true}))
		setTimeout(_=>this.setState({saved: false}),2000);
	}

	close() {
		this.props.history.push('/home/banking')
	}

	render() {
		let error = this.state.error;
		return <div>
			<h1 className='text-center'>New Bank Transaction</h1>
			<div className={`alert alert-success ${this.state.saved ? 'show' : 'hide'}`} role="alert">
				Successfully Saved Payment Record
			</div>
			<ConfirmAction ref={this.confirm} yesLabel="Save" noLabel="Cancel" title="Saving">
				<p>Do you want to save changes</p>
			</ConfirmAction>
			<form className="form-horizontal">

				<div className={`form-group col-sm-6 ${error.bank_name ? 'has-error': ''}`}>
			    <label className="col-sm-3 control-label">Bank Name</label>
					<div className="col-sm-9">
				      <input value={this.state.data.bank_name} onChange={this.handleInput.bind(this,'bank_name')} type="text" className="form-control" />
			    </div>
				</div>

				<div className={`form-group col-sm-6 ${error.amount ? 'has-error': ''}`}>
					<label className="col-sm-3 control-label">Amount</label>
			    <div className="col-sm-9">
			      <input value={this.state.data.amount} onChange={this.handleInput.bind(this,'amount')} type="text" className="form-control" />
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

			  <div className={`form-group col-sm-6 ${error.banked_by ? 'has-error': ''}`}>
					<label className="col-sm-3 control-label">Banked By</label>
			    <div className="col-sm-9">
			      <input value={this.state.data.banked_by} onChange={this.handleInput.bind(this,'banked_by')} type="text" className="form-control" />
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