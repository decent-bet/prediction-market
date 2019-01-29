import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import * as DashboardActionCreators from './Shared/ActionCreators/DashboardActionCreators'

import Dashboard from './index'

const mapStateToProps = (state, ownProps) => {
    const containerState = Object.assign(
        {},
        state.dashboard
    )
    return containerState
}
const mapDispatchToProps = (dispatch, ownProps) => {
    const merge = Object.assign(
        {},
        DashboardActionCreators
    )
    return bindActionCreators(merge, dispatch)
}

export default connect(mapStateToProps, mapDispatchToProps)(Dashboard)
