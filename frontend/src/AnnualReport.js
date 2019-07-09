import React, {Component} from 'react';
import axios from 'axios';
import ExportButton from './ExportButton';

export default class AnnualReport extends Component {
	state = {rows: [],member: {}}

	componentDidMount() {
		this.fetchData(this.state.year);
	}

	fetchData(year) {
		axios.get('/api/annual-report/',{params : {year}}).then(res=>{
			// this.updateData(res.data);
			if(!res.data.length){
				this.setState({data: [],rows:[]})
				return;
			}
			console.log(res.data);
			let first = res.data[0].period__year;
			let last = res.data[res.data.length-1].period__year;
			let years = Math.abs(first-last)+1;
			let direction = 1;
			if(first > last)
				direction = -1

			let rows = Array.from(new Array(years), (v,i)=>first+(direction*i));
			this.setState({rows,data: res.data})
		})
	}

	getData(){
		return [[]]
	}

	getAmount(year,month) {
		let p = this.state.data.find(v=> v.period__year === year && v.period__month === month);
		if(!p)
			return '';
		return p.total
	}

	render() {
		let months = (new Array(12)).fill(0);
		return <div>
				<h2 className="text-center">Annual Report</h2>
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
							<th>Total</th>
						</tr>
					</thead>
					<tbody>
						{this.state.rows.map((year,index)=>{
							let total = 0;
							return <tr key={year}>
									<th>{year}</th>
									{months.map((m,index)=>{
										let amount = this.getAmount(year,index+1);
										total += amount;
										return <td key={year+''+index}>{amount}</td>
									})}
									<th>{total}</th>
								</tr>
						})}
					</tbody>
				</table>
				<ExportButton data={this.getData.bind(this)}/>
			</div>
	}
}