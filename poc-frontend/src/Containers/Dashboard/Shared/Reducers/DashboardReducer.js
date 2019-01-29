import {
    TOGGLE_BASE_DIALOG,
    TOGGLE_APPROVE_TOKENS_DIALOG,
    TOGGLE_CREATE_BETTING_MARKET_DIALOG,
    TOGGLE_FILL_ORDER_DIALOG,
    TOGGLE_DRAWER,
    SET_DRAWER,
    CLOSE_DRAWER,
    SET_BETTING_MARKET_NAME,
    SET_BETTING_MARKET_DESCRIPTION,
    SET_BETTING_MARKET_RESOLUTION_SOURCE,
    SET_BETTING_MARKET_CATEGORY,
    SET_MARKET_OUTCOME_NAME,
    ADD_MARKET_OUTCOME,
    REMOVE_MARKET_OUTCOME,
    UPDATE_MARKET_TIMES,
    CREATE_BETTING_MARKET_LOADING,
    CREATE_BETTING_MARKET_ERROR,
    CREATE_BETTING_MARKET_SUCCESS,
    LOAD_AVAILABLE_MARKETS_ERROR,
    LOAD_AVAILABLE_MARKETS_SUCCESS,
    LOAD_AVAILABLE_MARKETS_LOADING,
    GET_OUTCOME_SHARE_TOKEN_ORDER_BOOK_ERROR,
    GET_OUTCOME_SHARE_TOKEN_ORDER_BOOK_SUCCESS,
    GET_OUTCOME_SHARE_TOKEN_ORDER_BOOK_LOADING,
    APPROVE_TOKENS_ERROR,
    APPROVE_TOKENS_SUCCESS,
    APPROVE_TOKENS_LOADING,
    SET_PLACE_ORDER_PRICE,
    SET_PLACE_ORDER_QUANTITY,
    PLACE_ORDER_ERROR,
    PLACE_ORDER_SUCCESS,
    PLACE_ORDER_LOADING,
    FILL_ORDER_ERROR,
    FILL_ORDER_SUCCESS,
    FILL_ORDER_LOADING,
    GET_TRADE_ALLOWANCES_ERROR,
    GET_TRADE_ALLOWANCES_SUCCESS,
    GET_TRADE_ALLOWANCES_LOADING,
    GET_TOKEN_BALANCE_ERROR,
    GET_TOKEN_BALANCE_LOADING,
    GET_TOKEN_BALANCE_SUCCESS
} from '../ActionTypes/DashboardActionTypes'
import { initialDashboard } from '../../../../Models'

