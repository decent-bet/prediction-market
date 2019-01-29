import React, {Component} from 'react'
import {withRouter} from 'react-router-dom'

import {
    CircularProgress,
    RaisedButton
} from 'material-ui'

import {
    red500,
    green500
} from 'material-ui/styles/colors'

import './market-book-side.css'

const {
    SHARE_TYPE_LONG
} = require('../../../../../../Base/Constants')

const {
    web3
} = require('../../../../../../Contracts')

class MarketBookSide extends Component {

    getPrice = record => record.order.makerAssetAmount.dividedBy(record.order.takerAssetAmount).toString()

    render() {
        return (
            <div className="market-book-side">
                <div className="row header">
                    <div className="col-3">
                        <p className={'title ' + this.props.type}>{this.props.type}</p>
                    </div>
                    <div className="col-3">
                        <p className="title">Price</p>
                    </div>
                    <div className="col-3">
                        <p className="title">Size</p>
                    </div>
                    <div className="col-3">
                        <p className="title">Total</p>
                    </div>
                </div>
                {   !this.props.book &&
                    <div className="row">
                        <div className="col-12">
                            <CircularProgress size={80} thickness={5}/>
                        </div>
                    </div>
                }
                {   this.props.book &&
                    <div>
                        {this.props.book.asks.records.length === 0 &&
                        <p className="no-orders">No orders available</p>
                        }
                        {this.props.book.asks.records.length > 0 &&
                            this.props.book.asks.records.map(record =>
                            <div className="row record">
                                <div className="col-3">
                                    <RaisedButton
                                        label="Fill"
                                        style={{
                                            height: 25,
                                            width: 40,
                                            marginTop: 10
                                        }}
                                        onClick={() => this.props.onToggleFillOrderDialogListener({
                                            marketId: this.props.marketId,
                                            order: record.order,
                                            type: this.props.type,
                                            outcome: this.props.outcome
                                        })}
                                        backgroundColor={this.props.type === SHARE_TYPE_LONG ? red500 : green500}
                                    />
                                </div>
                                <div className="col-3">
                                    <p>{this.getPrice(record)} DBETs</p>
                                </div>
                                <div className="col-3">
                                    <p>{web3.utils.fromWei(record.order.takerAssetAmount.toString(), 'ether')} Shares</p>
                                </div>
                                <div className="col-3">
                                    <p>{web3.utils.fromWei(record.order.makerAssetAmount.toString(), 'ether')} DBETs</p>
                                </div>
                            </div>
                        )}
                    </div>
                }
            </div>
        )
    }
}

export default withRouter(MarketBookSide)