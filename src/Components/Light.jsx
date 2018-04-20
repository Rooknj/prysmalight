import React from "react";
import PropTypes from "prop-types";

import { graphql } from "react-apollo";
import gql from "graphql-tag";

import { ChromePicker } from "react-color";
//import Slider from "./Slider";
import Slider, { createSliderWithTooltip } from "rc-slider";
import "rc-slider/assets/index.css";

import Toggle from "react-toggle";
import "react-toggle/style.css"; // for ES6 modules

const propTypes = {
    light: PropTypes.shape({
        id: PropTypes.number,
        name: PropTypes.string,
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
        id: 0,
        name: "",
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
    mutation setLight($lightId: Int!, $light: LightInput!) {
        setLight(lightId: $lightId, light: $light) {
            id
            name
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

const SliderWithTooltip = createSliderWithTooltip(Slider);

class Light extends React.Component {
    constructor(props) {
        super(props);

        //Bring state out to Apollo Inmemory Cache
        this.state = {
            name: this.props.light.name
        };
    }

    static propTypes = propTypes;
    static defaultProps = defaultProps;

    handleMutationCompleted = ({ data }) => {
        console.log("Light Updated Successfully!");
        console.log("Data Received: ", data);
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

    handleNameChange = evt => {
        this.setState({ name: evt.target.value });
    };

    handlePowerChange = evt => {
        const variables = {
            lightId: this.props.light.id,
            light: {
                power: evt.target.checked
            }
        };
        this.setLight(variables);
    };

    handleBrightnessChange = brightness => {
        const variables = {
            lightId: this.props.light.id,
            light: {
                brightness
            }
        };
        this.setLight(variables);
    };

    handleColorChange = ({ rgb: { r, g, b } }) => {
        const variables = {
            lightId: this.props.light.id,
            light: {
                color: {
                    r,
                    g,
                    b
                }
            }
        };
        this.setLight(variables);
    };

    percentFormatter(v) {
        return `${v} %`;
    }
    //TODO: Break brightness bar and name display/editor into seperate components
    render() {
        return (
            <li>
                <label>
                    <span>Light Name: </span>
                </label>
                <input
                    name="name"
                    type="text"
                    value={this.state.name}
                    onChange={this.handleNameChange}
                />
                <br />
                <label>
                    <span>Power: </span>
                </label>
                <Toggle
                    defaultChecked={this.props.power}
                    onChange={this.handlePowerChange}
                />
                <br />
                <label>
                    <span>Brightness: </span>
                </label>
                <div style={{ width: 600, margin: 50 }}>
                    <Slider
                        defaultValue={50}
                        min={0}
                        max={100}
                        onChange={this.handleBrightnessChange}
                    />
                </div>
                <br />
                <label> Color: </label>
                <ChromePicker
                    disableAlpha={true}
                    color={this.props.light.color}
                    onChangeComplete={this.handleColorChange}
                />
                <br />
            </li>
        );
    }
}

export default graphql(SET_LIGHT)(Light);
