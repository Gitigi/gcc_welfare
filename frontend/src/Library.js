import React, {Component} from 'react';
import FileUpload from './FileUpload';
import axios from 'axios';
import {WordIcon,ZipIcon,ImageIcon,PdfIcon,PowerPointIcon,SpreadSheetIcon,TextIcon} from './FileIcons';
import ConfirmAction from './ConfirmAction';
import Pagination from './Pagination';
import './Library.css';

export default class Library extends Component {
	state = {files: {results:[]},deleteFileName: ''}
	confirm = React.createRef();


	fileAdded(f) {
		this.fetchData()
	}

	componentDidMount() {
		this.fetchData();
	}

	fetchData(page){
		axios.get('/api/library',{params: {page}}).then(res=>this.setState({files: res.data}))
	}

	gotoPage(page) {
		this.fetchData(page);
	}

	getIcon(filename) {
		let extention = filename.substr(filename.lastIndexOf('.')+1)
		switch(extention.toLowerCase()){
			case 'jpg':
			case 'jpeg':
			case 'png':
				return ImageIcon;
			case 'pdf':
				return PdfIcon;
			case 'doc':
			case 'docx':
				return WordIcon;
			case 'xlsx':
				return SpreadSheetIcon;
			case 'pptx':
			case 'ppt':
				return PowerPointIcon;
			case 'zip':
			case '7zip':
			case 'tar':
			case 'xz':
				return ZipIcon;
			default:
				return TextIcon;
		}
		return TextIcon;
	}

	onDelete(f){
		let id = f.id
		this.setState({deleteFileName: f.file.substr(f.file.lastIndexOf('/')+1)})
		this.confirm.current.show().then(_=>{
			axios.delete('/api/library/'+id+'/').then(res=>{
				let files = this.state.files.filter(f=> f.id!==id);
				this.setState({files});
			})
		})
	}


	render() {
		return <div className="library">
				<h2 className="text-center">Library</h2>
				<ConfirmAction ref={this.confirm} yesLabel="Delete" noLabel="Cancel" title="Deleting...">
          <p>Do you want to delete this file</p>
          <p>{this.state.deleteFileName}</p>
        </ConfirmAction>
				<FileUpload onfilesent={this.fileAdded.bind(this)} uploadUrl="/api/library/" removeOnLoad={true}
          addButton={<span className='btn btn-success'><i className="glyphicon glyphicon-plus"/>Upload File</span>}>
        </FileUpload>
        <div className="row">
        	{this.state.files.results.map((f,i)=> <React.Fragment key={f.id}>
        		<div key={f.id} className="col-sm-3">
        		<div className="file-container">
	        		<img className="image" style={{width: "100%",height:"100%"}} src={this.getIcon(f.file)} alt="word" />
	        		<div className="file-control">
		        		<div className="file-control-buttons">
		        			<a href={f.file} download target="_blank" className="btn btn-success btn-circle btn-lg">
		        					<i className="fa fa-download"></i>
		        			</a>
		        			<button onClick={this.onDelete.bind(this,f)} type="button" className="btn btn-danger btn-circle btn-lg"><i className="fa fa-trash"></i></button>
		        		</div>
	        		</div>
        		</div>
        		<p style={{overflowWrap:"break-word"}}>{f.file.substr(f.file.lastIndexOf('/')+1)}</p>
        		</div>
        		{(i+1)%4==0 && <div className="clearfix" />}
        	</React.Fragment>)}
        </div>
        <div className="clearfix" />
        <Pagination goto={this.gotoPage.bind(this)} data={this.state.files} />
			</div>
	}
}