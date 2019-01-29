import React, {Component} from 'react'
import {withRouter} from 'react-router-dom'

import './market-times.css'

const moment = require('moment')

class MarketTimes extends Component {

    formatUnixTime = time => moment.unix(time).format('dddd, MMMM Do YYYY, h:mm:ss a')

    render() {
        const market = this.props.market
        return (
            <div className="row market-times mt-2">
                <div className="col-12">
                    <h3>Market timings</h3>
                </div>
                <div className="col-12">
                    <p className="title">Market open</p>
                </div>
                <div className="col-12">
                    <p className="value">{this.formatUnixTime(market.info.marketOpen)}</p>
                </div>
                <div className="col-12">
                    <p className="title">Market close</p>
                </div>
                <div className="col-12">
                    <p className="value">{this.formatUnixTime(market.info.marketClose)}</p>
                </div>
                <div className="col-12">
                    <p className="title">Event starts</p>
                </div>
                <div className="col-12">
                    <p className="value">{this.formatUnixTime(market.info.eventStart)}</p>
                </div>
            </div>
        )
    }
}

export default withRouter(MarketTimes)