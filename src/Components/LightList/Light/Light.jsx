import React from "react";
import PropTypes from "prop-types";
import { Mutation, Subscription } from "react-apollo";
import { throttle, get } from "lodash";

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

const handleLightChange = throttle(
    (setLight, light) =>
        setLight({
            variables: {
                light
            }
        }),
    100
);

// props.subscribeToMore({
//     document: LIGHT_CHANGED,
//     variables: { lightId: light.id },
//     updateQuery: lightUtil.updateQueryWithSubscription
// });

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
                <Subscription
                    subscription={LIGHT_CHANGED}
                    variables={{ lightId: props.light.id }}
                >
                    {({ data, error, loading }) => {
                        return (
                            <Card className={props.classes.card}>
                                <LightHeader
                                    id={props.light.id}
                                    color={get(
                                        data,
                                        "lightChanged.color",
                                        props.light.color
                                    )}
                                    connected={props.light.connected}
                                    state={get(
                                        data,
                                        "lightChanged.state",
                                        props.light.state
                                    )}
                                    onChange={handleStateChange}
                                />
                                <LightContent
                                    connected={props.light.connected}
                                    brightness={get(
                                        data,
                                        "lightChanged.brightness",
                                        props.light.brightness
                                    )}
                                    color={get(
                                        data,
                                        "lightChanged.color",
                                        props.light.color
                                    )}
                                    colors={colors}
                                    effect={get(
                                        data,
                                        "lightChanged.effect",
                                        props.light.effect
                                    )}
                                    supportedEffects={
                                        props.light.supportedEffects
                                    }
                                    speed={get(
                                        data,
                                        "lightChanged.speed",
                                        props.light.speed
                                    )}
                                    onBrightnessChange={handleBrightnessChange}
                                    onColorChange={handleColorChange}
                                    onInputChange={handleEffectChange}
                                />
                            </Card>
                        );
                    }}
                </Subscription>
            );
        }}
    </Mutation>
);

Light.propTypes = propTypes;
Light.defaultProps = defaultProps;

export default withStyles(styles)(Light);
