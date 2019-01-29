import React, {Component} from 'react'
import {MenuItem} from 'material-ui'
import {styles} from '../../../../styles'
import {
    withRouter
} from 'react-router-dom'

import FontAwesomeIcon from '@fortawesome/react-fontawesome'

const COLOR_SELECTED = '#8d7200'
const COLOR_NOT_SELECTED = '#757575'

class DashboardMenuItem extends Component {

    render() {
        return (
            <MenuItem
                className={
                    this.props.isSelected ?
                        'menu-item selected' :
                        'menu-item'
                }
                onClick={() => this.props.onSelectListener(this.props.view)}
                primaryText={this.props.title}
                leftIcon={
                    <FontAwesomeIcon
                        icon={this.props.icon}
                        className="fa-fw"
                        color={
                            this.props.isSelected ?
                            COLOR_SELECTED :
                            COLOR_NOT_SELECTED
                        }
                    />
                }
                style={styles.menuItem}
            />
        )
    }

}

export default withRouter(DashboardMenuItem)
