import { combineReducers } from 'redux'

import DashboardReducer from './DashboardReducer'

const reducers = combineReducers({
    dashboard: DashboardReducer
})

export default reducers