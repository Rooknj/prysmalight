import React from "react";
import PropTypes from "prop-types";
import { Mutation, Subscription } from "react-apollo";
import { throttle, get } from "lodash";
import { adopt } from "react-adopt";

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

const WithSetLightHandlers = props => {
    console.log(props);
    const { setLight } = props;
    const handleLightChange = throttle(
        (setLight, light) =>
            setLight({
                variables: {
                    light
                }
            }),
        100
    );
    const handleStateChange = e =>
        handleLightChange(setLight, {
            id: get(props, "light.id", ""),
            state: e.target.checked ? "ON" : "OFF"
        });
    const handleBrightnessChange = brightness =>
        handleLightChange(setLight, {
            id: get(props, "light.id", ""),
            brightness
        });
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
    return props.children({
        handleStateChange,
        handleBrightnessChange,
        handleColorChange,
        handleEffectChange
    });
};

const LightContainer = adopt({
    mutationProps: ({ render, mutation }) => (
        <Mutation mutation={mutation}>
            {(setLight, result) => render({ setLight, result })}
        </Mutation>
    ),
    subscriptionProps: ({ render, subscription, subscriptionVariables }) => (
        <Subscription
            subscription={subscription}
            variables={subscriptionVariables}
        >
            {result => render({ result })}
        </Subscription>
    ),
    handlerProps: ({ render, mutationProps, subscriptionProps }) => (
        <WithSetLightHandlers
            setLight={mutationProps.setLight}
            light={get(subscriptionProps, "data.lightChanged", null)}
        >
            {handlers => render({ handlers })}
        </WithSetLightHandlers>
    )
});

const Light = props => (
    <div>
        <LightContainer
            mutation={SET_LIGHT}
            subscription={LIGHT_CHANGED}
            subscriptionVariables={{ lightId: props.light.id }}
        >
            {({ mutationProps, subscriptionProps, handlerProps }) => {
                const lightChanged = get(
                    subscriptionProps,
                    "result.data.lightChanged",
                    props.light
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
                console.log(props);
                return (
                    <Card className={props.classes.card}>
                        <LightHeader
                            id={props.light.id}
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
                            supportedEffects={props.light.supportedEffects}
                            speed={speed}
                            onBrightnessChange={handleBrightnessChange}
                            onColorChange={handleColorChange}
                            onInputChange={handleEffectChange}
                        />
                    </Card>
                );
            }}
        </LightContainer>
    </div>
);

Light.propTypes = propTypes;
Light.defaultProps = defaultProps;

export default withStyles(styles)(Light);
