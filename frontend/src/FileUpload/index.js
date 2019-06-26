import React, { Component } from 'react';
import axios from 'axios'
import './file-upload.css';

import uploadFile from './upload-file'

class FileUpload extends Component {
  supportFormData = !!window.FormData;
  fileCount = 0;
  progress = {loaded: 0,total: 0, count: 0, percentage: 0};
  constructor(props){
    super(props);
    
    this.form = React.createRef();
    this.fileContainer = React.createRef();
    this.framesContainer = React.createRef();
    this.files = [];
    
    this.state = {'files' : [],processing: false,dummy: 0};
    
    this.fileAdded = this.fileAdded.bind(this);
  }
  
  triggerRender = ()=>{
    this.setState((prev,props)=>{
      return {'dummy': ++prev.dummy};
    })
  }
  
  replaceFileWithUpload(file,uploadedFile){
    this.setState((prev,props)=>{
      let f = prev.files.find((item)=> item.index === file.index);
      let index = prev.files.indexOf(f);
      prev.files[index] = uploadedFile;
      prev.files[index].index= file.index;
    })
  }
  
  removeFile(file){
    this.setState((prev,props)=>{
      let f = prev.files.find((item)=> item.index === file.index);
      let index = prev.files.indexOf(f);
      prev.files.splice(index,1);
      return {'files': prev.files};
    })
  }
  
  pushFiles(files){
    this.setState((prev,props)=>{
      files.forEach(file=>prev.files.push(file));
      return {'files': prev.files};
    })
  }
  
  fileAdded(){
    this.setState({processing: true})
    this.processFile(this.fileContainer.current.getElementsByTagName('input')[0])
    this.setState({processing: false})
  }
  
  processFile(input){
    var self = this;
    let files = uploadFile(input,this.props.uploadUrl)
    files.forEach(file=>{
      file.onUploadProgress = self.onUploadProgress.bind(this);
      file['percentageUpload'] = 0;
      this.setUploadMethods(file);
      if(self.props.onfileadded) self.props.onfileadded(file);
    })
    this.pushFiles(files);
  }
  
  onUploadProgress = (file,event)=>{
    file.percentageUpload = Math.round(100 * event.loaded / event.total);
    this.progress.loaded += event.loaded;
    this.progress.percentage = Math.round(100 * this.progress.loaded / this.progress.total);
    this.triggerRender();
  }
  
  setUploadMethods(file){
    var self = this;
    file['$submit'] = function(){
      file['state'] = 'pending'
      self.active = true;
      self.progress.count += 1;
      self.progress.total += file.size;
      file.submit().then((response)=>{
        file.state = 'received';
        if(!(--self.progress.count)){
          self.active = false;
          setTimeout(self.progress.percentage = 0);
        }
        self.props.removeOnLoad ? self.removeFile(file) : self.replaceFileWithUpload(file,response['files'][0]);
        self.triggerRender();
        if(self.props.onfilesent)
          self.props.onfilesent(response['files'][0]);
      },error=>{
        if(!(--self.progress.count)){
          self.active = false;
          setTimeout(self.progress.percentage = 0);
        }
        self.triggerRender();
      });
    }
    
    file['$cancel'] = function(){
      self.removeFile(file);
    }
  }
  
  deleteFile = (file)=>{
    var self = this;
    file.state = 'pending'
    file.percentageUpload = 100;
    axios.delete(file.deleteUrl).then(response=>{
      self.setState((prev,props)=>{
        let index = prev.files.indexOf(file);
        prev.files.splice(index,1)
        return {'files': prev.files};
      })
    },error=>{
      file.state = 'rejected';
      file.percentageUpload=100;
      return Promise.reject(error)
    })
  }
  
  applyOnQueue(method){
		var self = this;
		var list = self.state.files.slice(0),
			i,
			file;
		for (i = 0; i < list.length; i += 1) {
			file = list[i];
			if (file[method]) {
				file[method]();
			}
		}
	}
	
	submit(){
		this.applyOnQueue('$submit');
	}
	
	cancel(){
		this.applyOnQueue('$cancel');
	}
  
