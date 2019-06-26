import React, {Component} from 'react';
import axios from 'axios';
import NameSearchInput from './NameSearchInput';

export default class IndividualReport extends Component {
	monthsArray = (new Array(12)).fill(0)
	months = ['January','February','March','April','May',
		'June','July','August','Septempber','October','November','December']
	years = Array.from(new Array(20), (v,i)=>2015+i)

	constructor(props) {
		super(props);

		let year = (new Date()).getFullYear();
		this.state = {data: [],members: [],total: 0,year,member: {},showAll: true,filterError: false};

		this.handleYearChange = this.handleYearChange.bind(this);
		this.handleMemberChange = this.handleMemberChange.bind(this);
		this.handleShowAll = this.handleShowAll.bind(this);
	}

	componentDidMount() {
		this.fetchData(this.state.year,this.state.member);
	}

	fetchData(year,member,showAll) {
		let params = {year};
		if(member && !showAll){
			params.member = member.id;
		}

		axios.get('/api/individual-report/',{params}).then(res=>{
			this.updateData(res.data);
		})
	}

	updateData(data) {
		let d = {}
		let members = [];
		data.forEach(o=>{
			if (!d[o.member]){
				members.push(o.member);
				d[o.member] = {first_name: o.member__first_name,middle_name: o.member__middle_name,last_name: o.member__last_name};
			}

			d[o.member][o.period__month] = o.total;
		})
		this.setState({data: d,members});
	}

	handleYearChange(e){
		this.setState({year: e.target.value});
		this.fetchData(e.target.value,this.state.member,this.state.showAll);
	}

	handleMemberChange(member) {
		let filterError = false;
		if(this.state.showAll){
			filterError = true;
		} else{
			this.fetchData(this.state.year,member,this.state.showAll);
		}
		this.setState({member,filterError});
	}

	handleShowAll(e) {
		this.setState({showAll: e.target.checked,filterError: false});
		
		if(e.target.checked)
			this.fetchData(this.state.year,this.state.member,true);
		else
			this.fetchData(this.state.year,this.state.member,false)
	}

	render() {
		return <div>
				<div className={`alert alert-danger ${this.state.filterError ? 'show' : 'hide'}`} role="alert">
					Please uncheck the 'All' checkbox to enable individual name search
				</div>
				<h2 className="text-center">Individual Report</h2>
				<div className="row">
					<form>
						<div className="form-group">
							<label className="col-sm-1 control-label">Year</label>
							<div className="col-sm-3">
								<select onChange={this.handleYearChange} value={this.state.year} className="form-control">
									{this.years.map((y,i)=><option key={i} value={y}>{y}</option>)}
								</select>
							</div>
						</div>
						<div className="form-group">
							<label className="col-sm-1 control-label">Name</label>
							<div className="col-sm-4">
								<NameSearchInput userSelected={this.handleMemberChange}/>
							</div>
						</div>
						<div className="form-group">
							<label className="col-sm-1 control-label">All</label>
							<div className="col-sm-2" >
								<input type="checkbox" checked={this.state.showAll} onChange={this.handleShowAll} />
							</div>
						</div>
					</form>
				</div>
				<table className="table table-responsive table-striped">
					<thead>
						<tr>
							<th>First Name</th>
							<th>Middle Name</th>
							<th>Last Name</th>
							{this.months.map((m,i)=> <th key={i}>{m}</th>)}
							<th>Total (KSH)</th>
						</tr>
					</thead>
					<tbody>
						{this.state.members.map((v,i)=>{
							let total = 0;
							return <tr key={v}>
									<td>{this.state.data[v].first_name}</td>
									<td>{this.state.data[v].middle_name}</td>
									<td>{this.state.data[v].last_name}</td>
									{this.monthsArray.map((m,i)=>{
										total += this.state.data[v][i+1] || 0;
										return <td key={i}>{this.state.data[v][i+1] || 0}</td>
									})}
									<td>{total}</td>
								</tr>
						})}
					</tbody>
				</table>
			</div>
	}
}