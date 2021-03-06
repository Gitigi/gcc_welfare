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
import lodash from 'lodash';

export default class Claim extends Component {
	render() {
		return <div>
			<AnimatedSwitch>
				<Route exact path={`${this.props.match.path}`} component={ClaimList} />
				<Route path={`${this.props.match.path}/new`} component={NewClaim} />
				<Route path={`${this.props.match.path}/:id`} component={EditClaim} />
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
		let month = date.getMonth() + 1;
		this.state = {error:{},loading: false,claims: {results: []},filter: {year,month,search:''},_search: ''}
	}

	handleFilterChange(field,event){
		let filter = {...this.state.filter,page: 1};
		filter[field] = event.target.value;
		this.setState({filter});
		this.updateClaim(filter);
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
			this.updateClaim(filter);
		},500)
	}

	componentDidMount() {
		this.updateClaim(this.state.filter);
	}

	updateClaim(filter={}){
		this.setState({loading: true});
		axios.get('/api/claim/',{params: filter}).then(res=>this.setState({claims: res.data}),error=>this.setState({error:error.response.data})).finally(_=>this.setState({loading:false}))
	}

	gotoPage(page) {
		let params = {...this.state.filter,page}
		this.updateClaim(params);
	}

	getData() {
		return getPaginatedData('/api/claim/',this.state.filter).then(res=>{
			let rows = [['Name','Bank Name','Account', 'Amount','Disbursement','Reason','Date']];
			for(let i = 0; i < res.length; i++){
				rows.push([
					res[i].first_name + ' ' + res[i].middle_name + ' ' + res[i].last_name,
					res[i].bank_name,
					res[i].account,
					res[i].amount,
					this.disbursementChoices[res[i].disbursement],
					res[i].reason,
					res[i].date.split('-').reverse().join('/')
					])
			}
			let filename = 'Claims'
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
				<h1 className='text-center'>Claims <i className={`fa fa-circle-o-notch fa-spin fa-fw ${this.state.loading ? '' : 'fade'}`}></i></h1>
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
				      <input value={this.state.filter._search} onChange={this.handleNameChange.bind(this)} type="text" className="form-control" id="inputSearch" placeholder="Search" />
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
								<td><Link to={`${this.props.match.path}/${b.id}`}>{b.first_name}</Link></td>
								<td>{b.last_name}</td>
								<td>{b.middle_name}</td>
								<td>{b.bank_name}</td>
								<td>{b.account}</td>
								<td>{b.amount}</td>
								<td>{this.disbursementChoices[b.disbursement]}</td>
								<td>{b.reason}</td>
								<td>{b.date.split('-').reverse().join('/')}</td>
							</tr>
							))}
					</tbody>
				</table>
				<Pagination goto={this.gotoPage.bind(this)} data={this.state.claims} />
				<ExportButton data={this.getData.bind(this)}/>
			</div>
		);
	}
}



class NewClaim extends Component {
	state = {error: {}}
	submit(data) {
		return axios.post(`/api/claim/`,data).then(res=>{
			this.setState({error: {}});
			return res;
		},error=>{
			this.setState({error: error.response.data})
			return Promise.reject(error);
		})
	}

	close() {
		this.props.history.push('/home/claim')
	}

	render() {
		return <div>
				<h1 className='text-center'>New Claim</h1>
				<ClaimForm error={this.state.error} submit={this.submit.bind(this)} close={this.close.bind(this)} />
			</div>
	}
}

class EditClaim extends Component {
	state = {data: {}, error: {}}
	componentDidMount(){
		axios.get(`/api/claim/${this.props.match.params.id}/`).then(res=>this.setState({data: res.data}),
			error=>this.setState({error: error.response.data}))
	}

	submit(data) {
		return axios.put(`/api/claim/${this.props.match.params.id}/`,data).then(res=>{
			this.setState({data: res.data,error: {}});
			return res;
		},error=>{
			this.setState({error: error.response.data})
			return Promise.reject(error);
		})
	}

	close() {
		this.props.history.push('/home/claim')
	}

	render() {
		return <div>
				<h1 className='text-center'>Edit Claim</h1>
				<ClaimForm edit={true} data={this.state.data} error={this.state.error} submit={this.submit.bind(this)} close={this.close.bind(this)} />
			</div>
	}
}



class ClaimForm extends Component {
	confirm = React.createRef();
	emptyData = {bank_name: '',amount: '', account: '', date: '',disbursement: 'CA',reason: '',member: ''}
	state = {loading:false,data: {...this.emptyData},error: {},saved: false,member: {}};

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
			this.setState({loading:true});
			let data = this.state.data;
			return this.props.submit(data).then(_=>{},error=>{
				window.scrollTo(0,0);
				this.setState({error: error.response.data});
				return Promise.reject(error.response.data);
			}).finally(_=>this.setState({loading:false}))
		})
	}

	save() {
		this.submit().then(res=>this.props.close());
	}

	saveContinue() {
		this.submit().then(()=>{
			this.setState({data: {...this.emptyData},error: {},saved: true,member: {}})
			setTimeout(_=>this.setState({saved: false}),2000);
		})
	}

	apply() {
		this.submit().then(()=>{
			this.setState({error: {},saved: true})
			setTimeout(_=>this.setState({saved: false}),2000);
		})
	}

	render() {
		let error = this.state.error;
		return <div>
			<div className={`alert alert-danger alert-dismissible ${this.state.error.detail ? 'show' : 'hide'}`} role="alert">
        <a href="#" className="close" data-dismiss="alert" aria-label="close">&times;</a>
        {this.state.error.detail}
      </div>
			<div className={`alert alert-success ${this.state.saved ? 'show' : 'hide'}`} role="alert">
				Successfully Saved Claim Record
			</div>
			<ConfirmAction ref={this.confirm} yesLabel="Save" noLabel="Cancel" title="Saving">
				<p>Do you want to save changes</p>
			</ConfirmAction>
			<form className="form-horizontal">

				<div className={`form-group col-sm-6 ${error.member ? 'has-error': ''}`}>
			    <label className="col-sm-3 control-label">Member</label>
					<div className="col-sm-9">
				      <NameSearchInput member={this.state.member} memberId={this.state.data.member} userSelected={this.memberSelected.bind(this)}/>
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
					<label className="col-sm-3 control-label">Claim Date</label>
			    <div className="col-sm-9">
			      <DateInput value={this.state.data.date} onChange={this.handleInput.bind(this,'date')} type="text" placeholder="dd/mm/year" className="form-control" />
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
