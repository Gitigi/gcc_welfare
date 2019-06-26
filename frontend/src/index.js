import React from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios';
import './lib/bootstrap/dist/css/bootstrap.min.css';
import 'font-awesome/css/font-awesome.css';
import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';

import * as $ from 'jquery/dist/jquery.slim';
window.jQuery = $;
import('bootstrap/dist/js/bootstrap');


axios.defaults.xsrfCookieName = 'csrftoken';
axios.defaults.xsrfHeaderName = 'X-CSRFToken';

ReactDOM.render(<App />, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