export default function DashboardReducer(state = initialDashboard, action) {
    switch (action.type) {
        case TOGGLE_BASE_DIALOG:
            return {
                ...state,
                baseDialog: {
                    open: action.payload.open,
                    title: action.payload.title,
                    message: action.payload.message
                }
            }
        case TOGGLE_APPROVE_TOKENS_DIALOG:
            return {
                ...state,
                approveTokensDialog: {
                    ...state.approveTokensDialog,
                    open: !state.approveTokensDialog.open
                }
            }
        case TOGGLE_CREATE_BETTING_MARKET_DIALOG:
            return {
                ...state,
                createBettingMarketDialog: {
                    ...state.createBettingMarketDialog,
                    open: !state.createBettingMarketDialog.open
                }
            }
        case TOGGLE_FILL_ORDER_DIALOG:
            return {
                ...state,
                fillOrderDialog: {
                    ...state.fillOrderDialog,
                    open: !state.fillOrderDialog.open,
                    marketId: action.payload.marketId ? action.payload.marketId : null,
                    order: action.payload.order ? action.payload.order : null,
                    type: action.payload.type ? action.payload.type : null,
                    outcome: action.payload.outcome ? action.payload.outcome : null
                }
            }
        case SET_BETTING_MARKET_NAME:
            return {
                ...state,
                createBettingMarketDialog: {
                    ...state.createBettingMarketDialog,
                    name: action.payload
                }
            }
        case SET_BETTING_MARKET_DESCRIPTION:
            return {
                ...state,
                createBettingMarketDialog: {
                    ...state.createBettingMarketDialog,
                    description: action.payload
                }
            }
        case SET_BETTING_MARKET_RESOLUTION_SOURCE:
            return {
                ...state,
                createBettingMarketDialog: {
                    ...state.createBettingMarketDialog,
                    resolutionSource: action.payload
                }
            }
        case SET_BETTING_MARKET_CATEGORY:
            return {
                ...state,
                createBettingMarketDialog: {
                    ...state.createBettingMarketDialog,
                    category: action.payload
                }
            }
        case SET_MARKET_OUTCOME_NAME:
            return {
                ...state,
                createBettingMarketDialog: {
                    ...state.createBettingMarketDialog,
                    outcomeName: action.payload
                }
            }
        case ADD_MARKET_OUTCOME:
            const {
                outcomes,
                outcomeName
            } = state.createBettingMarketDialog
            outcomes.push(outcomeName)

            return {
                ...state,
                createBettingMarketDialog: {
                    ...state.createBettingMarketDialog,
                    outcomeName: '',
                    outcomes
                }
            }
        case REMOVE_MARKET_OUTCOME:
            const _outcomes = state.createBettingMarketDialog.outcomes
            _outcomes.splice(_outcomes.indexOf(action.payload), 1)

            return {
                ...state,
                createBettingMarketDialog: {
                    ...state.createBettingMarketDialog,
                    outcomes: _outcomes
                }
            }
        case UPDATE_MARKET_TIMES:
            return {
                ...state,
                createBettingMarketDialog: {
                    ...state.createBettingMarketDialog,
                    ...action.payload
                }
            }
        case CREATE_BETTING_MARKET_LOADING:
            return {
                ...state,
                createBettingMarketDialog: {
                    ...state.createBettingMarketDialog,
                    tx: {
                        loading: true,
                        error: false,
                        success: false
                    }
                }
            }
        case CREATE_BETTING_MARKET_SUCCESS:
            return {
                ...state,
                createBettingMarketDialog: {
                    ...state.createBettingMarketDialog,
                    tx: {
                        loading: false,
                        error: false,
                        success: true
                    }
                }
            }
        case CREATE_BETTING_MARKET_ERROR:
            return {
                ...state,
                createBettingMarketDialog: {
                    ...state.createBettingMarketDialog,
                    tx: {
                        loading: false,
                        error: true,
                        success: false
                    }
                }
            }
        case LOAD_AVAILABLE_MARKETS_SUCCESS:
            return {
                ...state,
                markets: {
                    loading: false,
                    error: false,
                    events: action.payload
                }
            }
        case LOAD_AVAILABLE_MARKETS_LOADING:
            return {
                ...state,
                markets: {
                    loading: true,
                    error: false,
                    events: []
                }
            }
        case LOAD_AVAILABLE_MARKETS_ERROR:
            return {
                ...state,
                markets: {
                    loading: false,
                    error: true,
                    events: []
                }
            }
        case GET_OUTCOME_SHARE_TOKEN_ORDER_BOOK_SUCCESS:
            state.orderBooks.books[action.payload.outcome] = action.payload.orderBook
            return {
                ...state,
                orderBooks: {
                    error: false,
                    loading: false,
                    books: state.orderBooks.books
                }
            }
        case GET_OUTCOME_SHARE_TOKEN_ORDER_BOOK_LOADING:
            return {
                ...state,
                orderBooks: {
                    ...state.orderBooks,
                    error: false,
                    loading: true
                }
            }
        case GET_OUTCOME_SHARE_TOKEN_ORDER_BOOK_ERROR:
            return {
                ...state,
                orderBooks: {
                    ...state.orderBooks,
                    error: true,
                    loading: false
                }
            }
        case APPROVE_TOKENS_LOADING:
            return {
                ...state,
                approveTokensDialog: {
                    ...state.approveTokensDialog,
                    tx: {
                        error: false,
                        loading: true,
                        success: false
                    }
                }
            }
        case APPROVE_TOKENS_SUCCESS:
            return {
                ...state,
                approveTokensDialog: {
                    ...state.approveTokensDialog,
                    tx: {
                        error: false,
                        loading: false,
                        success: true
                    }
                }
            }
        case APPROVE_TOKENS_ERROR:
            return {
                ...state,
                approveTokensDialog: {
                    ...state.approveTokensDialog,
                    tx: {
                        error: true,
                        loading: false,
                        success: false
                    }
                }
            }
        case SET_PLACE_ORDER_PRICE:
            state.placeOrder[action.payload.type] = {
                ...state.placeOrder[action.payload.type],
                price: action.payload.value
            }
            return {
                ...state
            }
        case SET_PLACE_ORDER_QUANTITY:
            state.placeOrder[action.payload.type] = {
                ...state.placeOrder[action.payload.type],
                quantity: action.payload.value
            }
            return {
                ...state
            }
        case PLACE_ORDER_ERROR:
            return {
                ...state,
                placeOrder: {
                    ...state.placeOrder,
                    req: {
                        error: true,
                        loading: false,
                        success: false
                    }
                }
            }
        case PLACE_ORDER_LOADING:
            return {
                ...state,
                placeOrder: {
                    ...state.placeOrder,
                    req: {
                        error: false,
                        loading: true,
                        success: false
                    }
                }
            }
        case PLACE_ORDER_SUCCESS:
            return {
                ...state,
                placeOrder: {
                    ...state.placeOrder,
                    req: {
                        error: false,
                        loading: false,
                        success: true
                    }
                }
            }
        case FILL_ORDER_ERROR:
            return {
                ...state,
                fillOrderDialog: {
                    ...state.fillOrderDialog,
                    tx: {
                        error: true,
                        loading: false,
                        success: false
                    }
                }
            }
        case FILL_ORDER_LOADING:
            return {
                ...state,
                fillOrderDialog: {
                    ...state.fillOrderDialog,
                    tx: {
                        error: false,
                        loading: true,
                        success: false
                    }
                }
            }
        case FILL_ORDER_SUCCESS:
            return {
                ...state,
                fillOrderDialog: {
                    ...state.fillOrderDialog,
                    tx: {
                        error: false,
                        loading: false,
                        success: true
                    }
                }
            }
        case GET_TRADE_ALLOWANCES_ERROR:
            return {
                ...state,
                allowances: {
                    ...state.allowances,
                    error: true,
                    loading: false
                }
            }
        case GET_TRADE_ALLOWANCES_LOADING:
            return {
                ...state,
                allowances: {
                    ...state.allowances,
                    error: false,
                    loading: true
                }
            }
        case GET_TRADE_ALLOWANCES_SUCCESS:
            return {
                ...state,
                allowances: {
                    erc20Proxy: action.payload.erc20ProxyAllowance,
                    bettingExchange: action.payload.bettingExchangeAllowance,
                    error: false,
                    loading: false
                }
            }
        case GET_TOKEN_BALANCE_ERROR:
            return {
                ...state,
                balance: {
                    ...state.balance,
                    error: true,
                    loading: false
                }
            }
        case GET_TOKEN_BALANCE_LOADING:
            return {
                ...state,
                balance: {
                    ...state.balance,
                    error: false,
                    loading: true
                }
            }
        case GET_TOKEN_BALANCE_SUCCESS:
            return {
                ...state,
                balance: {
                    amount: action.payload,
                    error: false,
                    loading: false
                }
            }
        case TOGGLE_DRAWER:
            return {
                ...state,
                drawer: {
                    open: !state.drawer.open
                }
            }
        case SET_DRAWER:
            return {
                ...state,
                drawer: {
                    open: action.payload
                }
            }
        case CLOSE_DRAWER:
            return {
                ...state,
                drawer: {
                    open: false
                }
            }
        default:
            return state
    }
}
