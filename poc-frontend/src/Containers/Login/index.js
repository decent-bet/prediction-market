import React, {Component} from 'react'
import LoginCard from './LoginCard'

import './login.css'

export default class Login extends Component {

    componentDidMount = () => document.title = 'Login - DBET Prediction Market'

    render() {
        return (
            <div className="login">
                <div className="container">
                    <div className="row">
                        <div className="col-12">
                            <LoginCard
                                {...this.props}
                            />
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}
