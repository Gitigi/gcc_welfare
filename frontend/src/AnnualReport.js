import React, {Component} from 'react';
import axios from 'axios';

export default class AnnualReport extends Component {
	months = ['January','February','March','April','May',
		'June','July','August','Septempber','October','November','December']
	years = Array.from(new Array(20), (v,i)=>2015+i)

	constructor(props) {
		super(props);

		let year = (new Date()).getFullYear();
		this.state = {data: [],total: 0,year};

		this.handleYearChange = this.handleYearChange.bind(this);
	}

	componentDidMount() {
		this.fetchData(this.state.year);
	}

	fetchData(year) {
		axios.get('/api/annual-report/',{params : {year}}).then(res=>{
			this.updateData(res.data);
		})
	}

	updateData(data) {
		let d = (new Array(12)).fill(0);
		d = d.map((value,index)=>{
			let v = data.find(d=>(d.period__month-1)===index);
			return v ? v.total : 0;
		})
		let total = 0;
		d.forEach(a=>total+=a);
		this.setState({data: d,total});
	}

	handleYearChange(e){
		this.setState({year: e.target.value});
		this.fetchData(e.target.value);
	}

	render() {
		return <div>
				<h2 className="text-center">Annual Report</h2>
				<div className="row">
					<form>
						<div className="col-sm-offset-4 col-sm-4">
							<select onChange={this.handleYearChange} value={this.state.year} className="form-control">
								{this.years.map((y,i)=><option key={i} value={y}>{y}</option>)}
							</select>
						</div>
					</form>
				</div>
				<table className="table table-responsive table-striped">
					<thead>
						<tr>
							<th>Month</th>
							<th>Amount (KSH)</th>
						</tr>
					</thead>
					<tbody>
						{this.state.data.map((v,i)=>{
							return <tr key={i}>
									<td>{this.months[i]}</td>
									<td>{v}</td>
								</tr>
						})}
					</tbody>
					<tfoot>
						<tr>
							<th>Total</th>
							<th>{this.state.total}</th>
						</tr>
					</tfoot>
				</table>
			</div>
	}
}