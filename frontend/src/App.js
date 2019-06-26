import React, {Component} from 'react';
import logo from './logo.svg';
import './App.css';
import axios from 'axios'
import {Provider} from 'mobx-react'
import {BrowserRouter as Router,Route,Redirect,Link,Switch} from 'react-router-dom';
import NavLink from './navlink';
import AnimatedSwitch from './animated-switch';
import {FadeTransition} from './transitions';
import Home from './Home';
import Login from './Login';
import {UserStore} from './store';

const userStore = new UserStore();

class App extends Component {
  state = {loading: true}
  componentDidMount(){
    axios.get('/api/get-user').then(response=>{
      userStore.setUser(response.data);
    }).finally( ()=>this.setState({loading: false}) )
  }
  render() {
    return <Provider userStore={userStore}>
        <Router>
            <div>
              <FadeTransition in={!this.state.loading}>
                <div>
                  <Route
                    render={(props) => (!userStore.user.username && props.location.pathname !== '/login') ? 
                      <Redirect to={{pathname: "/login",state: { from: props.location } }} /> : <div/>}
                  />
                  <Route
                    exact
                    path="/login"
                    render={() => userStore.user.username ? 
                      <Redirect to="/" /> : <div/>}
                  />
                  <Route
                    exact
                    path="/"
                    render={() => <Redirect to="/home" />}
                  />
                  <Switch>
                    <Route path='/login' component={Login} />
                    <Route path='/home' component={Home} />
                  </Switch>
                </div>
              </FadeTransition>
              <FadeTransition in={this.state.loading}>
                <h1>Loading...</h1>
              </FadeTransition>
            </div>
        </Router>
      </Provider> 
  }
}


export default App;
