import React, {Component} from 'react';
import ReactDOM from 'react-dom'
import XLSX from 'xlsx';
import {saveAs} from 'file-saver';
import * as $ from 'jquery';
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
			if(ws_data && ws_data.rows)
				this.createExcel(ws_data.rows,ws_data.filename);
			this.setState({loading: false});
		})();
		// this.createExcel(ws_data);
	}
	createExcel(ws_data,filename) {
		let wb = XLSX.utils.book_new();
		wb.Props = {
			Title: filename,
			Subject: "Individual Report",
			Author: "GCC KAYOLE WELFARE",
			CreatedDate: new Date()
		}
		wb.SheetNames.push("Sheet 1");
		let ws;
		if(ws_data[0].constructor == Array)
			ws = XLSX.utils.aoa_to_sheet(ws_data);
		else if (ws_data[0].constructor == Object)
			ws = XLSX.utils.json_to_sheet(ws_data);
		wb.Sheets["Sheet 1"] = ws;

		let wbout = XLSX.write(wb,{bookType: 'xlsx',type: 'binary'});
		// console.log('saving',ws_data);
		saveAs(new Blob([this.s2ab(wbout)],{type:"application/octet-stream"}), filename+'.xlsx');
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