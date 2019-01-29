import React, {Component} from 'react'
import {withRouter} from 'react-router-dom'

import {
    CircularProgress
} from 'material-ui'

import MarketCard from './MarketCard'

import Warning from 'material-ui/svg-icons/alert/warning'

import './home.css'

const warningStyle = {
    width: 80,
    height: 80,
    marginLeft: 'auto',
    marginRight: 'auto',
    marginBottom: 20,
    display: 'block'
}

class DashboardHome extends Component {

    componentDidMount = () => {
        document.title = 'DBET Prediction Market'
    }

    render() {
        return (
            <div className="container dashboard-home">
                {this.props.dashboard.markets.loading &&
                <div className="row mt-4">
                    <div className="col-4 offset-6">
                        <CircularProgress size={80} thickness={5}/>
                    </div>
                    <div className="col-12 mt-4">
                        <p className="text-center">Loading available markets..</p>
                    </div>
                </div>
                }
                {!this.props.dashboard.markets.loading &&
                <div className="row mt-4">
                    <div className="col-12 mt-4">
                        <h1 className="text-center mb-4">Markets</h1>
                        {this.props.dashboard.markets.events.length === 0 &&
                        <div className="row mt-4">
                            <div className="col-4 offset-4">
                                <Warning
                                    style={warningStyle}
                                    color="#ffce00"
                                    hoverColor="#ffce00"
                                />
                                <p className="text-center mb-2">No markets available.</p>
                                <p className="text-center create-market-hint">
                                    Try adding a market by clicking on
                                    "Create betting market" on the top right.
                                </p>
                            </div>
                        </div>
                        }
                        <div className="market-list">
                            {this.props.dashboard.markets.events.length > 0 &&
                            this.props.dashboard.markets.events.map(event =>
                                <div className="row mt-4">
                                    <div className="col-12">
                                        <MarketCard
                                            market={event}
                                            onViewMarketListener={() => {
                                                this.props.history.push(`/market/${event.id}`)
                                            }}
                                        />
                                    </div>
                                </div>
                            )
                            }
                        </div>
                    </div>
                </div>
                }
            </div>
        )
    }
}

export default withRouter(DashboardHome)