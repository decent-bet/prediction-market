import React from 'react'
import { Redirect, Route } from 'react-router-dom'

import KeyHandler from '../../Base/KeyHandler'
const keyHandler = new KeyHandler()

// Protects a route using a 'Login' system.
// Inspiration: https://reacttraining.com/react-router/web/example/auth-workflow
export default function NonPrivateRoute({ component: Component, ...rest }) {
    return (
        <Route
            {...rest}
            render={props => {
                if (!keyHandler.isLoggedIn()) {
                    const view = props.location.pathname === '/' ? '/login' : props.location.pathname;
                    return <Component view={view} {...props} />
                } else {
                    // Redirect to dashboard screen
                    return (
                        <Redirect
                            to={{
                                pathname: '/dashboard',
                                state: { from: props.location }
                            }}
                        />
                    )
                }
            }}
        />
    )
}
