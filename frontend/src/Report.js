import React, {Component} from 'react';
import { Link, Route } from "react-router-dom";
import AnimatedSwitch from './animated-switch';
import AnnualReport from './AnnualReport';
import IndividualReport from './IndividualReport';
import DefaultersReport from './DefaultersReport';
import PaymentReport from './PaymentReport';
import PaymentDistribution from './PaymentDistribution';
import './Report.css';


export default class Report extends Component {
	render() {
		return <AnimatedSwitch>
				<Route path={`${this.props.match.path}/annual-report`} component={AnnualReport} />
				<Route path={`${this.props.match.path}/individual-report`} component={IndividualReport} />
				<Route path={`${this.props.match.path}/defaulters-report`} component={DefaultersReport} />
				<Route path={`${this.props.match.path}/payment-report`} component={PaymentReport} />
				<Route path={`${this.props.match.path}/payment-distribution`} component={PaymentDistribution} />
				<Route exact path={`${this.props.match.path}/`} component={ReportList} />
			</AnimatedSwitch>
	}
}

class ReportList extends Component {
	render() {
		return <div>
				<h1>Reports</h1>
				<div className="row placeholders">
	        <div className="col-xs-6 col-sm-4 placeholder">
	          <Link to={`${this.props.match.url}/annual-report`}><img src="data:image/gif;base64,R0lGODlhAQABAIAAAHd3dwAAACH5BAAAAAAALAAAAAABAAEAAAICRAEAOw==" width="200" height="200" className="img-responsive" alt="Generic placeholder thumbnail" /></Link>
	          <h4>Annual Contribution</h4>
	          <span className="text-muted">Total amount contributed for each month in a year</span>
	        </div>
	        <div className="col-xs-6 col-sm-4 placeholder">
	          <Link to={`${this.props.match.url}/individual-report`}><img src="data:image/gif;base64,R0lGODlhAQABAIAAAHd3dwAAACH5BAAAAAAALAAAAAABAAEAAAICRAEAOw==" width="200" height="200" className="img-responsive" alt="Generic placeholder thumbnail" /></Link>
	          <h4>Individual Contribution</h4>
	          <span className="text-muted"></span>
	        </div>
	        <div className="col-xs-6 col-sm-4 placeholder">
	          <Link to={`${this.props.match.url}/defaulters-report`}><img src="data:image/gif;base64,R0lGODlhAQABAIAAAHd3dwAAACH5BAAAAAAALAAAAAABAAEAAAICRAEAOw==" width="200" height="200" className="img-responsive" alt="Generic placeholder thumbnail" /></Link>
	          <h4>Defaulters</h4>
	          <span className="text-muted">List of lagging members</span>
	        </div>
	        <div className="col-xs-6 col-sm-4 placeholder">
	          <Link to={`${this.props.match.url}/payment-report`}><img src="data:image/gif;base64,R0lGODlhAQABAIAAAHd3dwAAACH5BAAAAAAALAAAAAABAAEAAAICRAEAOw==" width="200" height="200" className="img-responsive" alt="Generic placeholder thumbnail" /></Link>
	          <h4>Payments</h4>
	          <span className="text-muted">Payment Made</span>
	        </div>
	        <div className="col-xs-6 col-sm-4 placeholder">
	          <Link to={`${this.props.match.url}/payment-distribution`}><img src="data:image/gif;base64,R0lGODlhAQABAIAAAHd3dwAAACH5BAAAAAAALAAAAAABAAEAAAICRAEAOw==" width="200" height="200" className="img-responsive" alt="Generic placeholder thumbnail" /></Link>
	          <h4>Payment Distribution</h4>
	          <span className="text-muted"></span>
	        </div>
	      </div>
      </div>
	}
}