import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import * as LoginActionCreators from './Shared/ActionCreators/LoginActionCreators'

import Login from './index'

const mapStateToProps = (state, ownProps) => {
    const containerState = Object.assign(
        {},
        state.login
    )
    return containerState
}
const mapDispatchToProps = (dispatch, ownProps) => {
    const merge = Object.assign(
        {},
        LoginActionCreators
    )
    return bindActionCreators(merge, dispatch)
}

export default connect(mapStateToProps, mapDispatchToProps)(Login)
