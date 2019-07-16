import React, {Component} from 'react';
import logo from './logo.svg';
import './Home.css'
import {observer,inject} from 'mobx-react'
import axios from 'axios';
import { Link,Route,Redirect } from "react-router-dom";
import NavLink from './navlink'
import AnimatedSwitch from './animated-switch';
import {FadeTransition} from './transitions';
import DataEntry from './DataEntry';
import Payment from './Payment';
import Banking from './Banking';
import Claim from './Claim';
import Notification from './Notification';
import Report from './Report';
import Library from './Library';

import './library/morris.css';
import * as Raphael from './library/raphael.min';
window.Raphael = Raphael;
import('./library/morris.min');



@inject('userStore')
@observer
class Home extends Component {
  constructor(props) {
    super(props);
    this.logout = this.logout.bind(this);
  }

  logout(){
    let self = this;
    axios.post('/api/logout',{}).then(()=>{
      self.props.userStore.setUser({username: null});
      self.props.history.push('/login');
    })
  }
  render() {
    let username = this.props.userStore.user.username;
    let match = this.props.match;
    return (<>
      <nav className="navbar navbar-inverse navbar-fixed-top">
      <div className="container">
        <div className="navbar-header">
          <button type="button" className="navbar-toggle collapsed" data-toggle="collapse" data-target="#navbar" aria-expanded="false" aria-controls="navbar">
            <span className="sr-only">Toggle navigation</span>
            <span className="icon-bar"></span>
            <span className="icon-bar"></span>
            <span className="icon-bar"></span>
          </button>
          <Link to={`${match.url}/dashboard`} className="navbar-brand">GOSPEL CELEBRATION CHURCH (KAYOLE) WELFARE</Link>
        </div>
        <div id="navbar" className="collapse navbar-collapse">
          <ul className="nav navbar-nav">
            <li><Link to={`${match.url}/dashboard`} className="navbar-brand">Home</Link></li>
          </ul>


          <ul className="nav navbar-nav navbar-form navbar-right user-menu">
              <li className="dropdown">
                    <button className="dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                          <i alt="" className='glyphicon glyphicon-user icon-user' />
                        <span className="username">Hi {username}</span>
                        <b className="caret"></b>
                    </button>
                    <ul className="dropdown-menu">
                        <li><a onClick={this.logout}><i className="glyphicon glyphicon-log-out"></i> Log Out</a></li>
                    </ul>
                </li>
                </ul>


        </div>{/*<!--/.nav-collapse -->*/}
      </div>
    </nav>

    <div className="container-fluid">
      <div className="row">
        <div className="col-sm-3 col-md-2 sidebar">
          <ul className="nav nav-sidebar">
            <NavLink exact to={`${match.url}/dashboard`}  activeClassName='active'>Dashboard</NavLink>
            <NavLink to={`${match.url}/members`}  activeClassName='active'>Members</NavLink>
            <NavLink to={`${match.url}/receipt`}  activeClassName='active'>Receipt</NavLink>
            <NavLink to={`${match.url}/banking`}  activeClassName='active'>Banking</NavLink>
            <NavLink to={`${match.url}/claim`}  activeClassName='active'>Claim</NavLink>
            <NavLink to={`${match.url}/notification`}  activeClassName='active'>Notification</NavLink>
            <NavLink to={`${match.url}/reports`}  activeClassName='active'>Reports</NavLink>
            <NavLink to={`${match.url}/library`}  activeClassName='active'>Library</NavLink>
          </ul>
        </div>
        <div className="col-sm-9 col-sm-offset-3 col-md-10 col-md-offset-2 main">
          <Route
            exact
            path="/home"
            render={() => <Redirect to="/home/dashboard" />}
          />
          <AnimatedSwitch>
            <Route path={`${match.path}/members`} component={DataEntry} />
            <Route path={`${match.path}/receipt`} component={Payment} />
            <Route path={`${match.path}/dashboard`} component={Dashboard} />
            <Route path={`${match.path}/banking`} component={Banking} />
            <Route path={`${match.path}/claim`} component={Claim} />
            <Route path={`${match.path}/notification`} component={Notification} />
            <Route path={`${match.path}/reports`} component={Report} />
            <Route path={`${match.path}/library`} component={Library} />
            <Route render={props=><div className='container'><h1>Not Yet</h1></div>} />
          </AnimatedSwitch>

          
        </div>
      </div>
    </div>
    </>
    );
  }
}

class Dashboard extends Component {
  barChart = React.createRef();
  donutChart = React.createRef();
  months = ['January','February','March','April','May',
    'June','July','August','Septempber','October','November','December']

