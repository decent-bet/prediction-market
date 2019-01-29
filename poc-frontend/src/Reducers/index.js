import { combineReducers } from 'redux'

import login from '../Containers/Login/Shared/Reducers'
import dashboard from '../Containers/Dashboard/Shared/Reducers'

const reducers = combineReducers({
    login,
    dashboard
})

export default reducers