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

class ApproveTokensDialog extends Component {

    approveTokensForTrading = () => this.props.approveTokensForTrading()

    componentDidUpdate = prevProps => {
        if(
            !prevProps.dashboard.approveTokensDialog.tx.success &&
            this.props.dashboard.approveTokensDialog.tx.success
        ) {
            this.props.toggleApproveTokensDialog()
            this.props.getTradeAllowances()
        }
    }

    render() {
        return (
            <MuiThemeProvider muiTheme={getMuiTheme(dialogTheme)}>
                <Dialog
                    title="Approve tokens for trading"
                    actions={
                        <FlatButton
                            label="Ok"
                            primary={true}
                            onClick={this.approveTokensForTrading}
                        />
                    }
                    modal={false}
                    open={this.props.dashboard.approveTokensDialog.open}
                    autoScrollBodyContent={false}
                    onRequestClose={() => {
                        if (!this.props.dashboard.approveTokensDialog.tx.loading)
                            this.props.onClose()
                    }}>
                    <div className="container">
                        {!this.props.dashboard.approveTokensDialog.tx.loading &&
                        <div className="row">
                            <div className="col-12">
                                <p>Would you like to approve your tokens for trading on the prediction market? This
                                    action will send transaction(s) to the Decent.bet Betting Exchange and ERC20Proxy
                                    contracts.</p>
                            </div>
                        </div>
                        }
                        {this.props.dashboard.approveTokensDialog.tx.loading &&
                        <div className="container">
                            <div className="row mt-4">
                                <div className="col-4 offset-5">
                                    <CircularProgress size={80} thickness={5}/>
                                </div>
                                <div className="col-12 mt-4">
                                    <p className="text-center">Approving tokens for trading..</p>
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

export default withRouter(ApproveTokensDialog)
