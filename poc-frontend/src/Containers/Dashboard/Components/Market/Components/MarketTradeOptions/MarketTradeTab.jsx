import React, {Component} from 'react'
import {withRouter} from 'react-router-dom'

import BigNumber from 'bignumber.js'

import {
    Divider,
    TextField,
    FlatButton
} from 'material-ui'

import './market-trade-tab.css'

const styles = {
    hintStyle: {
        color: '#b3b7c1'
    },
    underlineFocusStyle: {
        borderColor: '#ffce00'
    }
}

class MarketTradeTab extends Component {

    getEstimatedCost = () => {
        const price = this.props.price ? this.props.price : 0
        const quantity = this.props.quantity ? this.props.quantity : 0
        return new BigNumber(price).multipliedBy(quantity).toFixed()
    }

    isOrderPlaceable = () =>
        this.props.price &&
        this.props.quantity &&
        this.props.price !== '0' &&
        this.props.quantity !== '0' &&
        this.props.allowances.erc20Proxy !== '0' &&
        this.props.allowances.bettingExchange !== '0'

    isInsufficientAllowances = () =>
        this.props.allowances.erc20Proxy === '0' ||
        this.props.allowances.bettingExchange === '0'

    render() {
        return (
            <div className="row market-trade-tab">
                <div className="col-4">
                    <p className="title">Outcome</p>
                </div>
                <div className="col-8">
                    <p className="value">{this.props.selectedOutcome}</p>
                </div>
                <div className="col-4">
                    <p className="title pt-3">Quantity</p>
                </div>
                <div className="col-8">
                    <TextField
                        hintStyle={styles.hintStyle}
                        hintText="0.000001 Shares"
                        onChange={this.props.onEditQuantityListener}
                        type="number"
                        underlineFocusStyle={styles.underlineFocusStyle}
                    />
                </div>
                <div className="col-4">
                    <p className="title pt-3">Limit price</p>
                </div>
                <div className="col-8">
                    <TextField
                        hintStyle={styles.hintStyle}
                        hintText="0.0001 DBETs"
                        onChange={this.props.onEditPriceListener}
                        type="number"
                        underlineFocusStyle={styles.underlineFocusStyle}
                    />
                </div>
                <div className="col-12 divider">
                    <Divider/>
                </div>
                <div className="col-6 est-cost">
                    <p className="title">Estimated cost</p>
                </div>
                <div className="col-6 est-cost">
                    <p className="value">{this.getEstimatedCost()} DBETs</p>
                </div>
                <div className="col-6 offset-6">
                    <p className="value">{this.props.quantity ? this.props.quantity : 0} shares</p>
                </div>
                {this.isInsufficientAllowances() &&
                <div className="col-11 insufficient-allowances">
                    <p>
                        You have not approved the exchange contracts for filling orders on
                        the exchange. Please click
                        on "Approve tokens for trading" on the top right before you can place an order.
                    </p>
                </div>
                }
                <div className="col-12 divider">
                    <Divider/>
                </div>
                <div className="col-4 offset-8 mt-4">
                    <FlatButton
                        label="Place order"
                        disabled={!this.isOrderPlaceable()}
                        onClick={this.props.onPlaceOrderListener}
                    />
                </div>
            </div>
        )
    }
}

export default withRouter(MarketTradeTab)