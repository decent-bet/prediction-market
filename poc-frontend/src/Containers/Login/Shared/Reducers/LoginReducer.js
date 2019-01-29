import {
    LOGIN_USER_SUCCESS,
    LOGIN_USER_ERROR,
    LOGIN_USER_LOADING,
    SET_PASSWORD,
    SET_PRIVATE_KEY,
    TOGGLE_ERROR_DIALOG
} from '../ActionTypes/LoginActionTypes'
import { initialLogin } from '../../../../Models'

export default function LoginReducer(state = initialLogin, action) {
    switch (action.type) {
        case LOGIN_USER_LOADING:
            return {
                ...state,
                loading: true
            }
        case LOGIN_USER_ERROR:
            return {
                ...state,
                loading: false,
                dialogs: {
                    error: {
                        open: true,
                        message: action.payload
                    }
                }
            }
        case LOGIN_USER_SUCCESS:
            return {
                ...state,
                loggedIn: true,
                activated: action.payload
            }
        case SET_PASSWORD:
            return {
                ...state,
                password: action.payload
            }
        case SET_PRIVATE_KEY:
            return {
                ...state,
                privateKey: action.payload
            }
        case TOGGLE_ERROR_DIALOG:
            return {
                ...state,
                dialogs: {
                    error: {
                        open: action.payload.open,
                        message: action.payload.message
                    }
                }
            }
        default:
            return state
    }
}
