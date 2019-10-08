import React, {Component} from 'react';
import { Link,Route } from "react-router-dom";
import AnimatedSwitch from './animated-switch';
import NavLink from './navlink';
import axios from 'axios';
import Pagination from './Pagination';
import ExportButton from './ExportButton';
import {getPaginatedData} from './utility';

import PersonalNotes from './PersonalNotes';
import PersonalDetailsForm from './PersonalDetailsForm';

import './Member.css';

export default class Member extends Component {
	render() {
		return (
			<AnimatedSwitch>
				<Route exact path={`${this.props.match.path}`} component={MemberList} />
				<Route path={`${this.props.match.path}/new`} component={NewMember} />
				<Route path={`${this.props.match.path}/:id`} component={EditMember} />
			</AnimatedSwitch>
			);
	}
}


class MemberList extends Component {
	constructor(props){
		super(props);
		let status = this.props.location.state && this.props.location.state.status;
		let search = this.props.location.state && this.props.location.state.search;
		let page = this.props.location.state && this.props.location.state.page;

		this.state = {error:{},loading: false, members: {results:[]}, status: status||'active', search: search||'',all: false,page: page||1,_search:''};
	}
	componentDidMount() {
		this.fetchData()
	}

	componentDidUpdate(prevProps,prevState){
		if(this.state.search !== prevState.search || this.state.status !== prevState.status){
			this.props.history.replace(this.props.match.url,{status: this.state.status,search: this.state.search,page: 1})
			this.fetchData();
		} else if(this.state.page !== prevState.page){
			this.props.history.replace(this.props.match.url,{status: this.state.status,search: this.state.search,page: this.state.page})
			this.fetchData();
		}
	}

	fetchData(){
		let params = {page: this.state.page};
		if(this.state.status)
			params['status'] = this.state.status;
		if(this.state.search)
			params['search'] = this.state.search;
		this.setState({loading: true});
		axios.get('/api/members/',{params}).then(response => this.setState({members: response.data}),
			error=>this.setState({error: error.response.data})).finally(_=>this.setState({loading:false}))
	}

	gotoPage(page){
		this.setState({page})
	}

	handleChange(field,e){
		this.setState({[field]: e.target.value,all:false,page: 1});
	}

	timeout = null
	handleNameChange(e) {
		let value = e.target.value;
		this.setState({_search: value});
		clearTimeout(this.timeout);
		this.timeout = setTimeout(()=>{
			this.setState({search: value,page: 1});
		},500)
	}

	handleAllChange(e){
		let status = this.state.status;

		if(e.target.checked){
			status = '';
		}
		this.setState({all: e.target.checked,status,page: 1});
	}

	getData() {
		let params = {status: this.state.status,search:this.state.search}
		return getPaginatedData('/api/members/',params).then(res=>{
			let rows = [['Salutation','Name','Gender','ID Number','Postal Address','Mobile Number','Email Address','NHIF Number','Spouse Name','Spouse ID Number','Spouse Mobile Number',
			'Child Name(1)','Child Date of Birth','Child Name(2)','Child Date of Birth','Child Name(3)','Child Date of Birth','Child Name(4)','Child Date of Birth',
			'Child Name(5)','Child Date of Birth','Child Name(6)','Child Date of Birth','Father\'s Name','Mother\'s Name']];
			for(let i = 0; i < res.length; i++){
				//don't export dummy members
				if(!res[i].dummy){
					rows.push([
						res[i].salutation,
						res[i].first_name.toUpperCase() + ' ' + res[i].middle_name.toUpperCase()  + ' ' + res[i].last_name.toUpperCase(),
						res[i].gender,
						res[i].id_no,
						res[i].address + (res[i].code ? ('-'+res[i].code) : '') + (res[i].city ? ('-'+res[i].city) : ''),
						res[i].mobile_no,
						res[i].email,
						res[i].nhif_no,
						res[i].spouse ? res[i].spouse_info.first_name + ' ' + res[i].spouse_info.middle_name + ' ' + res[i].spouse_info.last_name : null,
						res[i].spouse ? res[i].spouse_info.id_no  : null,
						res[i].spouse ? res[i].spouse_info.mobile_no : null,
						res[i].children[1] ? res[i].children[1].first_name + ' ' + res[i].children[1].middle_name : null,
						res[i].children[1] ? res[i].children[1].dob : null,
						res[i].children[2] ? res[i].children[2].first_name + ' ' + res[i].children[2].middle_name : null,
						res[i].children[2] ? res[i].children[2].dob : null,
						res[i].children[3] ? res[i].children[3].first_name + ' ' + res[i].children[3].middle_name : null,
						res[i].children[3] ? res[i].children[3].dob : null,
						res[i].children[4] ? res[i].children[4].first_name + ' ' + res[i].children[4].middle_name : null,
						res[i].children[4] ? res[i].children[4].dob : null,
						res[i].children[5] ? res[i].children[5].first_name + ' ' + res[i].children[5].middle_name : null,
						res[i].children[5] ? res[i].children[5].dob : null,
						res[i].children[6] ? res[i].children[6].first_name + ' ' + res[i].children[6].middle_name : null,
						res[i].children[6] ? res[i].children[6].dob : null,
						res[i].father_first_name + ' ' + res[i].father_middle_name + ' ' + res[i].father_last_name,
						res[i].mother_first_name + ' ' + res[i].mother_middle_name + ' ' + res[i].mother_last_name
						])
					}
			}
			let filename = 'Members ' + this.state.status
			return {rows,filename};
		});
	}

