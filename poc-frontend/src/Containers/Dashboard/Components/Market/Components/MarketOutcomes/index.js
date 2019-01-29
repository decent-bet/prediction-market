import React, {Component} from 'react'
import {withRouter} from 'react-router-dom'

class MarketOutcomes extends Component {

    render() {
        return (
            <div className="col-12 mt-4" >
                <h3 className="mb-4 ml-2">Outcomes</h3>
                {   this.props.outcomes &&
                    this.props.outcomes.map(outcome =>
                    <div
                        className={"row outcome " + (this.props.selectedOutcome === outcome ? "selected" : "")}
                        onClick={() => this.props.onSelectOutcomeListener(outcome)}>
                        <div className="col-12 head">
                            <div className="row">
                                <div className="col-2 offset-2">
                                    <p>Best Bid</p>
                                </div>
                                <div className="col-2">
                                    <p>Bid qty</p>
                                </div>
                                <div className="col-2">
                                    <p>Ask qty</p>
                                </div>
                                <div className="col-2">
                                    <p>Best ask</p>
                                </div>
                                <div className="col-2">
                                    <p>Last</p>
                                </div>
                            </div>
                        </div>
                        <div className="col-12 body">
                            <div className="row">
                                <div className="col-2">
                                    <p>{outcome}</p>
                                </div>
                                <div className="col-2">
                                    <p>120</p>
                                </div>
                                <div className="col-2">
                                    <p>1000</p>
                                </div>
                                <div className="col-2">
                                    <p>250</p>
                                </div>
                                <div className="col-2">
                                    <p>140</p>
                                </div>
                                <div className="col-2">
                                    <p>140</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        )
    }
}

export default withRouter(MarketOutcomes)