  state = {loading: false,data: {},error:{}}
  componentDidMount() {
    this.setState({loading:true});
    axios.get('/api/dashboard-summary/').then(res=>{
      this.setState({data: res.data});
      window.Morris.Bar({
        element: this.barChart.current,
        data: this.formatDataForBarGraph(res.data.annual_report),
        xkey: 'period__month',
        ykeys: Object.keys(res.data.annual_report),
        labels: Object.keys(res.data.annual_report),
        hideHover: 'auto',
        resize: true
      })


      window.Morris.Donut({
        element: this.donutChart.current,
        data: this.formatDataForBarDonut(res.data),
        resize: true
    });

    },error=>this.setState({error:error.response.data})).finally(_=>this.setState({loading:false}))

  }

  formatDataForBarGraph(data) {
    let years = Array.from(new Array(12), (_,index)=>{
      let bar = {period__month: this.months[index]}
      Object.keys(data).forEach((year)=>{
        let m = data[year].find(v=>v.period__period__month == (index+1));
        if(m){
          bar[year] = m.total;
        }else {
          bar[year] = 0;
        }
      })
      return bar;
    })
    return years;
  }

  formatDataForBarDonut(data) {
    if (data.upto_date === 0 && data.active === 0 && data.suspended === 0 &&
      data.lagging === 0)
      return [{label: "No Members", value: 1}]
    return [{
        label: "Upto Date",
        value: data.upto_date
    }, {
        label: "Lagging",
        value: data.lagging
    }, {
        label: "Active",
        value: data.active
    }, {
        label: "Suspended",
        value: data.suspended
    }]
  }

  render() {
    let match = this.props.match;
    return (
      <div>
        <div className={`alert alert-danger alert-dismissible ${this.state.error.detail ? 'show' : 'hide'}`} role="alert">
          <a href="#" className="close" data-dismiss="alert" aria-label="close">&times;</a>
          {this.state.error.detail}
        </div>
        <h2>Dashboard <i className={`fa fa-circle-o-notch fa-spin fa-fw ${this.state.loading ? '' : 'fade'}`}></i> </h2>
        <div className="row">
            <div className="col-lg-offset-1 col-lg-2 col-md-6">
              <Panel item="Upto Date Members" count={this.state.data.upto_date} icon="fa-balance-scale"
                detailsPath={{pathname:'/home/members',state: {status: 'upto-date'}}}/>
            </div>
            <div className="col-lg-2 col-md-6">
              <Panel item="Lagging Members" count={this.state.data.lagging} icon="fa-s15 " color="green"
                detailsPath={{pathname:'/home/members',state: {status: 'lagging'}}}/>
            </div>
            <div className="col-lg-2 col-md-6">
              <Panel item="Active Members" count={this.state.data.active} icon="fa-signing" color="yellow"
                detailsPath={{pathname:'/home/members',state: {status: 'active'}}}/>
            </div>
            <div className="col-lg-2 col-md-6">
              <Panel item="Suspended Members" count={this.state.data.suspended} icon="fa-thumb-tack" color="red"
                detailsPath={{pathname:'/home/members',state: {status: 'suspended'}}}/>
            </div>
            <div className="col-lg-2 col-md-6">
              <Panel item="Dormant Members" count={this.state.data.dormant} icon="fa-thumb-tack" color="yellow"
                detailsPath={{pathname:'/home/members',state: {status: 'dormant'}}}/>
            </div>
        </div>

        <div  className="clearfix"></div>
        <div className="row">
          <h2 ></h2>
          <div className="col-sm-6">
            <div ref={this.barChart} ></div>
          </div>
          <div className="col-sm-6">
            <div ref={this.donutChart}></div>
          </div>
        </div>

      </div>
      );
  }
}

class Panel extends Component {
  render() {
    return <div className={`panel panel-${this.props.color || 'primary'}`}>
      <div className="panel-heading">
        <div className="row">
          <div className="col-xs-3">
            <i className={`fa ${this.props.icon} fa-4x`}></i>
          </div>
          <div className="col-xs-9 text-right">
            <div className="huge">{this.props.count}</div>
            <div>{this.props.item}!</div>
          </div>
        </div>
      </div>
      <Link to={this.props.detailsPath || ''}>
        <div className="panel-footer">
            <span className="pull-left">View Details</span>
            <span className="pull-right"><i className="fa fa-arrow-circle-right"></i></span>

            <div className="clearfix"></div>
        </div>
      </Link>
    </div>
  }
}

export default Home;
