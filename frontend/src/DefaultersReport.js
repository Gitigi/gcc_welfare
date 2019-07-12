import React, {Component} from 'react';
import axios from 'axios';
import Pagination from './Pagination';
import ExportButton from './ExportButton';
import {getPaginatedData} from './utility';

export default class DefaultersReport extends Component {
	state = {data: {results: []},salutation: ''}
	componentDidMount() {
		this.fetchData();
	}

	componentDidUpdate(prevProp,prevState) {
		if(prevState.salutation !== this.state.salutation){
			this.fetchData();
		}
	}

	fetchData(page=1) {
		axios.get('/api/defaulters-report',{params: {page,salutation: this.state.salutation}}).then(res=>this.setState({data: res.data}))
	}

	calculateLag(date) {
		if(!date){
			return '-'
		}
		let today = new Date();
		let last_period = new Date(date);
		let delay =  ((today.getFullYear() - last_period.getFullYear()) * 12) + (today.getMonth() - last_period.getMonth())
		return delay
	}

	gotoPage(page) {
		this.fetchData(page);
	}

	getData() {
		return getPaginatedData('/api/defaulters-report',{salutation: this.state.salutation}).then(res=>{
			let rows = [['Name','Last Payed Period', 'Number of Unpayed Periods']];
			for(let i = 0; i < res.length; i++){
				rows.push([
					res[i].first_name.toUpperCase() + ' ' + res[i].middle_name.toUpperCase()  + ' ' + res[i].last_name.toUpperCase(),
					res[i].period || "Dormant",
					this.calculateLag(res[i].period)
					])
			}
			let filename = 'Defaulters Report'
			if(this.state.salutation)
				filename += ' for ' + this.state.salutation;
			return {rows,filename};
		});
	}

	handleSalutation(e) {
		this.setState({salutation: e.target.value});
	}

	render() {
		return <div>
				<h2 className="text-center">Defaulters Report</h2>
				<div className="row">
					<form>
						<div className="col-sm-offset-4 col-sm-4">
							<select value={this.state.salutation} onChange={this.handleSalutation.bind(this)} className="form-control" id="inputSalutation">
				    		<option></option>
				    		<option>Dr</option>
				    		<option>Mr</option>
				    		<option>Mrs</option>
				    		<option>Ms</option>
				    		<option>Pastor</option>
				    		<option>Apostle</option>
				    		<option>Bishop</option>
				    		<option>Elder</option>
				    		<option>Deacon</option>
				    	</select>
						</div>
					</form>
				</div>
				<table className="table table-responsive table-striped">
					<thead>
						<tr>
							<th>First Name</th>
							<th>Middle Name</th>
							<th>Last Name</th>
							<th>Last Payed Period</th>
							<th>Number of Unpayed Period</th>
						</tr>
					</thead>
					<tbody>
						{this.state.data.results.map(p=>{
							return <tr key={p.id}>
									<td>{p.first_name.toUpperCase()}</td>
									<td>{p.middle_name.toUpperCase()}</td>
									<td>{p.last_name.toUpperCase()}</td>
									<td>{p.period || "Dormant"}</td>
									<td>{this.calculateLag(p.period)}</td>
								</tr>
						})}
					</tbody>
				</table>
				<Pagination goto={this.gotoPage.bind(this)} data={this.state.data} />
				<ExportButton data={this.getData.bind(this)}/>
			</div>
	}
}