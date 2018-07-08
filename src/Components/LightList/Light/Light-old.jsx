import React from "react";
import PropTypes from "prop-types";

import LightContainer from "./LightContainer";
import { get } from "lodash";

import Card from "@material-ui/core/Card";
import LightHeader from "./LightHeader/LightHeader";
import { withStyles } from "@material-ui/core/styles";
import LightContent from "./LightContent/LightContent";
import { LIGHT_CHANGED, SET_LIGHT } from "../../graphqlConstants";

const styles = theme => ({
    card: {
        minWidth: 300,
        maxWidth: 400
    }
});

const colors = [
    "#FF0000", //red
    "#FFA500", //orange
    "#FFFF00", //yellow
    "#00FF00", //green
    "#00FFFF", //cyan
    "#0000FF", //blue
    "#A500FF", //purple
    "#FF00FF" //pink
];

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
        }),
        effect: PropTypes.string,
        speed: PropTypes.number,
        supportedEffects: PropTypes.array
    }).isRequired,
    classes: PropTypes.object
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
    },
    classes: {}
};

const Light = ({ light, classes }) => {
    return (
        <LightContainer
            lightId={light.id}
            mutation={SET_LIGHT}
            subscription={LIGHT_CHANGED}
            subscriptionVariables={{ lightId: light.id }}
        >
            {({ mutationProps, subscriptionProps, handlerProps }) => {
                const lightChanged = get(
                    subscriptionProps,
                    "result.data.lightChanged",
                    light
                );
                const {
                    connected,
                    state,
                    brightness,
                    color,
                    effect,
                    speed
                } = lightChanged;
                const {
                    handleStateChange,
                    handleBrightnessChange,
                    handleColorChange,
                    handleEffectChange
                } = handlerProps.handlers;
                return (
                    <Card className={classes.card}>
                        <LightHeader
                            id={light.id}
                            color={color}
                            connected={connected}
                            state={state}
                            onChange={handleStateChange}
                            waiting={mutationProps.result.loading}
                        />
                        <LightContent
                            connected={connected}
                            brightness={brightness}
                            color={color}
                            colors={colors}
                            effect={effect}
                            supportedEffects={light.supportedEffects}
                            speed={speed}
                            onBrightnessChange={handleBrightnessChange}
                            onColorChange={handleColorChange}
                            onInputChange={handleEffectChange}
                        />
                    </Card>
                );
            }}
        </LightContainer>
    );
};

Light.propTypes = propTypes;
Light.defaultProps = defaultProps;

export default withStyles(styles)(Light);
