import React, {Component} from 'react';
import axios from 'axios';
import {withRouter} from 'react-router-dom';
import PersonalDetailsForm from './PersonalDetailsForm';
import ConfirmAction from './ConfirmAction';

class PersonalDetails extends Component {
  form = React.createRef();
  confirm = React.createRef();
	emptyData = {children: [],first_name: '', middle_name: '', last_name: '',
  	id_no: '', address: '',code: '', city: '', mobile_no: '', email: '', nhif_no: '',
  	father_first_name: '',father_middle_name: '',father_last_name: '',
  	mother_first_name: '',mother_middle_name: '',mother_last_name: '', suspended: false, dummy: false, salutation: '', gender: 'M',dob: ''};
	constructor(props) {
    super(props);

    this.state = {loading:false,data: {...this.emptyData}, error: {},saved: false};
  }

  componentDidMount() {
  	if(this.props.match.params.id){
  		axios.get(`/api/members/${this.props.match.params.id}`).then(response => {
  			this.setState({data: response.data});
  		})
  	}
  	
  }

  validateDate(date) {
    let d = new Date(date.split('/').reverse().join('/'));
    return d.getDate() ? true : false
  }

  validateChildren(children) {
    let children_error = {}
    children.forEach((v,i)=>{
      let e = {};
      if(!v.first_name){
        e['first_name'] = 'This field is required';
      }
      if(!v.middle_name){
        e['middle_name'] = 'This field is required';
      }
      if(!v.dob || !this.validateDate(v.dob)){
        e['dob'] = 'This field is required';
      }
      if(Object.keys(e).length)
        children_error[i] = e;
    })

    return children_error;
  }

  validateSpouseDetails(details) {
    let error = {}
    if(!details.first_name)
      error['first_name'] = 'This field is required';
    if(!details.middle_name)
      error['middle_name'] = 'This field is required';
    if(!details.last_name)
      error['last_name'] = 'This field is required';
    if(!details.id_no)
      error['id_no'] = 'This field is required';
    if(!details.mobile_no)
      error['mobile_no'] = 'This field is required';

    return error;
  }

  validate(data) {

    let error = {}
    if(!data.first_name)
      error['first_name'] = 'This field is required';
    if(!data.middle_name)
      error['middle_name'] = 'This field is required';
    if(!data.last_name)
      error['last_name'] = 'This field is required';
    if(!data.id_no)
      error['id_no'] = 'This field is required';
    if(!data.mobile_no)
      error['mobile_no'] = 'This field is required';
    if(!data.dob || !this.validateDate(data.dob))
      error['dob'] = 'This field is required';

    let children_error = this.validateChildren(data.children)
    if(Object.keys(children_error).length)
      error['children'] = children_error;

    if(data.married){
      if(data.spouse_details) {
        let spouse_error = this.validateSpouseDetails(data.spouse_details);
        if(Object.keys(spouse_error).length)
          error.spouse_details = spouse_error;
      } else {
        if(!data.spouse){
          error.spouse_details = {'spouse': 'This field is required'};
        }
      }
    }

    return error;
  }

  submit(){
    let data = this.form.current.getData();
    let error = this.validate(data);
    if(Object.keys(error).length){
      this.setState({error});
      window.scrollTo(0,0);
      return Promise.reject()
    }

    this.setState({loading: true})
    return this.confirm.current.show().then(_=>{
      let id = this.props.match.params.id;
      if(id){
        return axios.put(`/api/members/${id}/`,data).then(response=>{
          this.setState({data: response.data});
          return response;
        },error=>(this.setState({error: error.response.data}),Promise.reject(error.response.data))).finally(_=>window.scrollTo(0,0));
      }else {
        return axios.post('/api/members/',data).then(response=>{
          this.setState({data: response.data});
          return response;
        },error=>(this.setState({error: error.response.data}),Promise.reject(error.response.data))).finally(_=>window.scrollTo(0,0));
      }
    }).finally(_=>this.setState({loading:false}))
  }

  apply(){
  	this.submit().then(res=>this.setState({data: res.data,error: {},saved: true}));
    setTimeout(_=>this.setState({saved: false}),4000);
  }

  save(){
  	this.submit().then(()=>this.props.history.push('/home/members'));
  }

  save_continue(){
  	this.submit().then( ()=> this.setState({data: {...this.emptyData},error: {},saved: true}));
    setTimeout(_=>this.setState({saved: false}),4000);
  }

  close(){
  	this.props.history.push('/home/members');
  }

	render() {
		let id = this.props.match.params.id;
		let data = this.state.data;
		return (
			<div>
        <div className={`alert alert-success ${this.state.saved ? 'show' : 'hide'}`} role="alert">
          Successfully saved
        </div>
        <div className={`alert alert-danger ${Object.keys(this.state.error).length ? 'show' : 'hide'}`} role="alert">
          Missing required fields
        </div>
        <ConfirmAction ref={this.confirm} yesLabel="Save" noLabel="Cancel" title="Saving">
          <p>Do you want to save changes</p>
        </ConfirmAction>
				<PersonalDetailsForm ref={this.form} data={this.state.data} error={this.state.error} />
        <form>
        {id ? <div>
              <div className="col-sm-offset-6 col-sm-2">
                <input onClick={this.apply.bind(this)} type="button" value="APPLY" disabled={this.state.loading?true:false} className="btn btn-success" />
              </div>
              <div className="col-sm-2">
                <input onClick={this.save.bind(this)} type="button" value="SAVE" disabled={this.state.loading?true:false} className="btn btn-primary" />
              </div>
              <div className="col-sm-2">
                <input onClick={this.close.bind(this)} type="button" value="CLOSE" disabled={this.state.loading?true:false} className="btn btn-warning" />
              </div>
            </div> : <div className="form-group">
              <div className="col-sm-offset-4 col-sm-2">
                <input onClick={this.save.bind(this)} type="button" value="SAVE" disabled={this.state.loading?true:false} className="btn btn-success" />
              </div>
              <div className="col-sm-4">
                <input onClick={this.save_continue.bind(this)} type="button" value="SAVE AND CONTINUE" disabled={this.state.loading?true:false} className="btn btn-primary" />
              </div>
              <div className="col-sm-2">
                <input onClick={this.close.bind(this)} type="button" value="CLOSE" disabled={this.state.loading?true:false} className="btn btn-warning" />
              </div>
            </div>}
        </form>
			</div>
			);
	}
};

export default withRouter(PersonalDetails);