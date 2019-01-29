import React, { Component, Fragment } from 'react'
import { BrowserRouter, Switch, Route } from 'react-router-dom'

import NonPrivateRoute from '../Routes/NonPrivateRoute'
import PrivateRoute from '../Routes/PrivateRoute'

import KeyHandler from '../../Base/KeyHandler'

import Login from '../Login/LoginContainer'
import Dashboard from '../Dashboard/DashboardContainer'

const keyHandler = new KeyHandler()

class App extends Component {
    render() {
        return (
            <Fragment>
                <BrowserRouter>
                    <Switch>
                        <Route
                            exact
                            path="/"
                            component={() => {
                                return keyHandler.isLoggedIn() ? (
                                    <Dashboard />
                                ) : (
                                    <Login />
                                )
                            }}
                        />
                        <NonPrivateRoute
                            exact
                            path="/login"
                            component={Login}
                        />
                        <PrivateRoute component={Dashboard} />
                    </Switch>
                </BrowserRouter>
            </Fragment>
        )
    }
}

export default App
