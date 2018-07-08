import React from "react";
import PropTypes from "prop-types";

import { throttle } from "lodash";
import Light from "./Light";

const throttleSetLight = throttle(
    (setLight, light) =>
        setLight({
            variables: {
                light
            }
        }),
    100
);

class LightStateContainer extends React.Component {
    constructor(props) {
        super(props);
        const { light } = props;
        this.state = {
            light
        };
    }

    handleStateChange = e => {
        const { setLight, light } = this.props;
        throttleSetLight(setLight, {
            id: light.id,
            state: e.target.checked ? "ON" : "OFF"
        });
        // TODO: get rid of this for optimistic updates
        const newLightState = Object.assign({}, this.state.light, {
            state: e.target.checked ? "ON" : "OFF"
        });
        this.setState({ light: newLightState });
    };

    handleBrightnessChange = (event, brightness) => {
        const { setLight, light } = this.props;
        throttleSetLight(setLight, {
            id: light.id,
            brightness
        });
    };

    handleColorChange = ({ rgb: { r, g, b } }) => {
        const { setLight, light } = this.props;
        if (r === light.color.r && g === light.color.g && b === light.color.b) {
            return;
        }
        throttleSetLight(setLight, {
            id: light.id,
            color: { r, g, b }
        });
    };

    handleEffectChange = e => {
        const { setLight, light } = this.props;
        throttleSetLight(setLight, {
            id: light.id,
            [e.target.name]: e.target.value
        });
    };

    render() {
        const { loading } = this.props;
        return (
            <Light
                light={this.state.light}
                loading={loading}
                onStateChange={this.handleStateChange}
                onBrightnessChange={this.handleBrightnessChange}
                onColorChange={this.handleColorChange}
                onEffectChange={this.handleEffectChange}
            />
        );
    }
}

LightStateContainer.propTypes = {
    light: PropTypes.shape({
        id: PropTypes.string,
        connected: PropTypes.number,
        state: PropTypes.string,
        brightness: PropTypes.number,
        color: PropTypes.shape({
            r: PropTypes.number,
            g: PropTypes.number,
            b: PropTypes.number
        }),
        effect: PropTypes.string,
        speed: PropTypes.number,
        supportedEffects: PropTypes.array
    }).isRequired
};

export default LightStateContainer;
