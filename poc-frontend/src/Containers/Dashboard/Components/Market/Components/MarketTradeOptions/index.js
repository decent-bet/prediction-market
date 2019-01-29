import React, {Component} from 'react'
import {withRouter} from 'react-router-dom'

import {
    Tabs,
    Tab
} from 'material-ui'

import MarketTradeTab from './MarketTradeTab'

import {
    TRADE_TYPE_BUY,
    TRADE_TYPE_SELL,
    SHARE_TYPE_LONG,
    SHARE_TYPE_SHORT
} from '../../../../../../Base/Constants'

const {
    BigNumber
} = require('0x.js')

const {
    web3
} = require('../../../../../../Contracts')

class MarketTradeOptions extends Component {

    onEditQuantityListener = (type, value) => this.props.setPlaceOrderQuantity({type, value})

    onEditPriceListener = (type, value) => this.props.setPlaceOrderPrice({type, value})

    onPlaceOrderListener = type => {
        const {
            price,
            quantity
        } = this.props.dashboard.placeOrder[type]

        const dbetAmount =
            new BigNumber(price)
                .mul(quantity)

        const shareAmount =
            new BigNumber(quantity)

        this.props.placeOrder(
            this.props.market.id,
            this.props.selectedOutcome,
            type === TRADE_TYPE_BUY ? SHARE_TYPE_LONG : SHARE_TYPE_SHORT,
            dbetAmount,
            shareAmount
        )
    }

    componentDidUpdate = prevProps => {
        if(
            prevProps.dashboard.placeOrder.req.loading &&
            !this.props.dashboard.placeOrder.req.loading &&
            this.props.dashboard.placeOrder.req.success
        )
            this.props.market.outcomes.map(outcome => {
                this.props.getOutcomeShareTokenOrderbook(
                    this.props.market.id,
                    outcome
                )
            })
    }

    render() {
        console.log('Allowances', this.props.allowances)
        return (
            <div className="col-12 mt-4">
                <h3 className="mb-4">Trade</h3>
                <Tabs>
                    <Tab label="Buy">
                        <MarketTradeTab
                            onEditPriceListener={(event, value) => {this.onEditPriceListener(TRADE_TYPE_BUY, value)}}
                            onEditQuantityListener={(event, value) => {this.onEditQuantityListener(TRADE_TYPE_BUY, value)}}
                            price={this.props.dashboard.placeOrder[TRADE_TYPE_BUY].price}
                            quantity={this.props.dashboard.placeOrder[TRADE_TYPE_BUY].quantity}
                            allowances={this.props.allowances}
                            selectedOutcome={this.props.selectedOutcome}
                            onPlaceOrderListener={() => this.onPlaceOrderListener(TRADE_TYPE_BUY)}
                        />
                    </Tab>
                    <Tab label="Sell">
                        <MarketTradeTab
                            onEditPriceListener={(event, value) => {this.onEditPriceListener(TRADE_TYPE_SELL, value)}}
                            onEditQuantityListener={(event, value) => {this.onEditQuantityListener(TRADE_TYPE_SELL, value)}}
                            price={this.props.dashboard.placeOrder[TRADE_TYPE_SELL].price}
                            quantity={this.props.dashboard.placeOrder[TRADE_TYPE_SELL].quantity}
                            allowances={this.props.allowances}
                            selectedOutcome={this.props.selectedOutcome}
                            onPlaceOrderListener={() => this.onPlaceOrderListener(TRADE_TYPE_SELL)}
                        />
                    </Tab>
                </Tabs>
            </div>
        )
    }
}

export default withRouter(MarketTradeOptions)