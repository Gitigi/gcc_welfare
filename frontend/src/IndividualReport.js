import React, {Component} from 'react';
import axios from 'axios';
import NameSearchInput from './NameSearchInput';
import * as $ from 'jquery';
import Pagination from './Pagination';
import ExportButton from './ExportButton';
import {getPaginatedData} from './utility';

export default class IndividualReport extends Component {
	state = {error:{},loading: false,rows: [],first:'',last:'',member: {},data:{results:[]}}
	componentDidMount() {
		this.fetchData();
	}
	componentDidUpdate(prevProp,prevState) {
		if(prevState.member.id !== this.state.member.id){
			this.fetchData();
		}
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
		},error=>this.setState({error:error.response.data})).finally(_=>this.setState({loading:false}))
	}

	getAmount(year,month) {
		let p = this.state.data.results.find(v => v.period__year === year && v.period__month === month);
		if(!p)
			return null;
		return p.amount
	}
	handleMemberChange(member) {
		this.setState({member})
	}

	getData() {
		let data = [['','January','February','March','April','May','June','July','August','Septempber','October','November','December']];
		return getPaginatedData('/api/payment-distribution/',{member: this.state.member.id}).then(res=>{
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
				data[row][item.period__month] = item.amount;
			}
			let filename = 'Individual Report';
			if(this.state.member.id)
				filename = this.state.member.first_name.toUpperCase() + ' ' + this.state.member.middle_name.toUpperCase() + ' ' + this.state.member.last_name.toUpperCase() + ' ' +filename;
			return {rows: data,filename};
		});
	}

	gotoPage(page) {
		this.fetchData(page);
	}

	render() {
		let months = (new Array(12)).fill(0);
		return <div>
				<div className={`alert alert-danger alert-dismissible ${this.state.error.detail ? 'show' : 'hide'}`} role="alert">
          <a href="#" className="close" data-dismiss="alert" aria-label="close">&times;</a>
          {this.state.error.detail}
        </div>
				<h2 className="text-center">Individual Report <i className={`fa fa-circle-o-notch fa-spin fa-fw ${this.state.loading ? '' : 'fade'}`}></i> </h2>
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
										return <td key={year+''+index}>{this.getAmount(year,index+1)}</td>
									})}
								</tr>
						})}
					</tbody>
				</table>
				<Pagination goto={this.gotoPage.bind(this)} data={this.state.data} onlyPreviousNext={true} />
				<ExportButton data={this.getData.bind(this)}/>
			</div>
	}
}