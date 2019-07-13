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

    this.state = {data: {...this.emptyData}, error: {}};
  }

  componentDidMount() {
  	if(this.props.location.state && this.props.location.state.member){
  		this.setState({data: this.props.location.state.member})
  	}else if(this.props.match.params.id){
  		axios.get(`/api/members/${this.props.match.params.id}`).then(response => {
  			this.setState({data: response.data});
  		})
  	}
  	
  }

	render() {
		let id = this.props.match.params.id;
		let data = this.state.data;
		return (
			<div>
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

		this.state = {loading: false, members: {results:[]}, status: status||'active', search: search||'',all: false,page: page||1};
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
		axios.get('/api/members/',{params}).then(response => this.setState({members: response.data})).finally(_=>this.setState({loading:false}))
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

	render(){
		let match = this.props.match;
		return (
			<div>
				<h1 className='text-center'> Members <i className={`fa fa-circle-o-notch fa-spin fa-fw ${this.state.loading ? '' : 'fade'}`}></i> </h1>
				<div className="row">
					<Link to={`${this.props.match.url}/new`} className="btn btn-success col-sm-3 col-sm-offset-4">Add <i className='glyphicon glyphicon-plus'></i></Link>
				</div>
				<div className="row">
					<form className="form-horizontal">
						<div className="form-group col-sm-2">
							<label className="col-sm-8 control-label">Active</label>
							<div className="col-sm-1">
								<input onChange={this.handleChange.bind(this,'status')} type="radio" name="status" value="active" className="form-control"
									checked={this.state.status === 'active'} />
							</div>
						</div>
						<div className="form-group col-sm-2">
							<label className="col-sm-8 control-label">Upto Date</label>
							<div className="col-sm-1">
								<input onChange={this.handleChange.bind(this,'status')} type="radio" name="status" value="upto-date" className="form-control"
									checked={this.state.status === 'upto-date'} />
							</div>
						</div>
						<div className="form-group col-sm-2">
							<label className="col-sm-8 control-label">Lagging</label>
							<div className="col-sm-1">
								<input onChange={this.handleChange.bind(this,'status')} type="radio" name="status" value="lagging" className="form-control"
									checked={this.state.status === 'lagging'} />
							</div>
						</div>
						<div className="form-group col-sm-2">
							<label className="col-sm-8 control-label">Suspended</label>
							<div className="col-sm-1">
								<input onChange={this.handleChange.bind(this,'status')} type="radio" name="status" value="suspended" className="form-control"
									checked={this.state.status === 'suspended'} />
							</div>
						</div>
						<div className="form-group col-sm-2">
							<label className="col-sm-8 control-label">Dormant</label>
							<div className="col-sm-1">
								<input onChange={this.handleChange.bind(this,'status')} type="radio" name="status" value="dormant" className="form-control"
									checked={this.state.status === 'dormant'} />
							</div>
						</div>
						<div className="form-group col-sm-2">
							<label className="col-sm-8 control-label">ALL</label>
							<div className="col-sm-1">
								<input onChange={this.handleAllChange.bind(this)} checked={this.state.all} type="checkbox" name="status" value="all" className="form-control" />
							</div>
						</div>
						<div className="form-group col-sm-4">
							<label className="col-sm-2 control-label">Name</label>
							<div className="col-sm-10">
								<input onChange={this.handleChange.bind(this,'search')} value={this.state.search} type="text" className="form-control" />
							</div>
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
								<td><Link to={`${match.url}/${member.id}`}>{member.middle_name}</Link></td>
								<td><Link to={`${match.url}/${member.id}`}>{member.last_name}</Link></td>
								<td>{member.id_no}</td>
								<td>{member.mobile_no}</td>
							</tr>
							))}
					</tbody>
				</table>
				<Pagination goto={this.gotoPage.bind(this)} data={this.state.members} />

			</div>
			);
	}
}