	render(){
		let match = this.props.match;
		return (
			<div className='members'>
				<div className={`alert alert-danger alert-dismissible ${this.state.error.detail ? 'show' : 'hide'}`} role="alert">
          <a href="#" className="close" data-dismiss="alert" aria-label="close">&times;</a>
          {this.state.error.detail}
        </div>
				<h1 className='text-center'> Members <i className={`fa fa-circle-o-notch fa-spin fa-fw ${this.state.loading ? '' : 'fade'}`}></i> </h1>
				<div className="row">
					<Link to={`${this.props.match.url}/new`} className="btn btn-success col-sm-3 col-sm-offset-4">Add <i className='glyphicon glyphicon-plus'></i></Link>
				</div>
				<div className="row">
					<form className="form-inline">
						<div className="form-group">
							<label className="control-label">Active
							<input onChange={this.handleChange.bind(this,'status')} type="radio" name="status" value="active" className="form-control"
									checked={this.state.status === 'active'} /></label>
						</div>
						<div className="form-group">
							<label className="control-label">Upto Date</label>
							<input onChange={this.handleChange.bind(this,'status')} type="radio" name="status" value="upto-date" className="form-control"
									checked={this.state.status === 'upto-date'} />
						</div>
						<div className="form-group">
							<label className="control-label">Lagging</label>
							<input onChange={this.handleChange.bind(this,'status')} type="radio" name="status" value="lagging" className="form-control"
									checked={this.state.status === 'lagging'} />
						</div>
						<div className="form-group">
							<label className="control-label">Suspended</label>
							<input onChange={this.handleChange.bind(this,'status')} type="radio" name="status" value="suspended" className="form-control"
									checked={this.state.status === 'suspended'} />
						</div>
						<div className="form-group">
							<label className="control-label">Dormant</label>
							<input onChange={this.handleChange.bind(this,'status')} type="radio" name="status" value="dormant" className="form-control"
										checked={this.state.status === 'dormant'} />
						</div>
						<div className="form-group">
							<label className="control-label">ALL</label>
							<input onChange={this.handleAllChange.bind(this)} checked={this.state.all} type="checkbox" name="status" value="all" className="form-control" />
						</div>
						<div className="form-group">
							<label className="control-label">Name</label>
							<input onChange={this.handleNameChange.bind(this)} value={this.state._search} type="text" className="form-control" />
						</div>

					</form>
				</div>
				<table className="table table-striped table-responsive">
					<thead>
						<tr>
							<td>First name</td>
							<td>Middle name</td>
							<td>Last name name</td>
							<td>ID Number</td>
							<td>Phonenumber</td>
						</tr>
					</thead>
					<tbody>
						{this.state.members.results.map(member=>(
							<tr key={member.id}>
								<td><Link to={{pathname:`${match.url}/${member.id}`,state:{member}}}>{member.first_name}</Link></td>
								<td><Link to={{pathname:`${match.url}/${member.id}`,state:{member}}}>{member.middle_name}</Link></td>
								<td><Link to={{pathname:`${match.url}/${member.id}`,state:{member}}}>{member.last_name}</Link></td>
								<td>{member.id_no}</td>
								<td>{member.mobile_no}</td>
							</tr>
							))}
					</tbody>
				</table>
				<Pagination goto={this.gotoPage.bind(this)} data={this.state.members} />
				<ExportButton data={this.getData.bind(this)}/>
			</div>
			);
	}
}



class NewMember extends Component {
	state = {error: {}}
	submit(data) {
		return axios.post(`/api/members/`,data).then(res=>{
			this.setState({error: {}});
			return res;
		},error=>{
			this.setState({error: error.response.data})
			return Promise.reject(error);
		})
	}

	close() {
		this.props.history.push('/home/members')
	}

	render() {
		return <div>
				<h1 className='text-center'>New Member</h1>
				<PersonalDetailsForm error={this.state.error} submit={this.submit.bind(this)} close={this.close.bind(this)} />
			</div>
	}
}

class EditMember extends Component {
	state = {data: {}, error: {}}
	componentDidMount() {
  	if(this.props.location.state && this.props.location.state.member){
  		this.setState({data: this.props.location.state.member})
  	}else if(this.props.match.params.id){
  		axios.get(`/api/members/${this.props.match.params.id}`).then(response => {
  			this.setState({data: response.data});
  		},error=>this.setState({error:error.response.data}))
  	}
  	
  }

	submit(data) {
		return axios.put(`/api/members/${this.props.match.params.id}/`,data).then(res=>{
			this.setState({data: res.data,error: {}});
			//update location state
			this.props.history.replace(this.props.match.url,{state:{member: res.data}});
			return res;
		},error=>{
			this.setState({error: error.response.data})
			return Promise.reject(error);
		})
	}

	close() {
		this.props.history.push('/home/members')
	}

	render() {
		let data = this.state.data;
		return <div>
				{data.first_name ? <h2 className="text-center">{`${data.first_name.toUpperCase() + ' ' + data.middle_name.toUpperCase() + ' ' + data.last_name.toUpperCase()}`}</h2> : <div/>}
				<ul className="nav nav-tabs nav-justified">
				  <NavLink role="presentation" exact to={`${this.props.match.url}`} activeClassName="active">Personal Details</NavLink>
				  <NavLink role="presentation" to={`${this.props.match.url}/notes`} activeClassName="active">Personal Notes</NavLink>
				</ul>
				<div className='tab-content' style={{'paddingTop': '10px'}}>
					<AnimatedSwitch>
						<Route exact path={`${this.props.match.path}`} render={(props)=><PersonalDetailsForm 
							edit={true} data={this.state.data} error={this.state.error} 
							submit={this.submit.bind(this)} close={this.close.bind(this)} />} />
						<Route path={`${this.props.match.path}/notes`} render={(props)=><PersonalNotes {...props} member={this.state.data} />} />
					</AnimatedSwitch>
				</div>
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
