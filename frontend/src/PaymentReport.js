import React, {Component} from 'react';
import axios from 'axios';
import NameSearchInput from './NameSearchInput';
import Pagination from './Pagination';
import ExportButton from './ExportButton';
import {getPaginatedData} from './utility';

export default class PaymentReport extends Component {
	state = {error:{},loading: false,data: {results: []},member: {},page:1}
	methodChoices = {'CA': 'CASH', 'BK': 'BANK', 'MP': 'MPESA'}
	componentDidMount() {
		this.fetchData();
	}

	fetchData() {
		this.setState({loading:true});
		let params = {page:this.state.page}
		if(this.state.member.id){
			params['member'] = this.state.member.id;
		}
		axios.get('/api/payments/',{params}).then(res=>this.setState({data: res.data}),
			error=>this.setState({error:error.response.data})).finally(_=>this.setState({loading:false}))
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
		return getPaginatedData('/api/payments/',{member: this.state.member.id}).then(res=>{
			let rows = [['Name', 'Amount','Method','Mobine Number','Bank Name','Reference Number','Date']];
			for(let i = 0; i < res.length; i++){
				rows.push([
					res[i].first_name.toUpperCase() + ' ' + res[i].middle_name.toUpperCase()  + ' ' + res[i].last_name.toUpperCase(),
					res[i].amount,
					this.methodChoices[res[i].method],
					res[i].mobile_no,
					res[i].bank_name,
					res[i].ref_no,
					this.formatDate(res[i].date)
					])
			}
			let filename = 'Payment Report'
			if(this.state.member.id)
				filename += ' for ' + this.state.member.first_name.toUpperCase() + ' ' + this.state.member.middle_name.toUpperCase()  + ' ' + this.state.member.last_name.toUpperCase();
			return {rows,filename};
		});
	}

	formatDate(date){
		date = date.split('.')[0]
		date = date.split('T');
		date[0] = date[0].split('-').reverse().join('/')
		return date.join(' ')
	}

	render() {
		return <div>
				<div className={`alert alert-danger alert-dismissible ${this.state.error.detail ? 'show' : 'hide'}`} role="alert">
          <a href="#" className="close" data-dismiss="alert" aria-label="close">&times;</a>
          {this.state.error.detail}
        </div>
				<h2 className="text-center">Payment Report <i className={`fa fa-circle-o-notch fa-spin fa-fw ${this.state.loading ? '' : 'fade'}`}></i> </h2>
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
							<th>Amount</th>
							<th>Method</th>
							<th>Mobile Number</th>
							<th>Bank Name</th>
							<th>Reference No</th>
							<th>Date</th>
						</tr>
					</thead>
					<tbody>
						{this.state.data.results.map((p,index)=>{
							return <tr key={index}>
									<td>{p.first_name.toUpperCase()}</td>
									<td>{p.middle_name.toUpperCase()}</td>
									<td>{p.last_name.toUpperCase()}</td>
									<td>{p.amount}</td>
									<td>{this.methodChoices[p.method]}</td>
									<td>{p.mobile_no}</td>
									<td>{p.bank_name}</td>
									<td>{p.ref_no}</td>
									<td>{this.formatDate(p.date)}</td>
								</tr>
						})}
					</tbody>
				</table>
				<Pagination goto={this.gotoPage.bind(this)} data={this.state.data} />
				<ExportButton data={this.getData.bind(this)}/>
			</div>
	}
}