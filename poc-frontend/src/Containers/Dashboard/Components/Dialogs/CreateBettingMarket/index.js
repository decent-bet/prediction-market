import React, { Component } from 'react'
import { withRouter } from 'react-router-dom'

import { dialogTheme } from '../../../../../Themes'
import {
    CircularProgress,
    Dialog,
    DropDownMenu,
    FlatButton,
    List,
    ListItem,
    MenuItem,
    MuiThemeProvider,
    TextField
} from 'material-ui'
import Clear from 'material-ui/svg-icons/content/clear'
import DatePickerDialog from 'material-ui/DatePicker/DatePickerDialog'
import TimePickerDialog from 'material-ui/TimePicker/TimePickerDialog'
import DateTimePicker from 'material-ui-datetimepicker'
import getMuiTheme from "material-ui/styles/getMuiTheme"

const moment = require('moment')

class CreateBettingMarketDialog extends Component {

    getLength = el => el && el.length

    updateMarketTimes = (name, dateTime) => {
        const obj = {}
        obj[name] = Math.round(parseInt(moment().second(dateTime).format('X')))
        this.props.updateMarketTimes(obj)
    }

    isMarketCreatable = () => {
        const {
            eventStart,
            marketOpen,
            marketClose,
            outcomes
        } = this.props.dashboard.createBettingMarketDialog
        const timestamp = Math.round(new Date().getTime())
        return (
            eventStart > timestamp &&
            marketOpen > timestamp &&
            marketClose > marketOpen &&
            marketOpen < eventStart &&
            outcomes.length > 0
        )
    }

    createBettingMarket = () => {
        const {
            name,
            description,
            resolutionSource,
            category,
            eventStart,
            marketOpen,
            marketClose,
            outcomes
        } = this.props.dashboard.createBettingMarketDialog
        this.props.createBettingMarket(
            name,
            description,
            resolutionSource,
            category,
            eventStart,
            marketOpen,
            marketClose,
            outcomes
        )
    }

    componentDidUpdate = prevProps => {
        if(
            !prevProps.dashboard.createBettingMarketDialog.tx.success &&
            this.props.dashboard.createBettingMarketDialog.tx.success
        ) {
            this.props.toggleCreateBettingMarketDialog()
            this.props.loadAvailableMarkets()
        }
    }

