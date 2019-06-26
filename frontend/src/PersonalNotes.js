import React, {Component} from 'react';
import axios from 'axios';

export default class PersonalNotes extends Component {
	state = {note: '',sent: false, notes: []}

	componentDidMount() {
		axios.get('/api/notes/',{params: {member: this.props.match.params.id}}).then(res=>this.setState({notes: res.data}))
	}

	handleChange(e){
		this.setState({note: e.target.value});
	}

	save(){
		if(this.state.note){
			axios.post('/api/notes/',{member: this.props.match.params.id, note: this.state.note}).then(res=>{
				let notes = this.state.notes.splice(0);
				notes.push(res.data);
				this.setState({sent: true, note: '',notes})
				setTimeout(_=>this.setState({sent: false}),2000);
			})
		}
	}

	render() {
		return <div>
				<div className={`alert alert-success ${this.state.sent ? 'show' : 'hide'}`} role="alert">
					Successfully saved the note
				</div>
				<form className="form-horizontal">
					<div className="form-group">
						<label htmlFor="inputNote" className="col-sm-2 control-label">Note</label>
				    <div className="col-sm-10">
				      <textarea onChange={this.handleChange.bind(this)} value={this.state.note} className="form-control" id="inputNote" placeholder="enter note"></textarea>
				    </div>
					</div>
					<div className="col-sm-offset-4 col-sm-4">
						<input type="button" className="form-control btn btn-primary" value="SAVE" onClick={this.save.bind(this)} />
					</div>
					<div className="clearfix" />
				</form>

				<div><h3>Saved Notes</h3></div>
				<table className="table table-striped table-responsive">
					<thead>
						<tr>
							<th>Date</th>
							<th>Note</th>
						</tr>
					</thead>
					<tbody>
						{this.state.notes.map(n=>{
							return <tr key={n.id}>
									<td>{n.date}</td>
									<td>{n.note}</td>
								</tr>
						})}
					</tbody>
				</table>

			</div>
	}
}