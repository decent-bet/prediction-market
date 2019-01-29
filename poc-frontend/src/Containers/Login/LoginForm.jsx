import React, {Component} from 'react'
import { TextField, RaisedButton } from 'material-ui'
import { styles } from '../../styles'
import {
    withRouter
} from 'react-router-dom'

class LoginForm extends Component {

    componentWillReceiveProps = (nextProps) => {
        let props = nextProps.login
        if(props.loggedIn) {
            window.location = '/'
        }
    }

    login = () => {
        const {
            privateKey,
            mnemonic
        } = this.props.login

        this.props.loginUser({
            privateKey,
            mnemonic
        })
    }

    areFieldsValid = () => {
        const {
            privateKey,
            mnemonic
        } = this.props.login
        return (
            (
                privateKey.length > 0 ||
                mnemonic.length > 0
            )
        )
    }

    render() {
        return (
            <div className="row">
                <div className="col-12">
                    <TextField
                        floatingLabelText="Private key"
                        hintText="Enter your private key"
                        type="text"
                        value={this.props.login.privateKey}
                        onChange={(event, value) => this.props.setPrivateKey(value)}
                        fullWidth={true}
                    />
                </div>
                <div className="col-12">
                    <RaisedButton
                        label="Login"
                        className="d-block mx-auto w-50 my-3"
                        onClick={this.login}
                        disabled={!this.areFieldsValid() || this.props.login.loading}
                        buttonStyle={styles.button.fancy}
                    />
                </div>
            </div>
        )
    }
}

export default withRouter(LoginForm)
