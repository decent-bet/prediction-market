import darkBaseTheme from 'material-ui/styles/baseThemes/darkBaseTheme'
import merge from 'lodash/merge'
import cloneDeep from 'lodash/cloneDeep'
const colors = require('material-ui/styles/colors')

let getDarkBaseTheme = () => {
    return cloneDeep(darkBaseTheme)
}

const baseTheme = merge(getDarkBaseTheme(), {
    palette: {
        textColor: colors.grey200,
        primary1Color: '#ffce00',
        accent1Color: colors.redA200,
        accent2Color: colors.redA400,
        accent3Color: colors.redA100
    }
})

const dashboardTheme = {
    palette: {
        textColor: colors.white,
        alternateTextColor: colors.white,
        primary1Color: '#29344f',
        canvasColor: '#29344f',
        primary2Color: '#29344f',
        accent1Color: '#ffce00'
    }
}

const datePickerTheme = merge(getDarkBaseTheme(), {
    palette: {
        textColor: colors.grey200,
        primary1Color: '#ffce00',
        pickerHeaderColor: '#ffce00',
        canvasColor: '#171a2c',
        primary2Color: '#171a2c'
    }
})

const dialogTheme = merge(getDarkBaseTheme(), {
    palette: {
        textColor: colors.grey200,
        canvasColor: '#29344f',
        primary1Color: '#ffce00',
        primary2Color: '#ffce00',
        accent1Color: '#ffce00',
        alternateTextColor: colors.white
    }
})

export {
    baseTheme,
    dashboardTheme,
    datePickerTheme,
    dialogTheme
}
