import React from "react";
import PropTypes from "prop-types";
import CardContent from "@material-ui/core/CardContent";
import BrightnessSection from "./BrightnessSection";
import ColorSection from "./ColorSection";
import EffectSection from "./EffectSection";

const propTypes = {
    connected: PropTypes.number,
    brightness: PropTypes.number,
    color: PropTypes.shape({
        r: PropTypes.number.isRequired,
        g: PropTypes.number.isRequired,
        b: PropTypes.number.isRequired
    }),
    colors: PropTypes.arrayOf(PropTypes.string),
    effect: PropTypes.string,
    supportedEffects: PropTypes.arrayOf(PropTypes.string),
    speed: PropTypes.number,
    onBrightnessChange: PropTypes.func,
    onColorChange: PropTypes.func,
    onInputChange: PropTypes.func
};

const defaultProps = {};

const LightContent = props => {
    return (
        <CardContent>
            <BrightnessSection {...props} />
            <ColorSection {...props} />
            <EffectSection {...props} />
        </CardContent>
    );
};

LightContent.propTypes = propTypes;
LightContent.defaultProps = defaultProps;

export default LightContent;
