import React, {Component} from 'react';
import axios from 'axios';
import * as $ from 'jquery'
import './NameSearchInput.css'

var count = 0;
export default class NameSearchInput extends Component {
	constructor(props){
		super(props);

		this.ns = '.NameSearchInput-'+count++

		this.handleListItemClick = this.handleListItemClick.bind(this);
		this.handleMouseOver = this.handleMouseOver.bind(this);
	}
	state = {members: [],member: this.props.member || {},search: '',inputAddonClass: 'fa fa-search'}
	keys = {
      UP: 38,
      DOWN: 40,
      ENTER: 13,
      ESC: 27,
      PLUS: 43,
      A: 65,
      Z: 90,
      SPACE: 32,
      TAB: 9
    };
	nameList = React.createRef()
	input = React.createRef()
	nameDropdown = React.createRef()

	componentDidMount(){
		if(this.props.memberId)
			this.fetchMemberData(this.props.memberId);
		else
			this.fetchData();
	}

	componentDidUpdate(prevProp,prevState){
		if(this.props.member && this.props.member.id !== prevProp.member.id){
			let member = this.props.member,name= '';
			this._setMember(member);
		}
		
		if(this.props.memberId !== prevProp.memberId){
			axios.get(`/api/members/${this.props.memberId}/`).then(res=>{
				this._setMember(res.data);
			},_=>{})
		}
	}

	handleChange(e) {
		this.setState({search: e.target.value});
		this.fetchData(e.target.value);
		if(!e.target.value){
			this._memberSelect({})
		}
	}

	fetchData(name=''){
		this.setState({inputAddonClass: 'fa fa-circle-o-notch fa-spin fa-fw'})
		axios.get('/api/search-name/',{params: {name}}).then(res=>{
			this.setState({members: res.data})
		},error=>console.log(error.response.data)).
		finally(_=>this.setState({inputAddonClass: "fa fa-search"}))
	}

	fetchMemberData(id) {
		this.setState({inputAddonClass: 'fa fa-circle-o-notch fa-spin fa-fw'})
		axios.get(`/api/members/${this.props.memberId}/`).then(res=>{
				this._setMember(res.data);
		},_=>{}).
		finally(_=>this.setState({inputAddonClass: "fa fa-search"}))
	}

	handleFocus() {
		this._showDropdown();
	}

	handleBlur(e) {
		// this._closeDropdown();
	}

	handleKeyDown(e) {
		//ensure list is visible
		if(this.nameDropdown.current.classList.contains("hide")){
			this._showDropdown();
			e.preventDefault();
			return;
		}

		if (e.which === this.keys.UP || e.which === this.keys.DOWN) {
      // up and down to navigate
      this._handleUpDownKey(e.which);
    } else if (e.which === this.keys.ENTER) {
      // enter to select
      this._handleEnterKey(e);
    } else if (e.which === this.keys.ESC) {
      // esc to close
      this._closeDropdown();
    }
	}

	// highlight the next/prev item in the list (and ensure it is visible)
  _handleUpDownKey(key) {
    var current = $(this.nameList.current).children(".highlight").first();
    let next;
    if(current.length){
    	next = key === this.keys.UP ? current.prev() : current.next();
    }else{
    	next = $(this.nameList.current).children(":first");
    }

    if (next.length) {
      this._highlightListItem(next);
      this._scrollTo(next);
    }
  }

  // select the currently highlighted item
  _handleEnterKey(e) {
  	e.preventDefault();
    var currentCurrency = $(this.nameList.current).children(".highlight").first();
    if (!currentCurrency.length)
    	currentCurrency = $(this.nameList.current).children().first();
    if (currentCurrency.length) {
      this._selectListItem(currentCurrency);
      this._closeDropdown();
    }
  }

  _scrollTo(element,middle) {
  	element = $(element);
  	var container = $(this.nameList.current), containerHeight = container.height(), containerTop = container.offset().top, containerBottom = containerTop + containerHeight, elementHeight = element.outerHeight(), elementTop = element.offset().top, elementBottom = elementTop + elementHeight, newScrollTop = elementTop - containerTop + container.scrollTop(), middleOffset = containerHeight / 2 - elementHeight / 2;
    if (elementTop < containerTop) {
      // scroll up
      if (middle) {
        newScrollTop -= middleOffset;
      }
      container.scrollTop(newScrollTop);
    } else if (elementBottom > containerBottom) {
      // scroll down
      if (middle) {
        newScrollTop += middleOffset;
      }
      var heightDifference = containerHeight - elementHeight;
      container.scrollTop(newScrollTop - heightDifference);
    }
  }

	handleMouseOver(e) {
		if(e.target.classList.contains('name-item'))
			this._highlightListItem(e.target)
	}

	handleListItemClick(e){
		var currentCurrency = $(this.nameList.current).children(".highlight").first();
    if (currentCurrency.length) {
      this._selectListItem(currentCurrency);
      this._closeDropdown();
    }
	}

	// remove highlighting from other list items and highlight the given item
  _highlightListItem(listItem) {
    $(this.nameList.current.children).removeClass("highlight");
    $(listItem).addClass("highlight");
  }

  _selectListItem(listItem) {
  	let userId = $(listItem).attr('data-user-id')
  	let user = this.state.members.find(m => m.id == userId);
  	this._memberSelect(user)
  }

  _memberSelect(member) {
  	this._setMember(member);
  	if(this.props.userSelected)
  		this.props.userSelected(member);
  }

  _setMember(member) {
  	let name = ''
  	if(member.id){
  		name = member.first_name.toUpperCase() + " " + member.middle_name.toUpperCase() + " " + member.last_name.toUpperCase();
  	}
  	this.setState({search: name,member})
  }

	_showDropdown() {
		let self = this;
		this.nameDropdown.current.style['width'] = `${this.input.current.offsetWidth}px`;
		this.nameDropdown.current.classList.remove("hide");
		var isOpening = true;
		$("html").on("click" + self.ns, function (e) {
      if (!isOpening) {
      	let el = $(self.nameDropdown.current)
      	let offset = el.offset();
      	let w = offset.left + el.width();
      	let h = offset.top + el.height();
      	if (!(e.clientX>=offset.left && e.clientX<=w && e.clientY>=offset.top && e.clientY<=h)){
      		self._closeDropdown();
      	}
	    }
	    isOpening = false;
    });
	}

	_closeDropdown() {
		this.nameDropdown.current.classList.add("hide");
		$("html").off(this.ns);
	}

	render() {
		return <>
				<div className="input-group">
					<input ref={this.input} onKeyDown={this.handleKeyDown.bind(this)}
						onChange={this.handleChange.bind(this)}
						onFocus={this.handleFocus.bind(this)}
						onBlur={this.handleBlur.bind(this)}
						value={this.state.search}
						type="text" className="form-control" />
					<div className="input-group-addon"><i className={this.state.inputAddonClass}></i></div>
				</div>
				<div ref={this.nameDropdown} className="names-dropdown-container hide">
					<ul ref={this.nameList} className="name-list" onMouseOver={this.handleMouseOver} onClick={this.handleListItemClick}>
						{this.state.members.map(m => <li key={m.id} className="name-item" data-user-id={m.id}>
							<span className="name" >{m.first_name.toUpperCase()} {m.middle_name.toUpperCase()} {m.last_name.toUpperCase()}</span></li>)}
					</ul>
				</div>
			</>
	}
}