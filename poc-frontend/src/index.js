import React from 'react'
import {render} from 'react-dom'
import {Provider} from 'react-redux'
import {createStore, applyMiddleware} from 'redux'
import thunk from 'redux-thunk'
import logger from 'redux-logger'
import promiseMiddleware from 'redux-promise-middleware'
import {MuiThemeProvider} from 'material-ui'
import getMuiTheme from 'material-ui/styles/getMuiTheme'
import {baseTheme} from './Themes'

import fontawesome from '@fortawesome/fontawesome'
import faSolid from '@fortawesome/fontawesome-free-solid'

import reducers from './Reducers'

import App from './Containers/App'

import 'sanitize.css/sanitize.css'
import './assets/css/bootstrap.min.css'
import './index.css'

fontawesome.library.add(faSolid)

let store = createStore(
    reducers,
    applyMiddleware(thunk, promiseMiddleware(), logger)
)

render(
    <Provider store={store}>
        <MuiThemeProvider muiTheme={getMuiTheme(baseTheme)}>
            <App/>
        </MuiThemeProvider>
    </Provider>,
    document.getElementById('root')
)
