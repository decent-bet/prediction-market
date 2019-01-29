import React, {Component} from 'react'
import {withRouter} from 'react-router-dom'

import {
    Card,
    FlatButton
} from 'material-ui'

import './market-card.css'

const moment = require('moment')

class MarketCard extends Component {

    formatUnixTime = time => moment.unix(time).format('dddd, MMMM Do YYYY, h:mm:ss a')

    render() {
        return <Card
            style={{
                padding: 40
            }}>
            <div className="row market-card">
                <div className="col-12">
                    <h3>{this.props.market.details.name}</h3>
                    <small>ID: {this.props.market.id}</small>
                </div>
                <div className="col-12 mt-4">
                    {this.props.market.outcomes.map((outcome, index) =>
                        <p>{index + 1}) {outcome}</p>
                    )}
                </div>
                <div className="col-12 mt-4">
                    <div className="row">
                        <div className="col-4">
                            <h4 className="time-header">Market open</h4>
                            <p className="time">
                                {this.formatUnixTime(this.props.market.info.marketOpen)}
                            </p>
                        </div>
                        <div className="col-4">
                            <h4 className="time-header">Market close</h4>
                            <p className="time">
                                {this.formatUnixTime(this.props.market.info.marketClose)}
                            </p>
                        </div>
                        <div className="col-4">
                            <h4 className="time-header">Event starts</h4>
                            <p className="time">
                                {this.formatUnixTime(this.props.market.info.eventStart)}
                            </p>
                        </div>
                    </div>
                </div>
                <div className="col-2 offset-10 mt-3">
                    <FlatButton
                        label="View market"
                        onClick={this.props.onViewMarketListener}
                    />
                </div>
            </div>
        </Card>
    }
}

export default withRouter(MarketCard)