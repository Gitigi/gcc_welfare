import React, {Component} from 'react';
import axios from 'axios';
import './PersonalDetailsForm.css';
import NameSearchInput from './NameSearchInput';
import DateInput from './DateInput';
import ConfirmAction from './ConfirmAction';
import lodash from 'lodash';

export default class PersonalDetailsForm extends Component {
	confirm = React.createRef();

	emptyData = {children: [],first_name: '', middle_name: '', last_name: '',
  	id_no: '', address: '',code: '', city: '', mobile_no: '', email: '', nhif_no: '',
  	father_first_name: '',father_middle_name: '',father_last_name: '',
  	mother_first_name: '',mother_middle_name: '',mother_last_name: '', suspended: false, dummy: false, salutation: '', gender: 'M',dob: ''};

	constructor(props) {
    super(props);
    
    this.state = {married: false,age: '', spouse_is_member: true, child: {first_name: '', middle_name: '', dob: ''},localError: {},
  		spouse: '',spouse_is_member: 'yes',spouse_details: {first_name: '',middle_name: '',last_name: '',id_no: 0,mobile_no: ''},
  		data: {...this.emptyData},error: {},
  		fieldExpanded: {children: false, marriage: false, parents: false, account: false}};

  }

  componentDidMount() {
  	if(this.props.data) {
  		this.setState({data: {...this.state.data,...this.props.data},
				age: PersonalDetailsForm.calculateAge(this.props.data.dob),
  			married: this.props.data.spouse ? true : false,
  			spouse_is_member: this.props.data.spouse ? 'yes' : 'no', spouse: this.props.data.spouse})
  	}
  }

  componentDidUpdate(prevProps,prevState) {
		if(this.props.edit){
			if(!lodash.isEqual(this.props.data, prevProps.data)){
				this.setState({data: {...this.state.data,...this.props.data},
					age: PersonalDetailsForm.calculateAge(this.props.data.dob),
	  			married: this.props.data.spouse ? true : false,
	  			spouse_is_member: this.props.data.spouse ? 'yes' : 'no', spouse: this.props.data.spouse})
			}
		}
		if(!lodash.isEqual(this.props.error,prevProps.error)){
			this.setState({error: {...this.state.error,...this.props.error}})
		}
	}

  getData() {
  	let data = {...this.state.data};
  	data.married = this.state.married;
  	if(this.state.married){
  		if(this.state.spouse_is_member === 'yes')
  			data.spouse = this.state.spouse;
  		else
  			data.spouse_details = {...this.state.spouse_details}
  	}else{
  		data.spouse = null;
  	}

  	return data;
  }

	handleInput(field,event) {
  	let value = event.target.value;
  	this.setState(state => (state.data[field] = value,state));
  }

  handleGroupInput(field,index,event){
  	let value = this.state.data[field].split(':');
  	value[index] = event.target.value;
  	this.setState(state => (state.data[field] = value.join(':'), state));
  }

  handleNewChildInput(field,event){
  	let value = event.target.value;
  	this.setState(state=>(state.child[field]=value,state));
  }

  handleChildEdit(field,index,event) {
  	let children = this.state.data.children.splice(0);
  	children[index][field] = event.target.value;
  	this.setState(state=>(state.data.children = children,state))
  }

  handleDOBInput(e){
  	let date = e.target.value
		this.setState(state=>(state.data['dob'] = date,state));
		this.setState({age: PersonalDetailsForm.calculateAge(date)});
  }

  static calculateAge(date){
  	let today = new Date();
  	let dob = new Date(date);
  	let age;
  	if(dob.getDate()){
  		age = today.getFullYear() - dob.getFullYear();
  		let m = today.getMonth() - dob.getMonth();
  		if(m<0 || (m === 0 && today.getDate() < dob.getDate()))
  				age -= 1;
  	}else{
  		age = 'Invalid date of birth';
  	}

  	return age;
  }

  addChild(){
  	if(this.state.child.first_name && this.state.child.middle_name && this.state.child.dob){
  		//delete any error messesage on new child input
  		let e = {...this.state.localError};
  		delete e['child_first_name'];
  		delete e['child_middle_name'];
  		delete e['child_dob'];

  		let children = this.state.data.children.splice(0);
  		children.push({...this.state.child});
  		this.setState(state => (state.data.children = children,state.localError = e,
  			state.child = {first_name: '',middle_name: '', dob: ''},state));
  	}else {
  		let e = {}
  		if(!this.state.child.first_name){
  			e['child_first_name'] = 'This field is required';
  		}
  		if(!this.state.child.middle_name){
  			e['child_middle_name'] = 'This field is required';
  		}
  		if(!this.state.child.dob){
  			e['child_dob'] = 'This field is required';
  		}
  		this.setState({localError: e});
  	}
  }

