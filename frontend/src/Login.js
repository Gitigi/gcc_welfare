import React, {Component} from 'react';
import './login.css';
import {observer,inject} from 'mobx-react'
import axios from 'axios';


@inject('userStore')
@observer
class Login extends Component {
  constructor(props) {
    super(props);
    this.state = {username: '', password: '', loading: false, error: {}};

    this.handleUsernameChange = this.handleUsernameChange.bind(this);
    this.handlePasswordChange = this.handlePasswordChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }
  handleUsernameChange(event) {
    this.setState({username: event.target.value});
  }

  handlePasswordChange(event) {
    this.setState({password: event.target.value});
  }

  handleSubmit(e) {
    e.preventDefault();
    this.setState({loading: true})
    let self = this;
    axios.post('api/login',this.state).then(response=>{
      self.props.userStore.setUser(response.data);
      let pathname = '/';
      if(this.props.location.state && this.props.location.state.from)
        pathname = this.props.location.state.from.pathname;
        self.props.history.replace({pathname})
    },error=>{
      console.log(error.response.data)
      this.setState({loading: false,error: error.response.data})
    })
  }

  render() {
    return (
      <div className="container">
        <form className="form-signin" onSubmit={this.handleSubmit} >
          <h2 className="form-signin-heading">Please sign in</h2>
          <div className={`alert alert-danger ${this.state.error.error ? 'show' : 'hide'}`} role="alert">
            {this.state.error.error}
          </div>
          <label htmlFor="inputUsername" className="sr-only">Username</label>
          <input type="text" value={this.state.username} onChange={this.handleUsernameChange} id="inputUsername" className="form-control" placeholder="Username" required autoFocus />
          <label htmlFor="inputPassword" className="sr-only">Password</label>
          <input type="password" value={this.state.password} onChange={this.handlePasswordChange} id="inputPassword" className="form-control" placeholder="Password" required />
          
          <button className="btn btn-lg btn-primary btn-block" disabled={this.state.loading} type="submit">Login</button>
        </form>

      </div>
    );
  }
}

export default Login;


