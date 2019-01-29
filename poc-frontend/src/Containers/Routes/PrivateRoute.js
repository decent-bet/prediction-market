import React from 'react'
import { Redirect, Route } from 'react-router-dom'

import KeyHandler from '../../Base/KeyHandler'
const keyHandler = new KeyHandler()

// Protects a route using a 'Login' system.
// Inspiration: https://reacttraining.com/react-router/web/example/auth-workflow
export default function PrivateRoute({ component: Component, ...rest }) {
    return (
        <Route
            {...rest}
            render={props => {
                if (keyHandler.isLoggedIn()) {
                    const view = props.location.pathname === '/' ? '/dashboard' : props.location.pathname;
                    return <Component view={view} {...props} />
                } else {
                    // Redirect to login screen
                    return (
                        <Redirect
                            to={{
                                pathname: '/login',
                                state: { from: props.location }
                            }}
                        />
                    )
                }
            }}
        />
    )
}
