import React, {Component} from 'react';
import ReactDOM from 'react-dom'
import XLSX from 'xlsx';
import {saveAs} from 'file-saver';
import * as $ from 'jquery/dist/jquery.slim';
import './ExportButton.css';


export default class ExportButton extends Component {
	state = {loading: false}
	handleClick() {
		if(this.state.loading || !this.props.data)
			return;
		this.setState({loading: true});
		(async ()=>{
			let ws_data;
			if(typeof(this.props.data) === "function"){
				ws_data = await this.props.data();
			}else{
				ws_data = await this.props.data;
			}
			if(ws_data)
				this.createExcel(ws_data);
			this.setState({loading: false});
		})();
		// this.createExcel(ws_data);
	}
	createExcel(ws_data) {
		let wb = XLSX.utils.book_new();
		wb.Props = {
			Title: "SheetJS Tutorial",
			Subject: "Test",
			Author: "Red Stapler",
			CreatedDate: new Date(2019,7,5)
		}
		wb.SheetNames.push("Test Sheet");
		let ws;
		if(ws_data[0].constructor == Array)
			ws = XLSX.utils.aoa_to_sheet(ws_data);
		else if (ws_data[0].constructor == Object)
			ws = XLSX.utils.json_to_sheet(ws_data);
		wb.Sheets["Test Sheet"] = ws;

		let wbout = XLSX.write(wb,{bookType: 'xlsx',type: 'binary'});
		saveAs(new Blob([this.s2ab(wbout)],{type:"application/octet-stream"}), 'test.xlsx');
	}

	s2ab(s) {
		let buf = new ArrayBuffer(s.length);
		let view = new Uint8Array(buf);
		for(let i = 0; i < s.length; i++){
			view[i] = s.charCodeAt(i) & 0xFF;
		}
		return buf;
	}

	render() {
		return ReactDOM.createPortal(<button className={`btn export-button ${this.state.loading ? 'disabled': ''}`} onClick={this.handleClick.bind(this)}>
				Export Excel <i className="fa fa-file-excel-o"/>&nbsp;
				{this.state.loading && <i className='fa fa-circle-o-notch fa-spin fa-fw' />}
			</button>,document.body);
	}
}