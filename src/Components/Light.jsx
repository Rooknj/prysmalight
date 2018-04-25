import React from "react";
import PropTypes from "prop-types";

import { graphql } from "react-apollo";
import gql from "graphql-tag";

import { ChromePicker } from "react-color";
//import Slider from "./Slider";
import Slider from "rc-slider";
import "rc-slider/assets/index.css";

import Toggle from "react-toggle";
import "react-toggle/style.css"; // for ES6 modules

import throttle from "lodash.throttle";

const propTypes = {
    light: PropTypes.shape({
        id: PropTypes.string,
        connected: PropTypes.number,
        power: PropTypes.string,
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
        power: "OFF",
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
            power
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
            power: this.props.light.power,
            brightness: this.props.light.brightness,
            color: this.props.light.color
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
        if (loading) {
            return prevState;
        }
        const { connected, power, brightness, color } = lightChanged;
        let nextState = {};
        if (power && power !== prevState.power) {
            nextState = { ...nextState, ...{ power } };
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
        console.log(nextState);
        return Object.keys(nextState).length > 0 ? nextState : prevState;
    }

    handleMutationCompleted = ({ data }) => {
        //console.log("Light Updated Successfully!");
        //console.log("Data Received: ", data);
    };

    handleMutationError = error => {
        console.error("Error Setting Light:", error);
    };

    setLight = variables => {
        this.props
            .mutate({ variables })
            .then(this.handleMutationCompleted)
            .catch(this.handleMutationError);
    };

    handlePowerChange = evt => {
        this.setState({ power: evt.target.checked ? "ON" : "OFF" });
        const variables = {
            light: {
                id: this.props.light.id,
                power: evt.target.checked ? "ON" : "OFF"
            }
        };
        this.setLight(variables);
    };

    handleBrightnessChange = throttle(brightness => {
        this.setState({ brightness });
        const variables = {
            light: {
                id: this.props.light.id,
                brightness
            }
        };
        this.setLight(variables);
    }, 100);

    handleColorChange = throttle(({ rgb: { r, g, b } }) => {
        if (
            r === this.state.color.r &&
            g === this.state.color.g &&
            b === this.state.color.b
        ) {
            return;
        }
        this.setState({ color: { r, g, b } });
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
    }, 100);

    render() {
        if (this.state.connected !== 2) {
            return <li>Light Not Connected</li>;
        }
        return (
            <li>
                <label>
                    <span>Light Name: {this.state.id}</span>
                </label>
                <br />
                <label>
                    <span>Power: </span>
                </label>
                <Toggle
                    checked={this.state.power === "ON" ? true : false}
                    onChange={this.handlePowerChange}
                />
                <br />
                <label>
                    <span>Brightness: </span>
                </label>
                <div style={{ width: 600, margin: 50 }}>
                    <Slider
                        value={this.state.brightness}
                        min={0}
                        max={100}
                        onChange={this.handleBrightnessChange}
                    />
                </div>
                <br />
                <label> Color: </label>
                <ChromePicker
                    disableAlpha={true}
                    color={this.state.color}
                    onChange={this.handleColorChange}
                />
                <br />
            </li>
        );
    }
}

export default graphql(LIGHT_CHANGED)(graphql(SET_LIGHT)(Light));
