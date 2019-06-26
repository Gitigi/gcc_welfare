import React, {Component} from 'react';
import axios from 'axios';
import NameSearchInput from './NameSearchInput';

export default class PaymentReport extends Component {
	state = {data: [],member: {}}
	componentDidMount() {
		this.fetchData();
	}

	fetchData() {
		let params = {}
		if(this.state.member.id){
			params['member'] = this.state.member.id;
		}
		axios.get('/api/payment-report',{params}).then(res=>this.setState({data: res.data}))
	}

	componentDidUpdate(prevProp,prevState) {
		if(this.state.member.id !== prevState.member.id){
			this.fetchData();
		}
	}

	handleMemberChange(member) {
		this.setState({member});
	}

	render() {
		return <div>
				<h2 className="text-center">Payment Report</h2>
				<div className="row">
					<form>
						<div className="col-sm-offset-4 col-sm-4">
							<NameSearchInput userSelected={this.handleMemberChange.bind(this)}/>
						</div>
					</form>
				</div>
				<table className="table table-responsive table-striped">
					<thead>
						<tr>
							<th>First Name</th>
							<th>Middle Name</th>
							<th>Last Name</th>
							<th>date</th>
							<th>Amount</th>
						</tr>
					</thead>
					<tbody>
						{this.state.data.map((p,index)=>{
							return <tr key={index}>
									<td>{p.member__first_name.toUpperCase()}</td>
									<td>{p.member__middle_name.toUpperCase()}</td>
									<td>{p.member__last_name.toUpperCase()}</td>
									<td>{p.date}</td>
									<td>{p.total}</td>
								</tr>
						})}
					</tbody>
				</table>
			</div>
	}
}