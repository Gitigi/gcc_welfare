import React, {Component} from 'react';
import axios from 'axios';
import Pagination from './Pagination';
import ExportButton from './ExportButton';
import {getPaginatedData} from './utility';

export default class ContributionVsClaim extends Component {
	state = {error:{},loading:false,data: {contribution: []}}
	componentDidMount() {
		this.fetchData();
	}

	fetchData(page=1) {
		this.setState({loading:true})
		axios.get('/api/contribution-vs-claim').then(res=>this.setState({data: res.data}),
			error=>this.setState({error:error.response.data})).finally(_=>this.setState({loading:false}))
	}

	getData() {
		let rows = [['Year','Contribution','Claim','Remainder']]
		let contribution = this.state.data.contribution;
		for(let i = 0; i < contribution.length; i++){
			let claim = this.getYearClaim(contribution[i].period__year)
			rows.push([contribution[i].period__year,contribution[i].total,claim,contribution[i].total-claim])
		}
		let filename = 'Contribuion VS Claim';
		return {rows,filename};
	}

	getYearClaim(year){
		let amount = 0;
		if(this.state.data.claim){
			let claim = this.state.data.claim.find(c=>c.date__year === year);
			amount = claim ? claim.total : 0;
		}
		return amount
	}

	render() {
		return <div>
				<div className={`alert alert-danger alert-dismissible ${this.state.error.detail ? 'show' : 'hide'}`} role="alert">
          <a href="#" className="close" data-dismiss="alert" aria-label="close">&times;</a>
          {this.state.error.detail}
        </div>
				<h2 className="text-center">Contribution VS Claim Report <i className={`fa fa-circle-o-notch fa-spin fa-fw ${this.state.loading ? '' : 'fade'}`}></i> </h2>
				<table className="table table-responsive table-striped">
					<thead>
						<tr>
							<th>Year</th>
							<th>Contribution(Ksh)</th>
							<th>Claim(Ksh)</th>
							<th>Remainder(Ksh)</th>
						</tr>
					</thead>
					<tbody>
						{this.state.data.contribution.map(c=>{
							return <tr key={c.period__year}>
									<td>{c.period__year}</td>
									<td>{c.total}</td>
									<td>{this.getYearClaim(c.period__year)}</td>
									<td>{c.total - this.getYearClaim(c.period__year)}</td>
								</tr>
						})}
					</tbody>
				</table>
				<ExportButton data={this.getData.bind(this)}/>
			</div>
	}
}