import React from "react";
import PropTypes from "prop-types";
import { Mutation } from "react-apollo";
import gql from "graphql-tag";
import throttle from "lodash.throttle";

import Card from "@material-ui/core/Card";
import LightHeader from "./LightHeader/LightHeader";
import { withStyles } from "@material-ui/core/styles";
import LightContent from "./LightContent/LightContent";

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

const handleLightChange = throttle((setLight, light) => {
    console.log("sending");
    setLight({
        variables: {
            light
        }
    });
}, 100);

const Light = props => (
    <Mutation mutation={SET_LIGHT}>
        {(setLight, result) => {
            const handleStateChange = e =>
                handleLightChange(setLight, {
                    id: props.light.id,
                    state: e.target.checked ? "ON" : "OFF"
                });
            const handleBrightnessChange = brightness =>
                handleLightChange(setLight, { id: props.light.id, brightness });
            const handleColorChange = ({ rgb: { r, g, b } }) => {
                if (
                    r === props.light.color.r &&
                    g === props.light.color.g &&
                    b === props.light.color.b
                ) {
                    return;
                }
                handleLightChange(setLight, {
                    id: props.light.id,
                    color: { r, g, b }
                });
            };
            const handleEffectChange = e =>
                handleLightChange(setLight, {
                    id: props.light.id,
                    [e.target.name]: e.target.value
                });
            return (
                <Card className={props.classes.card}>
                    <LightHeader
                        id={props.light.id}
                        color={props.light.color}
                        connected={props.light.connected}
                        state={props.light.state}
                        onChange={handleStateChange}
                    />
                    <LightContent
                        connected={props.light.connected}
                        brightness={props.light.brightness}
                        color={props.light.color}
                        colors={colors}
                        effect={props.light.effect}
                        supportedEffects={props.light.supportedEffects}
                        speed={props.light.speed}
                        onBrightnessChange={handleBrightnessChange}
                        onColorChange={handleColorChange}
                        onInputChange={handleEffectChange}
                    />
                </Card>
            );
        }}
    </Mutation>
);

Light.propTypes = propTypes;
Light.defaultProps = defaultProps;

export default withStyles(styles)(Light);
