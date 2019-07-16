import React, {Component} from 'react';
import axios from 'axios';
import NameSearchInput from './NameSearchInput';
import * as $ from 'jquery';
import Pagination from './Pagination';

export default class PaymentDistribution extends Component {
	state = {loading: false,rows: [],first:'',last:'',member: {},data: {results:[]}}
	componentDidMount() {
		this.fetchData();
	}
	componentDidUpdate(prevProp,prevState) {
		if(prevState.member.id !== this.state.member.id){
			this.fetchData();
		}
		if($('[data-toggle="tooltip"]').tooltip)
			$('[data-toggle="tooltip"]').tooltip({container: 'body'})
	}
	fetchData(page=1) {
		this.setState({loading:true});
		axios.get('/api/payment-distribution/',{params:{member: this.state.member.id,page}}).then(res=>{
			if(!res.data.results.length){
				this.setState({data: {results:[]},rows:[]})
				return;
			}
			let first = new Date(res.data.results[0].period);
			let last = new Date(res.data.results[res.data.results.length-1].period);
			let years = Math.abs(first.getFullYear()-last.getFullYear())+1;
			let direction = 1;
			if(first > last)
				direction = -1

			let rows = Array.from(new Array(years), (v,i)=>first.getFullYear()+(direction*i));
			this.setState({rows,first,last,data: res.data})
		}).finally(_=>this.setState({loading:false}))
	}
	payments = {}
	paymentCount = 0;
	getColor(year,month) {
		let colors = ['red','green','blue','yellow','pink'];
		let p = this.state.data.results.find(v =>  v.period__year === year && v.period__month === month);
		if(!p)
			return '';
		if(!this.payments[p.payment]) {
			this.payments[p.payment] = {'color': colors[this.paymentCount % 5],paymentDetails: 'Payment Date ' + Date(p.date) + '\nPeriod amount payed ' + p.amount +'\nActual Total Payment '+ p.payment__amount};
			this.paymentCount++;
		}
		
		return this.payments[p.payment]
	}
	handleMemberChange(member) {
		this.setState({member})
	}

	gotoPage(page) {
		this.fetchData(page);
	}

	render() {
		let months = (new Array(12)).fill(0);
		return <div>
				<h2 className="text-center">Payment Distribution <i className={`fa fa-circle-o-notch fa-spin fa-fw ${this.state.loading ? '' : 'fade'}`}></i></h2>
				<div className="row">
					<form>
						<div className="col-sm-offset-4 col-sm-4">
							<NameSearchInput userSelected={this.handleMemberChange.bind(this)}/>
						</div>
					</form>
				</div>
				<table className="table table-responsive">
					<thead>
						<tr>
							<th></th>
							<th>January</th>
							<th>Febrary</th>
							<th>March</th>
							<th>April</th>
							<th>May</th>
							<th>June</th>
							<th>July</th>
							<th>August</th>
							<th>September</th>
							<th>October</th>
							<th>November</th>
							<th>December</th>
						</tr>
					</thead>
					<tbody>
						{this.state.rows.map((year,index)=>{
							return <tr key={year}>
									<th>{year}</th>
									{months.map((m,index)=>{
										let details = this.getColor(year,index+1);
										return <td key={year+''+index} bgcolor={details.color} data-original-title={details.paymentDetails}
											data-container="body" data-toggle="tooltip" data-placement="top" title=""></td>
									})}
								</tr>
						})}
					</tbody>
				</table>
				<Pagination goto={this.gotoPage.bind(this)} data={this.state.data} onlyPreviousNext={true} />
			</div>
	}
}