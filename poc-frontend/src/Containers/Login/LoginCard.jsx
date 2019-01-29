import React, {Component} from 'react'
import {Card} from 'material-ui'
import {styles} from '../../styles'

import ErrorDialog from '../../Base/Dialogs/ConfirmationDialog'

import LoginForm from './LoginForm'

import Logo from '../../assets/images/dbet-white.svg'

export default class LoginCard extends Component {

    handleDialogClose = () => {
        let open = false
        this.props.toggleErrorDialog({open})
    }

    render() {
        return (
            <Card style={styles.card}>
                <div className="container">
                    <div className="row">
                        <div className="col-4 offset-4">
                            <img src={Logo} className="logo" alt="Decent.bet Logo"/>
                            <p className="text-center mt-2">Prediction markets</p>
                        </div>
                    </div>
                    <LoginForm {...this.props} />
                    <ErrorDialog
                        open={this.props.login.dialogs.error.open}
                        onClose={this.handleDialogClose}
                        title={'Error logging in'}
                        message={this.props.login.dialogs.error.message}
                        onClick={this.handleDialogClose}
                    />
                </div>
            </Card>
        )
    }
}
