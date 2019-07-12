import React, {Component} from 'react';
import axios from 'axios';
import {Route} from 'react-router-dom';
import AnimatedSwitch from './animated-switch';
import NameSearchInput from './NameSearchInput';
import NavLink from './navlink';
import Pagination from './Pagination';
import ConfirmAction from './ConfirmAction';

export default class Notification extends Component {
	render() {
		return <div>
				<h2>Notification</h2>
				<ul className="nav nav-tabs nav-justified">
				  <NavLink role="presentation" exact to={`${this.props.match.url}`} activeClassName="active">Send Notification</NavLink>
				  <NavLink role="presentation" to={`${this.props.match.url}/sent`} activeClassName="active">Sent Notification</NavLink>
				</ul>
				<div className='tab-content' style={{'paddingTop': '10px'}}>
					<AnimatedSwitch>
						<Route exact path={`${this.props.match.path}`} component={SendNotification} />
						<Route path={`${this.props.match.path}/sent`} component={SentNotification} />
					</AnimatedSwitch>
				</div>
			</div>
	}
}

class SendNotification extends Component {
	confirm = React.createRef();
	state = {loading:false,sent: false,heading: '', body: '', target: 'individual', status: 'active' ,contribution: 'all',currentUser: {},contacts: [],error:{}}

	constructor(props) {
		super(props);

		this.handleUserChange  = this.handleUserChange.bind(this);
		this.addContact = this.addContact.bind(this);
		this.sendMessage = this.sendMessage.bind(this);
	}

	handleChange(field,e) {
		this.setState({[field]: e.target.value})
	}

	handleUserChange(user){
		this.setState({currentUser: user})
	}

	addContact() {
		if(this.state.currentUser.id && !this.state.contacts.find(c=>c.id === this.state.currentUser.id)){
			let c = this.state.contacts.splice(0);
			c.push(this.state.currentUser);
			this.setState({contacts: c});
		}
	}

	removeContact(index) {
		let c = this.state.contacts.splice(0);
  	c.splice(index,1);
  	this.setState({contacts: c})
	}

	validate(data){
		let error = {}
		if(!data.heading)
			error.heading = 'This field is required';
		if(!data.body)
			error.body = 'This field is required';
		if(data.target === 'individual' && !data.contacts.split(';')[0])
			error.contacts = 'This field is required';
		return error;
	}

	sendMessage(){
		let data = {
			heading: this.state.heading,
			body: this.state.body,
			target: this.state.target,
			contacts: this.state.contacts.map(c=>c.id).join(';'),
			status: this.state.status,
			contribution: this.state.contribution
		}
		let error = this.validate(data);
    if(Object.keys(error).length){
      this.setState({error});
      console.log(error);
      window.scrollTo(0,0);
      return;
    }

		this.confirm.current.show().then(_=>{
			this.setState({loading:true})
			axios.post('/api/notification/',data).then(res=>{
				this.setState({sent: true,heading: '', body: '', target: 'individual', status: 'active' ,contribution: 'all',currentUser: {},contacts: [],error:{}})
				window.scrollTo(0,0);
				setTimeout(_=>this.setState({sent: false}),2000);
			},error=>{
				console.log(error.response.data);
				window.scrollTo(0,0)
				this.setState({error: error.response.data});
			}).finally(_=>this.setState({loading:false}))
		})
	}

