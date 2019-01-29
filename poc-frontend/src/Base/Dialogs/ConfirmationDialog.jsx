import React, { Component } from 'react'
import { Dialog, FlatButton, MuiThemeProvider } from 'material-ui'
import getMuiTheme from 'material-ui/styles/getMuiTheme'
import { dialogTheme } from '../../Themes'

export default class ConfirmationDialog extends Component {
    render() {
        return (
            <MuiThemeProvider muiTheme={getMuiTheme(dialogTheme)}>
                <Dialog
                    title={this.props.title}
                    actions={
                        <FlatButton
                            label="Ok"
                            primary={true}
                            onClick={this.props.onClick}
                        />
                    }
                    modal={false}
                    open={this.props.open}
                    autoScrollBodyContent={false}
                    onRequestClose={this.props.onClose}>
                    <p>{this.props.message}</p>
                </Dialog>
            </MuiThemeProvider>
        )
    }
}
