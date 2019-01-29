import React, {Component} from 'react'
import {withRouter} from 'react-router-dom'

import {
    CircularProgress,
    FlatButton
} from 'material-ui'

import MarketTradeOptions from './Components/MarketTradeOptions'
import MarketOrderbook from './Components/MarketOrderbook'
import MarketOutcomes from './Components/MarketOutcomes'
import MarketPositions from './Components/MarketPositions'
import MarketTimes from './Components/MarketTimes'

import './market.css'

class Market extends Component {

    constructor(props) {
        super(props)
        this.state = {
            selectedOutcome: null
        }
    }

    componentDidMount = () => this.updateTitle()

    getId = () => this.props.match.params.id

    getMarket = () => {
        let market
        this.props.dashboard.markets.events.map(event => {
            if (event.id === this.getId())
                market = event
        })
        return market
    }

    // Go back if an invalid market ID is provided
    goBackIfInvalidMarket = () => {
        if (
            !this.props.dashboard.markets.loading &&
            (
                this.props.dashboard.markets.events.length === 0 ||
                !this.getMarket()
            )
        )
            this.props.history.goBack()
    }

    // Loads order books after markets have loaded
    loadOrderbooksAfterMarkets = prevProps => {
        if (
            prevProps.dashboard.markets.loading &&
            !this.props.dashboard.markets.loading &&
            this.props.dashboard.markets.events.length > 0 &&
            Object.keys(this.props.dashboard.orderBooks.books).length === 0
        ) {
            this.getMarket().outcomes.map(outcome => {
                this.props.getOutcomeShareTokenOrderbook(
                    this.getId(),
                    outcome
                )
            })
        }
    }

    // Selects 0-index outcome as default selection
    selectDefaultOutcome = prevProps => {
        if (
            prevProps.dashboard.markets.loading &&
            !this.props.dashboard.markets.loading &&
            this.getMarket()
        ) {
            this.setState({
                selectedOutcome: this.getMarket().outcomes[0]
            })
        }
    }

    componentDidUpdate = prevProps => {
        this.goBackIfInvalidMarket()
        this.loadOrderbooksAfterMarkets(prevProps)
        this.selectDefaultOutcome(prevProps)
        this.updateTitle()
    }

    updateTitle = () =>
        document.title = this.getMarket() ?
            this.getMarket().details.name :
            document.title

    onSelectOutcomeListener = outcome => {
        this.setState({
            selectedOutcome: outcome
        })
    }

    getSelectedOutcome = () =>
        this.state.selectedOutcome ?
            this.state.selectedOutcome :
            (this.getMarket() ? this.getMarket().outcomes[0] : null)

    backToMarkets = () => this.props.history.push('/dashboard')

    render() {
        const market = this.getMarket()
        return (
            <div className="view-market">
                {this.props.dashboard.markets.loading &&
                <div className="row mt-4">
                    <div className="col-4 offset-6">
                        <CircularProgress
                            className="loader"
                            size={60}
                            thickness={3}
                            color="#ffce00"/>
                    </div>
                    <div className="col-12 mt-4">
                        <p className="text-center">Loading market..</p>
                    </div>
                </div>
                }
                {!this.props.dashboard.markets.loading &&
                <div className="row mb-4">
                    <div className="col-12 pt-4 pl-4">
                        <FlatButton
                            label="< Back to markets"
                            onClick={this.backToMarkets}
                        />
                    </div>
                    <div className="col-12 mt-4">
                        <h1 className="text-center my-2">{market.details.name}</h1>
                        <p className="text-center id">ID: {market.id}</p>
                    </div>
                    <div className="col-6 my-3 details">
                        <p className="title">Resolution source</p>
                        <p className="value">{market.details.resolutionSource}</p>
                    </div>
                    <div className="col-6 my-3 details">
                        <p className="title">Other details</p>
                        <p className="value">{market.details.description}</p>
                    </div>
                    <div className="col-4 stats">
                        <MarketTimes
                            market={market}
                        />
                    </div>
                    <div className="col-4 stats">
                    </div>
                    <div className="col-4 stats">
                        <MarketOrderbook
                            orderBooks={this.props.dashboard.orderBooks}
                            outcome={this.getSelectedOutcome()}
                            marketId={market.id}
                            onToggleFillOrderDialogListener={this.props.toggleFillOrderDialog}
                        />
                    </div>
                    <div className="col-8">
                        <MarketOutcomes
                            outcomes={market.outcomes}
                            selectedOutcome={this.getSelectedOutcome()}
                            onSelectOutcomeListener={this.onSelectOutcomeListener}
                        />
                        <MarketPositions
                            positions={[]}
                        />
                    </div>
                    <div className="col-4">
                        <MarketTradeOptions
                            allowances={this.props.dashboard.allowances}
                            market={market}
                            selectedOutcome={this.getSelectedOutcome()}
                            {...this.props}
                        />
                    </div>
                </div>
                }
            </div>
        )
    }
}

export default withRouter(Market)