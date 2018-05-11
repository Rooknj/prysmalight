import React from "react";
import PropTypes from "prop-types";
import { graphql } from "react-apollo";
import gql from "graphql-tag";
import throttle from "lodash.throttle";

import Card, { CardHeader, CardContent } from "material-ui/Card";
import Avatar from "material-ui/Avatar";
import red from "material-ui/colors/red";
import { withStyles } from "material-ui/styles";

import Switch from "material-ui/Switch";
import { FormGroup, FormLabel } from "material-ui/Form";

import { MaterialPicker, CirclePicker, HuePicker } from "react-color";
import Slider from "rc-slider";
import "rc-slider/assets/index.css";

const styles = theme => ({
    card: {},
    avatar: {
        backgroundColor: red[500]
    },
    huePicker: {},
    circlePicker: {},
    materialPicker: {
        boxSizing: "content-box"
    }
});

const propTypes = {
    light: PropTypes.shape({
        id: PropTypes.string,
        connected: PropTypes.number,
        state: PropTypes.string,
        brightness: PropTypes.number,
        color: PropTypes.shape({
            r: PropTypes.number,
            g: PropTypes.number,
            b: PropTypes.number
        })
    }).isRequired
};

const defaultProps = {
    light: {
        id: "",
        connected: 0,
        state: "OFF",
        brightness: 0,
        color: {
            r: 0,
            g: 0,
            b: 0
        }
    }
};

const SET_LIGHT = gql`
    mutation setLight($light: LightInput!) {
        setLight(light: $light)
    }
`;

const LIGHT_CHANGED = gql`
    subscription lightChanged {
        lightChanged(lightId: "Light 1") {
            id
            connected
            state
            brightness
            color {
                r
                g
                b
            }
        }
    }
`;

class Light extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            id: this.props.light.id,
            connected: this.props.light.connected,
            state: this.props.light.state,
            brightness: this.props.light.brightness,
            color: this.props.light.color,
            ignoreUpdates: false
        };
    }

    static propTypes = propTypes;
    static defaultProps = defaultProps;

    static getDerivedStateFromProps(
        {
            data: { loading, lightChanged }
        },
        prevState
    ) {
        if (loading || prevState.ignoreUpdates) {
            return prevState;
        }
        const { connected, state, brightness, color } = lightChanged;
        let nextState = {};
        if (state && state !== prevState.state) {
            nextState = { ...nextState, ...{ state } };
        }
        if (brightness && brightness !== prevState.brightness) {
            nextState = { ...nextState, ...{ brightness } };
        }
        if (
            typeof connected === "number" &&
            connected !== prevState.connected
        ) {
            nextState = { ...nextState, ...{ connected } };
        }
        if (
            color &&
            (color.r !== prevState.color.r ||
                color.g !== prevState.color.g ||
                color.b !== prevState.color.b)
        ) {
            nextState = { ...nextState, ...{ color } };
        }
        return Object.keys(nextState).length > 0 ? nextState : prevState;
    }

    handleMutationCompleted = ({ data }) => {
        //console.log("Data Received: ", data);
    };

    handleMutationError = error => {
        console.error("Error Setting Light:", error);
    };

    setLight = throttle(variables => {
        this.props
            .mutate({ variables })
            .then(this.handleMutationCompleted)
            .catch(this.handleMutationError);
        this.setState({ ignoreUpdates: false });
    }, 500);

    handleStateChange = evt => {
        this.setState({
            state: evt.target.checked ? "ON" : "OFF",
            ignoreUpdates: true
        });
        const variables = {
            light: {
                id: this.props.light.id,
                state: evt.target.checked ? "ON" : "OFF"
            }
        };
        this.setLight(variables);
    };

    handleBrightnessChange = brightness => {
        this.setState({
            brightness,
            ignoreUpdates: true
        });
        const variables = {
            light: {
                id: this.props.light.id,
                brightness
            }
        };
        this.setLight(variables);
    };

    handleColorChange = ({ rgb: { r, g, b } }) => {
        if (
            r === this.state.color.r &&
            g === this.state.color.g &&
            b === this.state.color.b
        ) {
            return;
        }
        this.setState({
            color: { r, g, b },
            state: "ON",
            ignoreUpdates: true
        });
        const variables = {
            light: {
                id: this.props.light.id,
                color: {
                    r,
                    g,
                    b
                }
            }
        };
        this.setLight(variables);
    };

    displayConnection = () => {
        return this.state.connected === 2 ? "Connected" : "Disonnected";
    };

    render() {
        const { classes } = this.props;
        return (
            <Card className={classes.card}>
                <CardHeader
                    title={this.state.id}
                    subtitle={this.displayConnection()}
                    avatar={
                        <Avatar aria-label="Light" className={classes.avatar}>
                            R
                        </Avatar>
                    }
                />
                <CardContent>
                    <FormGroup row>
                        <FormLabel>Power</FormLabel>
                        <Switch
                            checked={this.state.state === "ON" ? true : false}
                            onChange={this.handleStateChange}
                            disabled={this.state.connected !== 2}
                            color="primary"
                        />
                    </FormGroup>
                    <br />
                    <FormGroup>
                        <FormLabel>Brightness</FormLabel>
                        <br />
                        <Slider
                            min={0}
                            max={100}
                            step={1}
                            value={this.state.brightness}
                            onChange={this.handleBrightnessChange}
                            disabled={this.state.connected !== 2}
                        />
                    </FormGroup>
                    <br />
                    <FormGroup row>
                        <FormLabel>Color</FormLabel>
                        <HuePicker
                            color={this.state.color}
                            onChange={this.handleColorChange}
                        />
                        <CirclePicker
                            color={this.state.color}
                            onChange={this.handleColorChange}
                        />
                        <MaterialPicker
                            color={this.state.color}
                            onChange={this.handleColorChange}
                            className={classes.materialPicker}
                        />
                    </FormGroup>
                </CardContent>
            </Card>
        );
    }
}

export default withStyles(styles)(
    graphql(LIGHT_CHANGED)(graphql(SET_LIGHT)(Light))
);