    render() {
        return (
            <MuiThemeProvider muiTheme={getMuiTheme(dialogTheme)}>
                <Dialog
                    title="Create market"
                    actions={
                        <FlatButton
                            label="Ok"
                            primary={true}
                            disabled={
                                !this.isMarketCreatable() ||
                                this.props.dashboard.createBettingMarketDialog.tx.loading
                            }
                            onClick={this.createBettingMarket}
                        />
                    }
                    modal={false}
                    open={this.props.dashboard.createBettingMarketDialog.open}
                    autoScrollBodyContent={true}
                    onRequestClose={() => {
                        if(!this.props.dashboard.createBettingMarketDialog.tx.loading)
                            this.props.onClose()
                    }}>
                    <div className="container">
                        {   !this.props.dashboard.createBettingMarketDialog.tx.loading &&
                            <div className="row">
                                <div className="col-12">
                                    <TextField
                                        floatingLabelText="Name of market"
                                        hintText="Enter the name of your market. Ex: Price of ETH at 02/02/2019"
                                        type="text"
                                        value={this.props.dashboard.createBettingMarketDialog.name}
                                        onChange={(event, value) => this.props.setBettingMarketName(value)}
                                        fullWidth={true}
                                    />
                                </div>
                                <div className="col-12">
                                    <TextField
                                        floatingLabelText="Description"
                                        hintText="Additional market details describing clauses and conditions for this market"
                                        type="text"
                                        value={this.props.dashboard.createBettingMarketDialog.description}
                                        onChange={(event, value) => this.props.setBettingMarketDescription(value)}
                                        fullWidth={true}
                                    />
                                </div>
                                <div className="col-6">
                                    <p className="small mb-0 mt-2">Category</p>
                                    <DropDownMenu
                                        style={{
                                            marginLeft: '-20px'
                                        }}
                                        value={this.props.dashboard.createBettingMarketDialog.category}
                                        onChange={(event, index, value) => this.props.setBettingMarketCategory(value)}>
                                        <MenuItem primaryText="Cryptocurrency" value={1}/>
                                        <MenuItem primaryText="Politics" value={2}/>
                                        <MenuItem primaryText="Sports" value={3}/>
                                    </DropDownMenu>
                                </div>
                                <div className="col-6">
                                    <TextField
                                        floatingLabelText="Resolution source"
                                        hintText="Source of outcome. Ex: coinmarketcap.com"
                                        type="text"
                                        className="mt-2"
                                        value={this.props.dashboard.createBettingMarketDialog.resolutionSource}
                                        onChange={(event, value) => this.props.setBettingMarketResolutionSource(value)}
                                        fullWidth={true}
                                    />
                                </div>
                                <div className="col-12 mt-4">
                                    <small>Event start time:</small>
                                    <DateTimePicker
                                        customValue={this.props.dashboard.createBettingMarketDialog.eventStart}
                                        onChange={(dateTime) => {this.updateMarketTimes('eventStart', dateTime)}}
                                        DatePicker={DatePickerDialog}
                                        TimePicker={TimePickerDialog}
                                    />
                                </div>
                                <div className="col-6 mt-4">
                                    <small>Market open time:</small>
                                    <DateTimePicker
                                        customValue={this.props.dashboard.createBettingMarketDialog.marketOpen}
                                        onChange={(dateTime) => {this.updateMarketTimes('marketOpen', dateTime)}}
                                        DatePicker={DatePickerDialog}
                                        TimePicker={TimePickerDialog}
                                    />
                                </div>
                                <div className="col-6 mt-4">
                                    <small>Market close time:</small>
                                    <DateTimePicker
                                        customValue={this.props.dashboard.createBettingMarketDialog.marketClose}
                                        onChange={(dateTime) => {this.updateMarketTimes('marketClose', dateTime)}}
                                        DatePicker={DatePickerDialog}
                                        TimePicker={TimePickerDialog}
                                    />
                                </div>
                                <div className="col-12 mt-4">
                                    <small>Outcomes:</small>
                                    {   this.getLength(this.props.dashboard.createBettingMarketDialog.outcomes) === 0 &&
                                    <p className="text-center mt-2">
                                        <small>No outcomes added</small>
                                    </p>
                                    }
                                    {   this.getLength(this.props.dashboard.createBettingMarketDialog.outcomes) > 0 &&
                                    <List>
                                        {   this.props.dashboard.createBettingMarketDialog.outcomes.map(outcome =>
                                            <ListItem
                                                primaryText={outcome}
                                                rightIcon={
                                                    <Clear
                                                        onClick={() => this.props.removeMarketOutcome(outcome)}
                                                    />
                                                }
                                            />
                                        )}
                                    </List>
                                    }
                                    <div className="row">
                                        <div className="col-8">
                                            <TextField
                                                floatingLabelText="Market outcome"
                                                hintText="Enter the name of an outcome. Ex: 100-150$"
                                                type="text"
                                                value={this.props.dashboard.createBettingMarketDialog.outcomeName}
                                                onChange={(event, value) => this.props.setMarketOutcomeName(value)}
                                                fullWidth={true}
                                            />
                                        </div>
                                        <div className="col-4">
                                            <FlatButton
                                                className="mt-4"
                                                label="Add outcome"
                                                fullWidth={true}
                                                disabled={!this.getLength(this.props.dashboard.createBettingMarketDialog.outcomeName)}
                                                onClick={this.props.addMarketOutcome}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        }
                        {   this.props.dashboard.createBettingMarketDialog.tx.loading &&
                            <div className="container">
                                <div className="row mt-4">
                                    <div className="col-4 offset-5">
                                        <CircularProgress size={80} thickness={5} />
                                    </div>
                                    <div className="col-12 mt-4">
                                        <p className="text-center">Creating betting market..</p>
                                    </div>
                                </div>
                            </div>
                        }
                    </div>
                </Dialog>
            </MuiThemeProvider>
        )
    }
}

export default withRouter(CreateBettingMarketDialog)
