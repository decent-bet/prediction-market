import React, {Component} from 'react'
import {withRouter} from 'react-router-dom'

import './market-positions.css'

class MarketPositions extends Component {

    render() {
        return (
            <div className="col-12 mt-4">
                <h3 className="mb-4 ml-2">Your Positions</h3>
                <div className="row positions">
                    <div className="col-12">
                        {this.props.positions.length === 0 &&
                        <p className="text-center mt-4">No open positions or orders</p>
                        }
                    </div>
                </div>
            </div>
        )
    }
}

export default withRouter(MarketPositions)