import React from "react";
import PropTypes from "prop-types";

import { Mutation, Subscription } from "react-apollo";
import { throttle, get } from "lodash";
import { adopt } from "react-adopt";

const WithSetLightHandlers = props => {
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
    const handleBrightnessChange = (event, brightness) =>
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

LightContainer.propTypes = {
    mutation: PropTypes.object.isRequired,
    subscription: PropTypes.object.isRequired,
    subscriptionVariables: PropTypes.object.isRequired
};

export default LightContainer;
