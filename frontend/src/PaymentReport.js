import React, {Component} from 'react';
import axios from 'axios';
import NameSearchInput from './NameSearchInput';
import Pagination from './Pagination';
import ExportButton from './ExportButton';
import {getPaginatedData} from './utility';

export default class PaymentReport extends Component {
	state = {data: {results: []},member: {},page:1}
	componentDidMount() {
		this.fetchData();
	}

	fetchData() {
		let params = {page:this.state.page}
		if(this.state.member.id){
			params['member'] = this.state.member.id;
		}
		axios.get('/api/payment-report',{params}).then(res=>this.setState({data: res.data}))
	}

	componentDidUpdate(prevProp,prevState) {
		if(this.state.member.id !== prevState.member.id || this.state.page !== prevState.page){
			this.fetchData();
		}
	}

	handleMemberChange(member) {
		this.setState({member,page: 1});
	}

	gotoPage(page) {
		this.setState({page})
	}

	getData() {
		return getPaginatedData('/api/payment-report',{member: this.state.member.id}).then(res=>{
			let rows = [['Name','Date', 'Amount']];
			for(let i = 0; i < res.length; i++){
				rows.push([
					res[i].member__first_name.toUpperCase() + ' ' + res[i].member__middle_name.toUpperCase()  + ' ' + res[i].member__last_name.toUpperCase(),
					res[i].date,
					res[i].amount
					])
			}
			let filename = 'Payment Report'
			if(this.state.member.id)
				filename += ' for ' + this.state.member.first_name.toUpperCase() + ' ' + this.state.member.middle_name.toUpperCase()  + ' ' + this.state.member.last_name.toUpperCase();
			return {rows,filename};
		});
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
						{this.state.data.results.map((p,index)=>{
							return <tr key={index}>
									<td>{p.member__first_name.toUpperCase()}</td>
									<td>{p.member__middle_name.toUpperCase()}</td>
									<td>{p.member__last_name.toUpperCase()}</td>
									<td>{p.date}</td>
									<td>{p.amount}</td>
								</tr>
						})}
					</tbody>
				</table>
				<Pagination goto={this.gotoPage.bind(this)} data={this.state.data} />
				<ExportButton data={this.getData.bind(this)}/>
			</div>
	}
}