  removeChild(index){
  	let children = this.state.data.children.splice(0);
  	children.splice(index,1);
  	this.setState(state => (state.data.children = children,state));
  }

  handleMarried(e) {
  	this.setState({married: e.target.checked});
  }

  handleSuspend(e) {
  	let v = e.target.checked;
  	this.setState(state=>(state.data.suspended = v,state));
  }

  handleDummy(e) {
  	let v = e.target.checked;
  	this.setState(state=>(state.data.dummy = v,state));
  }

  handleSpouseMembership(e) {
  	this.setState({spouse_is_member: e.target.value})
  }

  handleSpouseSelect(member) {
  	console.log(member);
  	this.setState({spouse: member.id});
  }

  handleSpouseDetails(field,e){
  	let v = e.target.value
  	this.setState(state=>(state.spouse_details[field]=v,state))
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

  submit() {
  	let data = this.getData();
		let error = this.validate(data);
    if(Object.keys(error).length){
      this.setState({error});
      window.scrollTo(0,0);
      return Promise.reject()
    }

		return this.confirm.current.show().then(_=>{
			this.setState({loading:true});
			return this.props.submit(data).then(_=>{},error=>{
				window.scrollTo(0,0);
				console.log(error);
				this.setState({error: error.response.data});
				return Promise.reject(error.response.data);
			}).finally(_=>this.setState({loading:false}))
		})
	}

  save() {
		this.submit().then(res=>this.props.close());
	}

	saveContinue() {
		this.submit().then(()=>{
			window.scrollTo(0,0);
			this.setState({data: {...this.emptyData},age: '',error: {},saved: true})
			setTimeout(_=>this.setState({saved: false}),2000);
		})
	}

	apply() {
		this.submit().then(()=>{
			window.scrollTo(0,0);
			this.setState({error: {},saved: true})
			setTimeout(_=>this.setState({saved: false}),2000);
		})
	}

	toggleExpand(field,e) {
		e.target.classList.toggle("fa-plus");
		e.target.classList.toggle("fa-minus");
		let expanded = this.state.fieldExpanded[field] ? false : true;
		this.setState(state=>(state.fieldExpanded[field]=expanded,state));
	}


	render() {
		let id = this.props.id;
		let data = this.state.data;
		let error = this.state.error;
		let childrenError = error.children || {};
		let spouseDetailsError = error.spouse_details || {}
		return (
			<div>
				<div className={`alert alert-success ${this.state.saved ? 'show' : 'hide'}`} role="alert">
          Successfully saved
        </div>
        <div className={`alert alert-danger alert-dismissible ${this.state.error.detail ? 'show' : 'hide'}`} role="alert">
          <a href="#" className="close" data-dismiss="alert" aria-label="close">&times;</a>
          {this.state.error.detail}
        </div>
        <div className={`alert alert-danger ${Object.keys(this.state.error).length && !this.state.error.detail ? 'show' : 'hide'}`} role="alert">
          Missing required fields
        </div>
        <ConfirmAction ref={this.confirm} yesLabel="Save" noLabel="Cancel" title="Saving">
          <p>Do you want to save changes</p>
        </ConfirmAction>

				<form className="form-horizontal" >
				<fieldset>
					<legend>Personal Details:</legend>
					<div className="form-group col-sm-6">
						<label htmlFor="inputSalutation" className="col-sm-3 control-label">Salutation</label>
						<div className="col-sm-9">
				    	<select value={this.state.data.salutation} onChange={this.handleInput.bind(this,'salutation')} className="form-control" id="inputSalutation">
				    		<option></option>
				    		<option>Dr</option>
				    		<option>Mr</option>
				    		<option>Mrs</option>
				    		<option>Ms</option>
				    		<option>Pastor</option>
				    		<option>Apostle</option>
				    		<option>Bishop</option>
				    		<option>Elder</option>
				    		<option>Deacon</option>
				    	</select>
				    </div>
				  </div>
				  <div className={`form-group col-sm-6 ${error.first_name ? 'has-error': ''}`}>
				    <label htmlFor="inputFirstname" className="col-sm-3 control-label">First Name</label>
						<div className="col-sm-9">
					      <input value={this.state.data.first_name} onChange={this.handleInput.bind(this,'first_name')} type="text" className="form-control" id="inputFirstname" />
					      {error.first_name && <span className="glyphicon glyphicon-remove form-control-feedback"></span>}
				    </div>
					</div>

					<div className={`form-group col-sm-6 ${error.middle_name ? 'has-error': ''}`}>
						<label htmlFor="inputMiddlename" className="col-sm-3 control-label">Middle Name</label>
				    <div className="col-sm-9">
				      <input value={this.state.data.middle_name} onChange={this.handleInput.bind(this,'middle_name')} type="text" className="form-control" id="inputMiddlename" />
				      {error.middle_name && <span className="glyphicon glyphicon-remove form-control-feedback"></span>}
				    </div>
				  </div>
				  <div className={`form-group col-sm-6 ${error.last_name ? 'has-error': ''}`}>
				    <label htmlFor="inputLastname" className="col-sm-3 control-label">Last Name</label>
				    <div className="col-sm-9">
				      <input value={this.state.data.last_name} onChange={this.handleInput.bind(this,'last_name')} type="text" className="form-control" id="inputLastname"  />
				      {error.last_name && <span className="glyphicon glyphicon-remove form-control-feedback"></span>}
				    </div>
					</div>

					<div className={`form-group col-sm-6 ${error.id_no ? 'has-error': ''}`}>
						<label htmlFor="inputIdNo" className="col-sm-3 control-label">ID Number</label>
						<div className="col-sm-9">
				      <input value={this.state.data.id_no} onChange={this.handleInput.bind(this,'id_no')} type="text" className="form-control" id="inputIdNo" />
				      {error.id_no && <span className="glyphicon glyphicon-remove form-control-feedback"></span>}
				    </div>
				  </div>
				  <div className={`form-group col-sm-6 ${error.mobile_no ? 'has-error': ''}`}>
				    <label htmlFor="inputMobileNo" className="col-sm-3 control-label">Mobile Number</label>
						<div className="col-sm-9">
				      <input value={this.state.data.mobile_no} onChange={this.handleInput.bind(this,'mobile_no')} type="text" className="form-control" id="inputMobileNumber" />
				      {error.mobile_no && <span className="glyphicon glyphicon-remove form-control-feedback"></span>}
				    </div>
					</div>

					<div className={`form-group col-sm-6 ${error.gender ? 'has-error': ''}`}>
						<label htmlFor="inputGender" className="col-sm-3 control-label">Gender</label>
						<div className="col-sm-9">
							<select value={this.state.data.gender} onChange={this.handleInput.bind(this,'gender')} className="form-control">
								<option value="M">Male</option>
								<option value="F">Female</option>
							</select>
						</div>
					</div>
					<div className={`form-group col-sm-6 ${error.dob ? 'has-error': ''}`}>
						<label htmlFor="inputDOB" className="col-sm-3 control-label">Date of Birth</label>
						<div className="col-sm-5">
				      <DateInput value={this.state.data.dob} onChange={this.handleDOBInput.bind(this)} type="text" className="form-control" id="inputDOB" placeholder="dd/mm/year" />
				      {error.dob && <span className="glyphicon glyphicon-remove form-control-feedback"></span>}
				    </div>
				    <label className="col-sm-2 control-label">Age</label>
						<div className="col-sm-2">
				      <p className="form-control-static">{this.state.age}</p>
				    </div>
					</div>

					<div className="form-group col-sm-4">
						<label htmlFor="inputPostalAddr" className="col-sm-5 control-label">Address</label>
						<div className="col-sm-7">
				      <input value={this.state.data.address} onChange={this.handleInput.bind(this,'address')} type="text" className="form-control" id="inputPostalAddr" />
				    </div>
				  </div>
				  <div className="form-group col-sm-4">
				    <label htmlFor="inputPostalCode" className="col-sm-5 control-label">Code</label>
						<div className="col-sm-7">
				      <input value={this.state.data.code} onChange={this.handleInput.bind(this,'code')} type="text" className="form-control" id="inputPostalAddr" />
				    </div>
				  </div>
				  <div className="form-group col-sm-4">
				    <label htmlFor="inputPostalCity" className="col-sm-5 control-label">City</label>
						<div className="col-sm-7">
				      <input value={this.state.data.city} onChange={this.handleInput.bind(this,'city')} type="text" className="form-control" id="inputPostalAddr"  />
				    </div>
					</div>

					<div className="form-group col-sm-6">
						<label htmlFor="inputEmailAddr" className="col-sm-3 control-label">Email Address</label>
						<div className="col-sm-9">
				      <input value={this.state.data.email} onChange={this.handleInput.bind(this,'email')} type="text" className="form-control" id="inputEmailAddr" />
				    </div>
				  </div>
				  <div className="form-group col-sm-6">
				    <label htmlFor="inputNhifNO" className="col-sm-3 control-label">NHIF Number</label>
						<div className="col-sm-9">
				      <input value={this.state.data.nhif_no} onChange={this.handleInput.bind(this,'nhif_no')} type="text" className="form-control" id="inputNhifNO" />
				    </div>
					</div>
					</fieldset>

					<fieldset>
					<legend><i onClick={this.toggleExpand.bind(this,'marriage')} className={`fa fa-${this.state.fieldExpanded.marriage ? "minus": "plus"}`} /> Marriage Details:</legend>
					<div className={`${!this.state.fieldExpanded.marriage ? "hide": ""}`}>
						<div className="form-group">
							<label htmlFor="inputMarried" className="col-sm-2 control-label">Married</label>
							<div className="col-sm-10">
					      <input type="checkbox" checked={this.state.married} onChange={this.handleMarried.bind(this)}/>
					    </div>
						</div>

						{this.state.married === true && <>
							<div className="row">
								<p className="col-sm-offset-1 col-sm-3 form-control-static">Is spouse member of the welfare?</p>
								<div className="form-group col-sm-2">
									<label className="control-label col-sm-4">Yes</label>
									<div className="col-sm-1">
										<input className="form-control" type="radio" name='spouse_is_member' value='yes'
											onChange={this.handleSpouseMembership.bind(this)} checked={this.state.spouse_is_member === 'yes'}/>
									</div>
								</div>
								<div className="form-group col-sm-2">
									<label className="control-label col-sm-4">No</label>
									<div className="col-sm-1">
										<input className="form-control" type="radio" name='spouse_is_member' value='no'
											onChange={this.handleSpouseMembership.bind(this)} checked={this.state.spouse_is_member === 'no'}/>
									</div>
								</div>
							</div>
							{this.state.spouse_is_member === 'no' && <div>
								<div className={`form-group col-sm-4 ${spouseDetailsError && spouseDetailsError.first_name ? 'has-error': ''}`}>
									<label htmlFor="inputSFirstname" className="col-sm-5 control-label">Spouse's First Name</label>
									<div className="col-sm-7">
							      <input value={this.state.spouse_details.first_name} onChange={this.handleSpouseDetails.bind(this,'first_name')} type="text" className="form-control" id="inputSFirstname" />
							    </div>
							  </div>
							  <div className={`form-group col-sm-4 ${spouseDetailsError && spouseDetailsError.middle_name ? 'has-error': ''}`}>
							    <label htmlFor="inputSMiddlename" className="col-sm-5 control-label">Spouse's Middle Name</label>
							    <div className="col-sm-7">
							      <input value={this.state.spouse_details.middle_name} onChange={this.handleSpouseDetails.bind(this,'middle_name')} type="text" className="form-control" id="inputSMiddlename" />
							    </div>
							  </div>
							  <div className={`form-group col-sm-4 ${spouseDetailsError && spouseDetailsError.last_name ? 'has-error': ''}`}>
							    <label htmlFor="inputSLastname" className="col-sm-5 control-label">Spouse's  Last Name</label>
							    <div className="col-sm-7">
							      <input value={this.state.spouse_details.last_name} onChange={this.handleSpouseDetails.bind(this,'last_name')} type="text" className="form-control" id="inputSLastname" />
							    </div>
								</div>

								<div className={`form-group col-sm-6 ${spouseDetailsError && spouseDetailsError.id_no ? 'has-error': ''}`}>
									<label htmlFor="inputSpouseIdNo" className="col-sm-4 control-label">Spouse ID Number</label>
									<div className="col-sm-8">
							      <input value={this.state.spouse_details.id_no} onChange={this.handleSpouseDetails.bind(this,'id_no')} type="text" className="form-control" id="inputSpouseIdNo" />
							    </div>
							  </div>
							  <div className={`form-group col-sm-6 ${spouseDetailsError && spouseDetailsError.mobile_no ? 'has-error': ''}`}>
							    <label htmlFor="inputSpouseMobileNo" className="col-sm-5 control-label">Spouse Mobile Number</label>
									<div className="col-sm-7">
							      <input value={this.state.spouse_details.mobile_no} onChange={this.handleSpouseDetails.bind(this,'mobile_no')} type="text" className="form-control" id="inputSpouseMobileNo" />
							    </div>
								</div>
							</div>}

							{this.state.spouse_is_member === 'yes' && <div>
								<div className={`form-group ${spouseDetailsError && spouseDetailsError.spouse ? 'has-error': ''}`}>
									<label className="col-sm-4 control-label">Spouse Name</label>
									<div className="col-sm-5">
										<NameSearchInput userSelected={this.handleSpouseSelect.bind(this)} memberId={this.state.spouse} />
										<p className="text-info form-control-static">*ensure that spouse has already been registered as member</p>
									</div>
								</div>
							</div>}

						</>}
					</div>
					</fieldset>

					<fieldset>
					<legend><i onClick={this.toggleExpand.bind(this,'children')} className={`fa fa-${this.state.fieldExpanded.children ? "minus": "plus"}`} /> Children Details:</legend>
					<div className={`form-group ${!this.state.fieldExpanded.children ? "hide": ""}`}>
						<label htmlFor="inputCFirstname" className="col-sm-2 control-label">Children</label>
						<div>
							<div className="row">
								{this.state.data.children.map((child,index)=>(
									<div key={child.id} className="col-sm-12">
										<div className="row">
											<div className={`form-group col-sm-4 ${childrenError[index] && childrenError[index].first_name ? 'has-error': ''}`}>
												<label className="col-sm-3">First Name</label>
												<div className="col-sm-9">
										      <input value={this.state.data.children[index].first_name} onChange={this.handleChildEdit.bind(this,'first_name',index)} type="text" className="form-control" />
										    </div>
									    </div>
									    <div className={`form-group col-sm-4 ${childrenError[index] && childrenError[index].middle_name ? 'has-error': ''}`}>
									    	<label className="col-sm-3">Last name</label>
										    <div className="col-sm-9">
										      <input value={this.state.data.children[index].middle_name} onChange={this.handleChildEdit.bind(this,'middle_name',index)} type="text" className="form-control" />
										    </div>
									   	</div>
									   	<div className={`form-group col-sm-4 ${childrenError[index] && childrenError[index].dob ? 'has-error': ''}`}>
									    	<label className="col-sm-3">Date of Birth</label>
										    <div className="col-sm-9">
										      <DateInput value={this.state.data.children[index].dob} onChange={this.handleChildEdit.bind(this,'dob',index)} type="text" placeholder="dd/mm/year" className="form-control" />
										    </div>
									   	</div>
									    <div className="col-sm-1">
									      <button onClick={this.removeChild.bind(this,index)} type="button" className="form-control btn btn-danger btn-circle" id="inputAddChild"><i className="glyphicon glyphicon-remove"/></button>
									    </div>
								    </div>
									</div>)
								)}
							</div>
						</div>
						<div className="clearfix" />
						<div className="row">
							<div className={`form-group col-sm-4 ${this.state.localError.child_first_name ? 'has-error': ''}`}>
								<label className="col-sm-3">First Name</label>
								<div className="col-sm-9">
						      <input value={this.state.child.first_name} onChange={this.handleNewChildInput.bind(this,'first_name')} type="text" className="form-control" id="inputCFirstname" />
						    </div>
					    </div>
					    <div className={`form-group col-sm-4 ${this.state.localError.child_middle_name ? 'has-error': ''}`}>
					    	<label className="col-sm-3">Last name</label>
						    <div className="col-sm-9">
						      <input value={this.state.child.middle_name} onChange={this.handleNewChildInput.bind(this,'middle_name')} type="text" className="form-control" id="inputCMiddlename" />
						    </div>
					   	</div>
					   	<div className={`form-group col-sm-4 ${this.state.localError.child_dob ? 'has-error': ''}`}>
					    	<label className="col-sm-3">Date of Birth</label>
						    <div className="col-sm-9">
						      <DateInput value={this.state.child.dob} onChange={this.handleNewChildInput.bind(this,'dob')} type="text" placeholder="dd/mm/year" className="form-control" id="inputCMiddlename" />
						    </div>
					   	</div>
					    <div className="col-sm-1">
					      <button onClick={this.addChild.bind(this)} type="button" className="form-control btn btn-success btn-circle" id="inputAddChild"><i className="glyphicon glyphicon-plus"/></button>
					    </div>
				    </div>
					</div>
					</fieldset>

					<fieldset>
					<legend><i onClick={this.toggleExpand.bind(this,'parents')} className={`fa fa-${this.state.fieldExpanded.parents ? "minus": "plus"}`} /> Parents Details:</legend>
					<div className={`${!this.state.fieldExpanded.parents ? "hide": ""}`}>
						<div className="form-group col-sm-4">
							<label htmlFor="inputPFFirstname" className="col-sm-5 control-label">Father's First Name</label>
							<div className="col-sm-7">
					      <input value={this.state.data.father_first_name} onChange={this.handleInput.bind(this,'father_first_name')} type="text" className="form-control" id="inputPFFirstname" />
					    </div>
					  </div>
					  <div className="form-group col-sm-4">
					    <label htmlFor="inputPFMiddlename" className="col-sm-5 control-label">Father's Middle Name</label>
					    <div className="col-sm-7">
					      <input value={this.state.data.father_middle_name} onChange={this.handleInput.bind(this,'father_middle_name')} type="text" className="form-control" id="inputPFMiddlename" />
					    </div>
					  </div>
					  <div className="form-group col-sm-4">
					    <label htmlFor="inputPFLastname" className="col-sm-5 control-label">Father's Last Name</label>
					    <div className="col-sm-7">
					      <input value={this.state.data.father_last_name} onChange={this.handleInput.bind(this,'father_last_name')} type="text" className="form-control" id="inputPFLastname" />
					    </div>
						</div>

						<div className="form-group col-sm-4">
							<label htmlFor="inputPMFirstname" className="col-sm-5 control-label">Mother's First Name</label>
							<div className="col-sm-7">
					      <input value={this.state.data.mother_first_name} onChange={this.handleInput.bind(this,'mother_first_name')} type="text" className="form-control" id="inputPMFirstname" />
					    </div>
					  </div>
					  <div className="form-group col-sm-4">
					    <label htmlFor="inputPMMiddlename" className="col-sm-5 control-label">Mother's Middle Name</label>
					    <div className="col-sm-7">
					      <input value={this.state.data.mother_middle_name} onChange={this.handleInput.bind(this,'mother_middle_name')} type="text" className="form-control" id="inputPMMiddlename" />
					    </div>
					  </div>
					  <div className="form-group col-sm-4">
					    <label htmlFor="inputPMLastname" className="col-sm-5 control-label">Mother's Last Name</label>
					    <div className="col-sm-7">
					      <input value={this.state.data.mother_last_name} onChange={this.handleInput.bind(this,'mother_last_name')} type="text" className="form-control" id="inputPMLastname" />
					    </div>
						</div>
					</div>
					</fieldset>

					<fieldset>
					<legend><i onClick={this.toggleExpand.bind(this,'account')} className={`fa fa-${this.state.fieldExpanded.account ? "minus": "plus"}`} /> Account Details:</legend>
					<div className={`${!this.state.fieldExpanded.account ? "hide": ""}`}>
						<div className="form-group">
							<label htmlFor="inputSuspend" className="col-sm-2 control-label">Suspend Member</label>
							<div className="col-sm-10">
					      <input type="checkbox" checked={this.state.data.suspended} onChange={this.handleSuspend.bind(this)}/>
					    </div>
						</div>
						{this.state.data.dummy && <div className="form-group">
							<label className="col-sm-2 control-label">Dummy Member</label>
							<div className="col-sm-10">
					      <input type="checkbox" checked={this.state.data.dummy} onChange={this.handleDummy.bind(this)}/>
					    </div>
						</div>}
					</div>
					</fieldset>

					<div className="form-group">
	      		{this.props.edit ? <div className="col-sm-offset-6 col-sm-2">
	            <input onClick={this.apply.bind(this)} type="button" value="APPLY" disabled={this.state.loading?true:false} className="btn btn-primary" />
	          </div> : <div className="col-sm-offset-5 col-sm-3">
	            <input onClick={this.saveContinue.bind(this)} type="button" value="SAVE AND CONTINUE" disabled={this.state.loading?true:false} className="btn btn-primary" />
	          </div>}
	          <div className="col-sm-2">
	            <input onClick={this.save.bind(this)} type="button" value="SAVE" disabled={this.state.loading?true:false} className="btn btn-success" />
	          </div>
	          <div className="col-sm-2">
	            <input onClick={this.props.close} type="button" value="CLOSE" disabled={this.state.loading?true:false} className="btn btn-warning" />
	          </div>
	        </div>
					
				</form>
			</div>
			);
	}
}