  render() {
    return (
      <div>
      <form ref={this.form} onChange={this.fileAdded} method="post" encType="multipart/form-data"
        className={this.state.processing ? 'fileupload-processing': undefined}>
        
        <input type='hidden' name='csrfmiddlewaretoken' value={this.csrftoken} />
        <div className="row fileupload-buttonbar">
            <div className="col-lg-7">
                <span className="fileinput-button"  ref={this.fileContainer}>
                    {this.props.addButton || <span className='btn btn-success'>
                      <i className="glyphicon glyphicon-plus"/>Add files...
                    </span>}
                    <input type="file" name="file" multiple={!!this.supportFormData && 'multiple'} />
                </span>
                {this.state.files.length !== 0  && <button type="button" className="btn btn-primary start" onClick={this.submit.bind(this)}>
                    <i className="glyphicon glyphicon-upload"></i>
                    <span>Start upload</span>
                </button>}
                {this.state.files.length !== 0 && <button type="button" className="btn btn-warning cancel" onClick={this.cancel.bind(this)}>
                    <i className="glyphicon glyphicon-ban-circle"></i>
                    <span>Cancel upload</span>
                </button>}
                <div className="fileupload-loading"></div>
            </div>
            <div className={`col-lg-5 ${!this.active ? 'fade': ''}`}>
                <div className='progress progress-striped active'>
                    <div className='progress-bar progress-bar-success'
                        style={{'width':this.progress.percentage + '%',"display": "block"}}></div>
                </div>
                <div className="progress-extended">&nbsp;</div>
            </div>
        </div>
    </form>
        <FilePreview files={this.state.files} deleteFile={this.deleteFile.bind(this)} />
      <div ref={this.framesContainer} />
    </div>
    );
  }
}


class FilePreview extends Component{
  formatSize(bytes) {
    let units = [
      {size: 1000000000, suffix: ' GB'},
      {size: 1000000, suffix: ' MB'},
      {size: 1000, suffix: ' KB'}
    ];
    
    var unit = true,
      i = 0,
      prefix,
      suffix;
    while (unit) {
      unit = units[i];
      prefix = unit.prefix || '';
      suffix = unit.suffix || '';
      if (i === units.length - 1 || bytes >= unit.size) {
        return prefix + (bytes / unit.size).toFixed(2) + suffix;
      }
      i += 1;
    }
  }

  deleteFile(file,e){
    this.props.deleteFile(file);
  }

  render(){
      let files =  this.props.files.map((file)=>{
          return (
      <tr key={file.index}>
          <td>
              {!!file.thumbnailUrl && <div className="preview">
                  <a href={file.url } title={ file.name } download={ file.name }
                     data-gallery><img src={ file.thumbnailUrl } alt="" /></a>
              </div>}
              {!!file.preview && <div className='preview'>{file.preview}</div>}
          </td>
          <td>
              <p className="name">
                {!!file.url ? (<span >
                  <a href={ file.url } title={ file.name }
                                 download={ file.name } data-gallery>{file.name}</a>
                </span>)
                              : (<span>{file.name}</span>)}
              </p>
              {!!file.error && <div><span className="label label-important">Error</span> {file.error}</div>}
          </td>
          <td>
              <p className="size">{this.formatSize(file.size)}</p>
              <div className={`progress progress-striped active ${file.state !== 'pending'? 'fade':''}`} >
                  <div className='progress-bar progress-bar-success'
                      style={{'width': file.percentageUpload + '%'}}></div>
              </div>
          </td>
          <td>
              {!!file.$submit && <button type="button" className="btn btn-primary start" onClick={file.$submit} >
                  <i className="glyphicon glyphicon-upload"></i>
                  <span>Start</span>
              </button>}
              {!!file.$cancel && <button type="button" className="btn btn-warning cancel" onClick={file.$cancel}>
                  <i className="glyphicon glyphicon-ban-circle"></i>
                  <span>Cancel</span>
              </button>}
              {!!file.url && <button  type="button" className="btn btn-danger destroy" 
                  onClick={this.deleteFile.bind(this,file)} >
                      <i className="glyphicon glyphicon-trash"></i><span>Delete</span>
              </button>}
          </td>
      </tr>)
      })
    
    return <table className="table table-striped files"><tbody>{files}</tbody></table>
  }
}

export default FileUpload;

export {FileUpload,uploadFile}
