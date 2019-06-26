import React from 'react'
import {Route,Link} from 'react-router-dom'

export default ({ to,exact,children,activeClassName,...rest }) => (
  <Route
    path={to}
    exact={exact}
    children={({ match }) => (
      <li className={match ? activeClassName : ""}>
        <Link to={to} {...rest}>{children}</Link>
      </li>
    )}
  />
);