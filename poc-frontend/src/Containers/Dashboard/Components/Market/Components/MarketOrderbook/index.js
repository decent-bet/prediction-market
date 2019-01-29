import React, {Component} from 'react'
import {withRouter} from 'react-router-dom'

import MarketBookSide from './MarketBookSide'

const {
    SHARE_TYPE_SHORT,
    SHARE_TYPE_LONG
} = require('../../../../../../Base/Constants')

class MarketOrderbook extends Component {

    getMarketBookSide = type =>
        <MarketBookSide
            book={this.props.orderBooks.books[this.props.outcome][type]}
            type={type}
            outcome={this.props.outcome}
            marketId={this.props.marketId}
            onToggleFillOrderDialogListener={this.props.onToggleFillOrderDialogListener}
        />

    render() {
        return (
            <div className="col-12 mt-2">
                <h3 className="mb-4">Order book ({this.props.outcome})</h3>
                {   !this.props.orderBooks.loading &&
                    !this.props.orderBooks.error &&
                    this.props.orderBooks.books[this.props.outcome] &&
                    <div>
                        {this.getMarketBookSide(SHARE_TYPE_SHORT)}
                        {this.getMarketBookSide(SHARE_TYPE_LONG)}
                    </div>
                }
            </div>
        )
    }
}

export default withRouter(MarketOrderbook)