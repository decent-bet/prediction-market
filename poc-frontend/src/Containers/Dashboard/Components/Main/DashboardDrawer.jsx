import React, {Component} from 'react'
import {Drawer} from 'material-ui'
import {
    withRouter
} from 'react-router-dom'

import KeyHandler from '../../../../Base/KeyHandler'

import DashboardMenuItem from './DashboardMenuItem'

import dbetIcon from '../../../../assets/images/dbet-white.svg'

const keyHandler = new KeyHandler()

const VIEW_HOME = 0
const LOGOUT = 1

class DashboardDrawer extends Component {

    logout = () => {
        keyHandler.clear()
        this.props.history.push('/login')
    }

    render() {
        return (
            <Drawer
                docked={false}
                open={this.props.open}
                width={325}
                onRequestChange={this.props.onSetDrawerListener}
                className="drawer">
                <img src={dbetIcon} alt="Decent.bet icon"/>
                <p className="mb-4 text-center">Prediction market</p>

                <DashboardMenuItem
                    view={VIEW_HOME}
                    isSelected={true}
                    onSelectListener={(view) => {
                    }}
                    title="Home"
                    icon="home"
                />

                <DashboardMenuItem
                    view={LOGOUT}
                    isSelected={false}
                    onSelectListener={this.logout}
                    title="Logout"
                    icon="power-off"
                />
            </Drawer>
        )
    }

}

export default withRouter(DashboardDrawer)
