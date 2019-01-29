import React, {Component} from 'react'
import {MuiThemeProvider} from 'material-ui'
import {
    withRouter
} from 'react-router-dom'

import {dashboardTheme} from '../../../../Themes/index'
import getMuiTheme from 'material-ui/styles/getMuiTheme'

import BaseDialog from '../../../../Base/Dialogs/ConfirmationDialog'
import ApproveTokensDialog from '../Dialogs/ApproveTokens'
import CreateBettingMarketDialog from '../Dialogs/CreateBettingMarket'
import FillOrderDialog from '../Dialogs/FillOrder'
import DashboardAppBar from './DashboardAppBar'
import DashboardDrawer from './DashboardDrawer'
import DashboardRouter from './DashboardRouter'
import {SHARE_TYPE_LONG} from "../../../../Base/Constants";

class DashboardInner extends Component {

    componentDidMount() {
        this.props.loadAvailableMarkets()
        this.props.getTradeAllowances()
        this.props.getTokenBalance()
    }

    render() {
        return (
            <MuiThemeProvider muiTheme={getMuiTheme(dashboardTheme)}>
                <div className="dashboard">
                    <DashboardAppBar
                        onToggleDrawerListener={() => this.props.toggleDrawer(true)}
                        onToggleCreateBettingMarketDialogListener={this.props.toggleCreateBettingMarketDialog}
                        onToggleApproveTokensDialogListener={this.props.toggleApproveTokensDialog}
                        dbetBalance={this.props.dashboard.balance.amount.toString()}
                        allowances={this.props.dashboard.allowances}
                    />
                    <DashboardDrawer
                        open={this.props.dashboard.drawer.open}
                        onSetDrawerListener={this.props.setDrawer}
                        onCloseDrawerListener={this.props.closeDrawer}
                    />
                    <DashboardRouter
                        {...this.props}
                    />
                    <ApproveTokensDialog
                        onClose={this.props.toggleApproveTokensDialog}
                        {...this.props}
                    />
                    <CreateBettingMarketDialog
                        onClose={this.props.toggleCreateBettingMarketDialog}
                        {...this.props}
                    />
                    <FillOrderDialog
                        onClose={this.props.toggleFillOrderDialog}
                        onFillOrderListener={() => {
                            const {
                                order,
                                marketId,
                                outcome,
                                type
                            } = this.props.dashboard.fillOrderDialog
                            this.props.fillOrder(
                                marketId,
                                order,
                                outcome,
                                type === SHARE_TYPE_LONG
                            )
                        }}
                        getOutcomeShareTokenOrderbook={this.props.getOutcomeShareTokenOrderbook}
                        {...this.props.dashboard.fillOrderDialog}
                    />
                    <BaseDialog
                        open={this.props.dashboard.baseDialog.open}
                        title={this.props.dashboard.baseDialog.title}
                        message={this.props.dashboard.baseDialog.message}
                        onClick={() => this.props.toggleBaseDialog({open: false})}
                        onClose={() => this.props.toggleBaseDialog({open: false})}
                    />
                </div>
            </MuiThemeProvider>
        )
    }

}

export default withRouter(DashboardInner)
