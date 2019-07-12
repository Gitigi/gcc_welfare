import React, {Component} from 'react';
import axios from 'axios';
import ExportButton from './ExportButton';
import Pagination from './Pagination';
import {getPaginatedData} from './utility';

export default class AnnualReport extends Component {
	state = {loading:false,rows: [],member: {},data: {results: []}}

	componentDidMount() {
		this.fetchData();
	}

	fetchData(page=1) {
		this.setState({loading:true})
		axios.get('/api/annual-report/',{params : {page}}).then(res=>{
			if(!res.data.results.length){
				this.setState({data: {results:[]},rows:[]})
				return;
			}
			let first = res.data.results[0].period__year;
			let last = res.data.results[res.data.results.length-1].period__year;
			let years = Math.abs(first-last)+1;
			let direction = 1;
			if(first > last)
				direction = -1

			let rows = Array.from(new Array(years), (v,i)=>first+(direction*i));
			this.setState({rows,data: res.data})
		}).finally(_=>this.setState({loading:false}))
	}

	getData() {
		let data = [['','January','February','March','April','May','June','July','August','Septempber','October','November','December']];
		return getPaginatedData('/api/annual-report/').then(res=>{
			let row = 0;
			let item,year;
			for(let index=0; index < res.length; index++){
				item = res[index];
				if(year !== item.period__year){
					data.push([(new Array(13)).fill(null)]);
					row++;
					year = item.period__year;
					data[row][0] = year;
				}
				data[row][item.period__month] = item.total;
			}
			let filename = 'Annual Report';
			return {rows: data,filename};
		});
	}

	getAmount(year,month) {
		let p = this.state.data.results.find(v=> v.period__year === year && v.period__month === month);
		if(!p)
			return '';
		return p.total
	}

	gotoPage(page) {
		this.fetchData(page);
	}

	render() {
		let months = (new Array(12)).fill(0);
		return <div>
				<h2 className="text-center">Annual Report <i className={`fa fa-circle-o-notch fa-spin fa-fw ${this.state.loading ? '' : 'fade'}`}></i></h2>
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
				<Pagination goto={this.gotoPage.bind(this)} data={this.state.data} onlyPreviousNext={true} />
				<ExportButton data={this.getData.bind(this)}/>
			</div>
	}
}