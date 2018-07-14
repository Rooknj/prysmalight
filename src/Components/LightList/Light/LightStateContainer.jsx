import React from "react";
import PropTypes from "prop-types";

import { throttle } from "lodash";
import Light from "./Light";

const throttleSetLight = throttle((setLight, newLight, oldLight) => {
    // newColor will keep the __typename from the old light while assigning new color values
    const newColor = Object.assign({}, oldLight.color, newLight.color);
    // Set up the optimistic response
    const optimisticResponse = {
        __typename: "Mutation",
        setLight: {
            __typename: "Light",
            ...oldLight,
            ...newLight,
            color: newColor
        }
    };
    setLight({
        variables: {
            light: newLight
        },
        optimisticResponse
    });
}, 100);

class LightStateContainer extends React.Component {
    handleStateChange = e => {
        const { setLight, light } = this.props;
        const newLight = {
            id: light.id,
            state: e.target.checked ? "ON" : "OFF"
        };
        throttleSetLight(setLight, newLight, light);
    };

    handleBrightnessChange = (event, brightness) => {
        const { setLight, light } = this.props;
        const newLight = {
            id: light.id,
            brightness
        };
        throttleSetLight(setLight, newLight, light);
    };

    handleColorChange = ({ rgb: { r, g, b } }) => {
        const { setLight, light } = this.props;
        if (r === light.color.r && g === light.color.g && b === light.color.b) {
            return;
        }
        const newLight = {
            id: light.id,
            color: { r, g, b }
        };
        throttleSetLight(setLight, newLight, light);
    };

    handleEffectChange = e => {
        const { setLight, light } = this.props;
        const newLight = {
            id: light.id,
            [e.target.name]: e.target.value
        };
        throttleSetLight(setLight, newLight, light);
    };

    render() {
        const { light, loading } = this.props;
        return (
            <Light
                light={light}
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
        id: PropTypes.string.isRequired,
        connected: PropTypes.number,
        state: PropTypes.string,
        brightness: PropTypes.number,
        color: PropTypes.shape({
            r: PropTypes.number.isRequired,
            g: PropTypes.number.isRequired,
            b: PropTypes.number.isRequired
        }),
        effect: PropTypes.string,
        speed: PropTypes.number,
        supportedEffects: PropTypes.array
    })
};

export default LightStateContainer;
