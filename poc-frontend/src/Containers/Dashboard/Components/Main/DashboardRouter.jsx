import React from 'react'
import {
    Redirect,
    Route,
    Switch
} from 'react-router-dom'

import DashboardHome from '../Home'
import Market from '../Market'

const DashboardRouter = (props) => (
    <Switch>
        <Redirect exact from="/" to="/dashboard" />
        <Route path="/dashboard" render={() => {
            return <DashboardHome {...props}/>
        }}/>
        <Route path="/market/:id" render={() => {
            return <Market {...props}/>
        }}/>
        <Redirect exact from="*" to="/dashboard" />
    </Switch>
)

export default DashboardRouter
