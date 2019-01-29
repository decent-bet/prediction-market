import React, { Component } from 'react'

import DashboardInner from './Components/Main/DashboardInner'

import './Components/Main/dashboard.css'

export default class Dashboard extends Component {
    render() {
        return (
            <div>
                <DashboardInner {...this.props} />
            </div>
        )
    }
}