	render() {
		return <div>
				<div className={`alert alert-success ${this.state.sent ? 'show' : 'hide'}`} role="alert">
          Successfully sent
        </div>
        <ConfirmAction ref={this.confirm} yesLabel="Save" noLabel="Cancel" title="Sending message...">
					<p>Do you want to send message</p>
				</ConfirmAction>
				<form>
					<div className={`form-group ${this.state.error.heading ? 'has-error': ''}`}>
						<label className="col-sm-2 control-label">Heading</label>
						<div className="col-sm-4">
							<input onChange={this.handleChange.bind(this,'heading')} value={this.state.heading} type="text" className="form-control" />
						</div>
						<div className="clearfix" />
					</div>
					<div className={`form-group ${this.state.error.body ? 'has-error': ''}`}>
						<label className="col-sm-2 control-label">Message</label>
						<div className="col-sm-10">
							<p className="text-bold">Variables</p>
							<p>#NAME</p>
							<p>#LAST_PAYED_PERIOD</p>
							<p>#UNPAYED_PERIOD</p>
							<p>#NUMBER_OF_UNPAYED_PERIOD</p>
							<p>#CURRENT_PERIOD</p>
							<textarea onChange={this.handleChange.bind(this,'body')} value={this.state.body} className="form-control" rows="7"></textarea>
						</div>
					</div>
				</form>
				<hr/>
				<h3>Recepient</h3>
				<form className="form-horizontal">
					<div className="form-group">
						<label className="col-sm-2 control-label">Individual</label>
						<div className="col-sm-4">
							<input onChange={this.handleChange.bind(this,"target")} type="radio" name="target" value="individual"
								checked={this.state.target === 'individual'} />
						</div>
						<label className="col-sm-2 control-label">Group</label>
						<div className="col-sm-4">
							<input onChange={this.handleChange.bind(this,"target")} type="radio" name="target" value="group"
							 checked={this.state.target === 'group'} />
						</div>
					</div>

					{this.state.target === 'individual' && <div>
						<h4>Add Individual Numbers</h4>
						<div className="row">
							<ul>
								{this.state.contacts.map( (u,index) =>{
									return <li key={u.id} className="col-sm-offset-2 col-sm-10">
										<p className="col-sm-6">{u.first_name} {u.middle_name} {u.last_name}</p>
										<div className="col-sm-6">
											<i onClick={this.removeContact.bind(this,index)} className="col-sm-1 glyphicon glyphicon-remove"></i>
										</div>
									</li>
								})}
							</ul>
						</div>
						<div className={`form-group ${this.state.error.contacts ? 'has-error': ''}`}>
							{this.state.error.contacts && <p className='form-control-static text-danger text-center'>*You have to click the add button to add the contact</p>}
							<label className="col-sm-2 control-label">Name</label>
							<div className="col-sm-6">
								<NameSearchInput userSelected={this.handleUserChange} member={this.state.currentUser} />
							</div>
							<div className="col-sm-4">
								<button type="button" className="btn btn-primary" onClick={this.addContact}>Add</button>
							</div>
						</div>
					</div>}

					{this.state.target === 'group' && <div>
						<h2>Group</h2>
						<div className="form-group">
							<label className="col-sm-2 control-label">Active</label>
							<div className="col-sm-2">
								<input onChange={this.handleChange.bind(this,"status")} type="radio" name="status" value="active"
									checked={this.state.status === 'active'} />
							</div>
							<label className="col-sm-2 control-label">Suspended</label>
							<div className="col-sm-2">
								<input onChange={this.handleChange.bind(this,"status")} type="radio" name="status" value="suspended"
									checked={this.state.status === 'suspended'} />
							</div>
							<label className="col-sm-2 control-label">All</label>
							<div className="col-sm-2">
								<input onChange={this.handleChange.bind(this,"status")} type="radio" name="status" value="all"
									checked={this.state.status === 'all'} />
							</div>
						</div>
						{this.state.status === 'active' && <div className="form-group">
							<label className="col-sm-1 control-label">Up To Date</label>
							<div className="col-sm-2">
								<input onChange={this.handleChange.bind(this,"contribution")} type="radio" name="contribution" value="up-to-date"
									checked={this.state.contribution === 'up-to-date'} />
							</div>
							<label className="col-sm-1 control-label">Lagging</label>
							<div className="col-sm-2">
								<input onChange={this.handleChange.bind(this,"contribution")} type="radio" name="contribution" value="lagging"
									checked={this.state.contribution === 'lagging'} />
							</div>
							<label className="col-sm-1 control-label">Dormant</label>
							<div className="col-sm-2">
								<input onChange={this.handleChange.bind(this,"contribution")} type="radio" name="contribution" value="dormant"
									checked={this.state.contribution === 'dormant'} />
							</div>
							<label className="col-sm-1 control-label">All</label>
							<div className="col-sm-2">
								<input onChange={this.handleChange.bind(this,"contribution")} type="radio" name="contribution" value="all"
									checked={this.state.contribution === 'all'} />
							</div>
						</div>}

					</div>}

					<button onClick={this.sendMessage} disabled={this.state.loading} type="button" className="btn btn-success col-sm-offset-4">Send</button>

				</form>
			</div>
	}
}

class SentNotification extends Component {
	state = {loading: false,notifications: {results: []}}
	componentDidMount(){
		this.fetchData()
	}
	fetchData(page=1){
		this.setState({loading:true});
		axios.get('/api/notification/',{params: {page}}).then(res=>this.setState({notifications: res.data})).finally(_=>this.setState({loading:false}))
	}

	gotoPage(page) {
		this.fetchData(page);
	}
	render() {
		return <div>
				<h2>Sent Notifications <i className={`fa fa-circle-o-notch fa-spin fa-fw ${this.state.loading ? '' : 'fade'}`}></i></h2>
				<table className="table table-striped table-responsive">
					<thead>
						<tr>
							<th>Date</th>
							<th>Heading</th>
							<th>Body</th>
							<th>Target</th>
						</tr>
					</thead>
					<tbody>
						{this.state.notifications.results.map(n=>{
							return <tr key={n.id}>
									<td>{n.date}</td>
									<td>{n.heading}</td>
									<td>{n.body}</td>
									<td>{n.target}</td>
								</tr>
						})}
					</tbody>
				</table>
				<Pagination goto={this.gotoPage.bind(this)} data={this.state.notifications} />
			</div>
	}
}