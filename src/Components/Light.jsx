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
        connected: PropTypes.bool,
        power: PropTypes.bool,
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
        connected: false,
        power: false,
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
        setLight(light: $light) {
            id
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

/*
const LIGHT_CHANGED = gql`
    subscription lightChanged($lightId: Int!) {
        lightChanged(lightId: $lightId) {
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
*/

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

    static getDerivedStateFromProps(nextProps, prevState) {
        console.log(nextProps);
        return {
            id: nextProps.light.id,
            connected: nextProps.light.connected,
            power: nextProps.light.power,
            brightness: nextProps.light.brightness,
            color: nextProps.light.color
        };
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
        this.setState({ power: evt.target.checked });
        const variables = {
            light: {
                id: this.props.light.id,
                power: evt.target.checked
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
        if (!this.state.connected) {
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
                    checked={this.state.power}
                    onChange={this.handlePowerChange}
                />
                <br />
                <label>
                    <span>Brightness: </span>
                </label>
                <div style={{ width: 600, margin: 50 }}>
                    <Slider
                        defaultValue={this.state.brightness}
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
