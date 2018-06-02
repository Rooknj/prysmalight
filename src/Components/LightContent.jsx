import React from "react";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
import CardContent from "@material-ui/core/CardContent";

import BrightnessSection from "./BrightnessSection";
import ColorSection from "./ColorSection";
import EffectSection from "./EffectSection";

const styles = theme => ({});

const propTypes = {
    connected: PropTypes.number.isRequired,
    brightness: PropTypes.number.isRequired,
    color: PropTypes.object.isRequired,
    colors: PropTypes.array.isRequired,
    effect: PropTypes.string.isRequired,
    supportedEffects: PropTypes.array.isRequired,
    speed: PropTypes.number.isRequired,
    onBrightnessChange: PropTypes.func.isRequired,
    onColorChange: PropTypes.func.isRequired,
    onInputChange: PropTypes.func.isRequired
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

export default withStyles(styles)(LightContent);
