import React, {Component} from 'react'
import {
    AppBar,
    Divider,
    IconButton,
    IconMenu,
    MenuItem
} from 'material-ui'
import Add from 'material-ui/svg-icons/content/add'
import ThumbUp from 'material-ui/svg-icons/action/thumb-up'
import MoreVertIcon from 'material-ui/svg-icons/navigation/more-vert'
import {
    withRouter
} from 'react-router-dom'

import BigNumber from 'bignumber.js'

import Logo from '../../../../assets/images/dbet-white.svg'

const {
    web3
} = require('../../../../Contracts')

class DashboardAppBar extends Component {

    areTokensApprovedForTrading = () =>
        new BigNumber(this.props.allowances.erc20Proxy).isGreaterThan(0) &&
        new BigNumber(this.props.allowances.bettingExchange).isGreaterThan(0)

    areTokenAllowancesLoading = () =>
        this.props.allowances.loading || this.props.allowances.error

    formatFromWei = val => new BigNumber(web3.utils.fromWei(val, 'ether')).toFixed(2)

    formatAllowance = allowance => {
        if(new BigNumber(allowance).isGreaterThan('1000000'))
            return '1000000+'
        else
            return this.formatFromWei(allowance)
    }

    render() {
        return (
            <AppBar
                iconElementRight={
                    <div>
                        <div className="row">
                            <div className="col-6 dbet-balance">
                                <p>
                                    <span className="highlight">DBET Balance</span> {this.formatFromWei(this.props.dbetBalance)}
                                </p>
                            </div>
                            <div className="col-2">
                                <IconMenu
                                    iconButtonElement={<IconButton><MoreVertIcon/></IconButton>}>
                                    <MenuItem
                                        primaryText="Create betting market"
                                        onClick={this.props.onToggleCreateBettingMarketDialogListener}
                                        rightIcon={<Add/>}
                                    />
                                    <MenuItem
                                        primaryText="Approve tokens for trading"
                                        onClick={this.props.onToggleApproveTokensDialogListener}
                                        disabled={
                                            this.areTokensApprovedForTrading() ||
                                            this.areTokenAllowancesLoading()
                                        }
                                        rightIcon={<ThumbUp/>}
                                    />
                                    <Divider/>
                                    <MenuItem
                                        primaryText="Allowances"
                                        disabled={true}
                                        style={{color: '#ffffff'}}
                                    />
                                    <MenuItem
                                        disabled={true}
                                        style={{color: '#ffce00'}}
                                        primaryText={
                                            'ERC20Proxy: ' + this.formatAllowance(this.props.allowances.erc20Proxy.toString())}
                                    />
                                    <MenuItem
                                        disabled={true}
                                        style={{color: '#ffce00'}}
                                        primaryText={
                                            'Betting exchange: ' + this.formatAllowance(this.props.allowances.bettingExchange.toString())}
                                    />
                                </IconMenu>
                            </div>
                            <div className="col-3">
                                <div className="logo-container">
                                    <img src={Logo} className="logo" alt="Decent.bet Logo"/>
                                </div>
                            </div>
                        </div>
                    </div>
                }
                onLeftIconButtonClick={this.props.onToggleDrawerListener}
            />
        )
    }

}

export default withRouter(DashboardAppBar)
