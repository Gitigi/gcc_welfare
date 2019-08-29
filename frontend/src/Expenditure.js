import React, {Component} from 'react';
import { Link,Route } from "react-router-dom";
import AnimatedSwitch from './animated-switch';
import ReactDOM from 'react-dom'
import * as $ from 'jquery';
import axios from 'axios';
import ConfirmAction from './ConfirmAction';
import NameSearchInput from './NameSearchInput';
import Pagination from './Pagination';
import DateInput from './DateInput';
import ExportButton from './ExportButton';
import {getPaginatedData} from './utility';

export default class Expenditure extends Component {
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
	disbursementChoices = {'CA': 'CASH', 'CQ': 'CHEQUE'}
	constructor(props){
		super(props);

		this.years = Array.from(new Array(50), (v,i)=>2016+i)
		this.months = ['January','February','March','April','May',
			'June','July','August','Septempber','October','November','December']

		let date = new Date();
		let year = date.getFullYear();
		let month = '';
		this.state = {error:{},loading: false,expenditures: {results: []},filter: {year,month,search:''},_search: ''}
	}

	handleFilterChange(field,event){
		let filter = {...this.state.filter,page: 1};
		filter[field] = event.target.value;
		this.setState({filter});
		this.updateClaim(filter);
	}

	componentDidMount() {
		this.updateClaim(this.state.filter);
	}

	updateClaim(filter={}){
		this.setState({loading: true});
		axios.get('/api/expenditure/',{params: filter}).then(res=>this.setState({expenditures: res.data}),error=>this.setState({error:error.response.data})).finally(_=>this.setState({loading:false}))
	}

	gotoPage(page) {
		let params = {...this.state.filter,page}
		this.updateClaim(params);
	}

	getData() {
		return getPaginatedData('/api/expenditure/',this.state.filter).then(res=>{
			let rows = [['Name', 'Amount','Reason','Date']];
			for(let i = 0; i < res.length; i++){
				rows.push([
					res[i].name,
					res[i].amount,
					res[i].reason,
					res[i].date.split('-').reverse().join('/')
					])
			}
			let filename = 'Expenditures'
			if(this.state.filter.year)
				filename += ' ' + this.state.filter.year;
			if(this.state.filter.month)
				filename += '-' + this.months[this.state.filter.month-1]
			return {rows,filename};
		});
	}

	render() {
		return (
			<div>
				<div className={`alert alert-danger alert-dismissible ${this.state.error.detail ? 'show' : 'hide'}`} role="alert">
          <a href="#" className="close" data-dismiss="alert" aria-label="close">&times;</a>
          {this.state.error.detail}
        </div>
				<h1 className='text-center'>Expenditures <i className={`fa fa-circle-o-notch fa-spin fa-fw ${this.state.loading ? '' : 'fade'}`}></i></h1>
				<div className="row">
					<Link to={`${this.props.match.url}/new`} className="btn btn-success col-sm-2 col-sm-offset-5">Record Expenditure</Link>
				</div>
				<form>
					<div className="form-group">
						<div className="col-sm-offset-2 col-sm-4">
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
					</div>
				</form>
				<table className="table table-striped table-responsive">
					<thead>
						<tr>
							<td>Name</td>
							<td>Amount</td>
							<td>Reason</td>
							<td>Date</td>
						</tr>
					</thead>
					<tbody>
						{this.state.expenditures.results.map(b=>(
							<tr key={b.id}>
								<td>{b.name}</td>
								<td>{b.amount}</td>
								<td>{b.reason}</td>
								<td>{b.date.split('-').reverse().join('/')}</td>
							</tr>
							))}
					</tbody>
				</table>
				<Pagination goto={this.gotoPage.bind(this)} data={this.state.expenditures} />
				<ExportButton data={this.getData.bind(this)}/>
			</div>
		);
	}
}

class ClaimForm extends Component {
	confirm = React.createRef();
	emptyData = {name: '',amount: '', date: '', reason: ''}
	state = {loading:false,data: {...this.emptyData},error: {},saved: false,member: {}};

	handleInput(field,e) {
		let value = e.target.value;
		this.setState(state=>(state.data[field]=value,state));
	}

	validate(data) {
		let error = {}
		if(!data.name)
			error['name'] = 'This field is required';
		if(!data.amount || parseInt(data.amount) <= 0)
			error['amount'] = 'This field is required';
		if(!data.date)
			error['date'] = 'This field is required';
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
			return axios.post('/api/expenditure/',data).then(_=>{},error=>{
				window.scrollTo(0,0);
				this.setState({error: error.response.data});
				return Promise.reject(error.response.data);
			}).finally(_=>this.setState({loading:false}))
		})
	}

	save() {
		this.submit().then(res=>this.props.history.push('/home/expenditure'));
	}

	saveContinue() {
		this.submit().then(()=>{
			this.setState({data: {...this.emptyData},error: {},saved: true,member: {}})
			setTimeout(_=>this.setState({saved: false}),2000);
		})
	}

	close() {
		this.props.history.push('/home/expenditure')
	}

	render() {
		let error = this.state.error;
		return <div>
			<div className={`alert alert-danger alert-dismissible ${this.state.error.detail ? 'show' : 'hide'}`} role="alert">
        <a href="#" className="close" data-dismiss="alert" aria-label="close">&times;</a>
        {this.state.error.detail}
      </div>
			<h1 className='text-center'>New Claim</h1>
			<div className={`alert alert-success ${this.state.saved ? 'show' : 'hide'}`} role="alert">
				Successfully Saved Payment Record
			</div>
			<ConfirmAction ref={this.confirm} yesLabel="Save" noLabel="Cancel" title="Saving">
				<p>Do you want to save changes</p>
			</ConfirmAction>
			<form className="form-horizontal">

				<div className={`form-group col-sm-6 ${error.name ? 'has-error': ''}`}>
					<label className="col-sm-3 control-label">Name</label>
			    <div className="col-sm-9">
			      <input value={this.state.data.name} onChange={this.handleInput.bind(this,'name')} type="text" className="form-control" />
			    </div>
			  </div>

			  <div className={`form-group col-sm-6 ${error.amount ? 'has-error': ''}`}>
					<label className="col-sm-3 control-label">Amount</label>
			    <div className="col-sm-9">
			      <input value={this.state.data.amount} onChange={this.handleInput.bind(this,'amount')} type="text" className="form-control" />
			    </div>
			  </div>

			  <div className={`form-group col-sm-6 ${error.date ? 'has-error': ''}`}>
					<label className="col-sm-3 control-label">Date</label>
			    <div className="col-sm-9">
			      <DateInput value={this.state.data.date} onChange={this.handleInput.bind(this,'date')} type="text" placeholder="dd/mm/year" className="form-control" />
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
            <input onClick={this.save.bind(this)} type="button" value="SAVE" disabled={this.state.loading?true:false} className="btn btn-success" />
          </div>
          <div className="col-sm-4">
            <input onClick={this.saveContinue.bind(this)} type="button" value="SAVE AND CONTINUE" disabled={this.state.loading?true:false} className="btn btn-primary" />
          </div>
          <div className="col-sm-2">
            <input onClick={this.close.bind(this)} type="button" value="CLOSE" disabled={this.state.loading?true:false} className="btn btn-warning" />
          </div>
        </div>
      </form>
		</div>
	}
}
