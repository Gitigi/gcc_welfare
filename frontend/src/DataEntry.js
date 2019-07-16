import React, {Component} from 'react';
import { Link, Route } from "react-router-dom";
import AnimatedSwitch from './animated-switch';
import {FadeTransition} from './transitions';
import axios from 'axios';
import {Tabs,Tab} from './Tab';
import PersonalDetails from './PersonalDetails';
import PersonalNotes from './PersonalNotes';
import NameSearchInput from './NameSearchInput';
import NavLink from './navlink';
import Pagination from './Pagination';
import ExportButton from './ExportButton';
import {getPaginatedData} from './utility';

import './DateEntry.css';

export default class DataEntry extends Component {
	render() {
		return (
			<AnimatedSwitch>
				<Route path={`${this.props.match.path}/new`} component={Editor} />
				<Route path={`${this.props.match.path}/:id`} component={Editor} />
				<Route path={`${this.props.match.path}`} component={List} />
			</AnimatedSwitch>
			);
	}
}


class Editor extends Component {
	emptyData = {children: [],first_name: '', middle_name: '', last_name: '',
  	id_no: '', address: '',code: '', city: '', mobile_no: '', email: '', nhif_no: '',
  	father_first_name: '',father_middle_name: '',father_last_name: '',
  	mother_first_name: '',mother_middle_name: '',mother_last_name: '', suspended: false, dummy: false, salutation: '', gender: 'M',dob: ''};
	constructor(props) {
    super(props);

    this.state = {error:{},data: {...this.emptyData}, error: {}};
  }

  componentDidMount() {
  	if(this.props.location.state && this.props.location.state.member){
  		this.setState({data: this.props.location.state.member})
  	}else if(this.props.match.params.id){
  		axios.get(`/api/members/${this.props.match.params.id}`).then(response => {
  			this.setState({data: response.data});
  		},error=>this.setState({error:error.response.data}))
  	}
  	
  }

	render() {
		let id = this.props.match.params.id;
		let data = this.state.data;
		return (
			<div>
				<div className={`alert alert-danger alert-dismissible ${this.state.error.detail ? 'show' : 'hide'}`} role="alert">
          <a href="#" className="close" data-dismiss="alert" aria-label="close">&times;</a>
          {this.state.error.detail}
        </div>
				{id ? <h2>{`${data.first_name.toUpperCase() + ' ' + data.middle_name.toUpperCase() + ' ' + data.last_name.toUpperCase()}`}</h2> :
					<h2>New Member</h2>
				}
				{id ? <ul className="nav nav-tabs nav-justified">
				  <NavLink role="presentation" exact to={`${this.props.match.url}`} activeClassName="active">Personal Details</NavLink>
				  <NavLink role="presentation" to={`${this.props.match.url}/notes`} activeClassName="active">Personal Notes</NavLink>
				</ul> : null}
				<div className='tab-content' style={{'paddingTop': '10px'}}>
					<AnimatedSwitch>
						<Route exact path={`${this.props.match.path}`} render={(props)=><PersonalDetails {...props} member={this.state.data} />} />
						<Route path={`${this.props.match.path}/notes`} render={(props)=><PersonalNotes {...props} member={this.state.data} />} />
					</AnimatedSwitch>
				</div>
			</div>
			);
	}
}

class List extends Component {
	constructor(props){
		super(props);
		let status = this.props.location.state && this.props.location.state.status;
		let search = this.props.location.state && this.props.location.state.search;
		let page = this.props.location.state && this.props.location.state.page;

		this.state = {error:{},loading: false, members: {results:[]}, status: status||'active', search: search||'',all: false,page: page||1};
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
		let all = field === 'search' ? this.state.all : false;

		this.setState({[field]: e.target.value,all,page: 1});
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
						<input onChange={this.handleChange.bind(this,'search')} value={this.state.search} type="text" className="form-control" />
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