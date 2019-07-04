import React, {Component} from 'react';
import './Pagination.css';

export default class Pagination extends Component {
	state = {pageLinks: [], previousUrl: '',nextUrl: '',active:1,next:null,previous:null,start:1,end:1,count:0,size: 0}
	componentDidUpdate(prevProps,prevState) {
		if(prevState.nextUrl !== this.state.nextUrl || prevState.previousUrl !== this.state.previousUrl)
			this.setLinks()
	}

	getLastPage(){
		let end = this.state.active;
		if(this.state.next){
			end = Math.ceil(this.state.count / this.props.data.results.length);
		}
		else if(this.state.previous){
			end = this.state.previous + 1;
		}
		return end;
	}

	setLinks() {
		if(!this.props.data)
			return;
		// number of continues link from beginning
		let continousLinkCount = 6
		// number of link on each side of active link
		let sideLinkCount = 3;

		let pageLinks = []
		let active = this.state.active;
		let start = 1;
		let end = this.getLastPage();
		// let end = Math.ceil(this.state.count / 5);
		let beforeActive = active - start;
		let afterActive = end - active;
		let pages = active - start;
		if(beforeActive <= continousLinkCount){
			for(let i = 0; i < beforeActive; i++){
				pageLinks.push({number: start+i});
			}
		}else if(pages >= 4){
			pageLinks.push({number: start});
			pageLinks.push({is_break: true});

			let sideLink = sideLinkCount;
			if(afterActive < sideLinkCount)
				sideLink += sideLinkCount - afterActive;
			for(let a = sideLink; a >= 1; a--)
				pageLinks.push({number: active-a});
		}
		pageLinks.push({number: active,is_active: true});

		pages = end - active;
		if(pages <= continousLinkCount){
			for(let i = 1; i <= pages; i++){
				pageLinks.push({number: active+i});
			}
		}else if(pages >= 4){
			let sideLink = sideLinkCount;
			if(beforeActive < sideLinkCount)
				sideLink += sideLinkCount-beforeActive;
			for(let a=1; a <= sideLink; a++){
				pageLinks.push({number: active+a});
			}
			pageLinks.push({is_break: true});
			pageLinks.push({number: end});
		}

		this.setState({pageLinks})
	}

	static getDerivedStateFromProps(props,state) {
		if(props.data.previous !== state.previousUrl || props.data.next !== state.nextUrl || state.count !== props.data.count ){
			let previous = Pagination.getPageFromLink(props.data.previous);
			let next = Pagination.getPageFromLink(props.data.next);
			let active = 1
			if(previous){
				active = previous + 1;
			}else if(next){
				active = next - 1;
			}
			return {previous,next,active,count: props.data.count,previousUrl: props.data.previous,nextUrl: props.data.next}
		}
		else
			return null
	}

	static getPageFromLink(page){
		if(!page)
			return null
		let match = page.match(/page=(\d+)/);
		if(match)
			return parseInt(match[1]);
		else
			return 1
	}

	goto(number){
		if(this.props.goto){
			this.props.goto(number);
		}
	}
	render() {
		return <ul className="pagination" style={{margin: "5px 0 10px 0"}}>
		  {this.state.previous ? <li>
		      <a onClick={this.goto.bind(this,this.state.previous)} aria-label="Previous">
		        <span aria-hidden="true">&laquo;</span>
		      </a>
		    </li>	: <li className="disabled">
		      <a aria-label="Previous">
		        <span aria-hidden="true">&laquo;</span>
		      </a>
		    </li>}

		  {this.state.pageLinks.map((page_link,index)=><React.Fragment key={index} >
		  	{page_link.is_break ? <li className="disabled">
		        <a ><span aria-hidden="true">&hellip;</span></a>
		      </li> : page_link.is_active ? <li className="active">
		          <a>{page_link.number}</a>
		        </li> : <li>
		          <a onClick={this.goto.bind(this,page_link.number)}>{page_link.number}</a>
		        </li> }
				</React.Fragment>)}

		  {this.state.next ? <li>
		      <a onClick={this.goto.bind(this,this.state.next)} aria-label="Next">
		        <span aria-hidden="true">&raquo;</span>
		      </a>
		    </li> : <li className="disabled">
		      <a aria-label="Next">
		        <span aria-hidden="true">&raquo;</span>
		      </a>
		    </li>}
		</ul>

	}
}