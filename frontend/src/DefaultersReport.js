import React, {Component} from 'react';
import axios from 'axios';

export default class DefaultersReport extends Component {
	state = {data: []}
	componentDidMount() {
		axios.get('/api/defaulters-report').then(res=>this.setState({data: res.data}))
	}

	calculateLag(date,date_joined) {
		let today = new Date();
		let last_period = new Date(date || date_joined);
		let delay =  ((today.getFullYear() - last_period.getFullYear()) * 12) + (today.getMonth() - last_period.getMonth())
		if(!date){
			delay+=1;
		}
		return delay
	}

	render() {
		return <div>
				<h2 className="text-center">Defaulters Report</h2>
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
						{this.state.data.map(p=>{
							return <tr key={p.id}>
									<td>{p.first_name.toUpperCase()}</td>
									<td>{p.middle_name.toUpperCase()}</td>
									<td>{p.last_name.toUpperCase()}</td>
									<td>{p.period || `Joined on ${p.date_joined}`}</td>
									<td>{this.calculateLag(p.period,p.date_joined)}</td>
								</tr>
						})}
					</tbody>
				</table>
			</div>
	}
}