import React, {Component} from 'react';
import axios from 'axios';
import Pagination from './Pagination';
import ConfirmAction from './ConfirmAction';

export default class PersonalNotes extends Component {
	state = {loading:false,note: {note:''},sent: false, notes: {results: []}}
	confirmSave = React.createRef()
	confirmDelete = React.createRef()
	componentDidMount() {
		axios.get('/api/notes/',{params: {member: this.props.match.params.id}}).then(res=>this.setState({notes: res.data}))
	}

	fetchData(page=1) {
		axios.get('/api/notes/',{params: {page,member: this.props.match.params.id}}).then(res=>this.setState({notes: res.data}))
	}

	handleChange(e){
		let value = e.target.value;
		this.setState(state=>(state.note.note=value,state));
	}

	save(){
		if(this.state.note.note){
			this.confirmSave.current.show().then(_=>{
				this.setState(this.setState({loading:true}))
				if(this.state.note.id){
					axios.put('/api/notes/'+this.state.note.id+'/',this.state.note).then(res=>{
						this.fetchData();
						this.setState({note: {note: ''},sent: true})
						setTimeout(_=>this.setState({sent: false}),2000);
					}).finally(_=>this.setState({loading:false}))
				}else{
					axios.post('/api/notes/',{member: this.props.match.params.id, note: this.state.note.note}).then(res=>{
						this.fetchData()
						this.setState({note: {note: ''},sent: true})
						setTimeout(_=>this.setState({sent: false}),2000);
					}).finally(_=>this.setState({loading:false}))
				}
			})
		}
	}

	delete(){
		if(this.state.note.id){
			this.setState({loading:true})
			this.confirmDelete.current.show().then(_=>{
				axios.delete('/api/notes/'+this.state.note.id+'/').then(res=>{
					this.fetchData();
					this.setState({note: {note: ''}})
				}).finally(_=>this.setState({loading:false}))
			})
		}
	}

	handleNoteClick(note) {
		this.setState({note});
	}

	gotoPage(page) {
		this.fetchData(page);
	}

	render() {
		return <div>
				<div className={`alert alert-success ${this.state.sent ? 'show' : 'hide'}`} role="alert">
					Successfully saved the note
				</div>
				<ConfirmAction ref={this.confirmSave} yesLabel="Save" noLabel="Cancel" title="Saving">
          <p>Do you want to save note</p>
        </ConfirmAction>
        <ConfirmAction ref={this.confirmDelete} yesLabel="Delete" noLabel="Cancel" title="Deleting...">
          <p>Do you want to delete note?</p>
          <h3>Note</h3>
          <p>{this.state.note.note}</p>
          <p>{this.state.note.date}</p>
        </ConfirmAction>
				<form className="form-horizontal">
					<div className="form-group">
						<label htmlFor="inputNote" className="col-sm-2 control-label">Note</label>
				    <div className="col-sm-10">
				      <textarea onChange={this.handleChange.bind(this)} value={this.state.note.note} className="form-control" id="inputNote" placeholder="enter note"></textarea>
				    </div>
					</div>
					<div className="col-sm-offset-4 col-sm-4">
						<input type="button" className="form-control btn btn-primary" value="SAVE" disabled={this.state.loading?true:false} onClick={this.save.bind(this)} />
					</div>
					{this.state.note.id && <div className="col-sm-2">
						<button type="button" className="form-control btn btn-danger" value="DELETE" disabled={this.state.loading?true:false} onClick={this.delete.bind(this)}>DELETE <i className="glyphicon glyphicon-trash" /></button>
					</div>}
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
						{this.state.notes.results.map(n=>{
							return <tr key={n.id}>
									<td><a onClick={this.handleNoteClick.bind(this,n)}>{n.date}</a></td>
									<td>{n.note}</td>
								</tr>
						})}
					</tbody>
				</table>
				<Pagination goto={this.gotoPage.bind(this)} data={this.state.notes} />
			</div>
	}
}