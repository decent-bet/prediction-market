import React, {Component} from 'react'
import {withRouter} from 'react-router-dom'

import {dialogTheme} from '../../../../../Themes'
import {
    CircularProgress,
    Dialog,
    FlatButton,
    MuiThemeProvider,
} from 'material-ui'
import getMuiTheme from "material-ui/styles/getMuiTheme"

const {
    assetDataUtils
} = require('@0x/order-utils')

const {
    token,
    web3
} = require('../../../../../Contracts')

const {
    SHARE_TYPE_SHORT,
    SHARE_TYPE_LONG
} = require('../../../../../Base/Constants')

class FillOrderDialog extends Component {

    getPrice = order => order.makerAssetAmount.dividedBy(order.takerAssetAmount).toString()

    getShareType = type => type === SHARE_TYPE_LONG ? SHARE_TYPE_SHORT : SHARE_TYPE_LONG

    componentDidUpdate = prevProps => {
        if(
            !prevProps.tx.success &&
            this.props.tx.success
        ) {
            this.props.onClose({
                marketId: null,
                order: null,
                type: null,
                outcome: null
            })
            this.props.getOutcomeShareTokenOrderbook(
                this.props.marketId,
                this.props.outcome
            )
        }
    }

    render() {
        return (
            <MuiThemeProvider muiTheme={getMuiTheme(dialogTheme)}>
                <Dialog
                    title="Fill order"
                    actions={
                        <FlatButton
                            label="Ok"
                            primary={true}
                            onClick={this.props.onFillOrderListener}
                        />
                    }
                    modal={false}
                    open={this.props.open}
                    autoScrollBodyContent={false}
                    onRequestClose={() => {
                        if (!this.props.tx.loading)
                            this.props.onClose({
                                marketId: null,
                                order: null,
                                type: null,
                                outcome: null
                            })
                    }}>
                    <div className="container">
                        {!this.props.tx.loading &&
                        this.props.order &&
                        this.props.marketId &&
                        <div className="row">
                            <div className="col-12">
                                <p>Filling this order will result in a purchase
                                    of {web3.utils.fromWei(
                                        this.props.order.takerAssetAmount.toString(),
                                        'ether')} {this.getShareType(this.props.type)} shares
                                    for {web3.utils.fromWei(this.props.order.makerAssetAmount.toString(), 'ether')} DBETs
                                    on-chain. Please click OK below to continue.</p>
                            </div>
                        </div>
                        }
                        {this.props.tx.loading &&
                        <div className="container">
                            <div className="row mt-4">
                                <div className="col-4 offset-5">
                                    <CircularProgress size={80} thickness={5}/>
                                </div>
                                <div className="col-12 mt-4">
                                    <p className="text-center">Filling order on-chain..</p>
                                </div>
                            </div>
                        </div>
                        }
                    </div>
                </Dialog>
            </MuiThemeProvider>
        )
    }
}

export default withRouter(FillOrderDialog)
