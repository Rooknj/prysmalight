import React from "react";
import PropTypes from "prop-types";
import { Query } from "react-apollo";
import gql from "graphql-tag";
import Light from "./Light/Light";
import Grid from "@material-ui/core/Grid";
import { withStyles } from "@material-ui/core/styles";

const styles = theme => ({
    root: {}
});

const propTypes = {
    data: PropTypes.shape({
        loading: PropTypes.bool,
        error: PropTypes.object,
        lights: PropTypes.arrayOf(
            PropTypes.shape({
                id: PropTypes.string
            })
        )
    }).isRequired
};

const defaultProps = {
    data: {
        lights: []
    }
};

const GET_LIGHTS = gql`
    query getLights {
        lights {
            id
            connected
            state
            brightness
            color {
                r
                g
                b
            }
            effect
            speed
            supportedEffects
        }
    }
`;

const LIGHT_CHANGED = gql`
    subscription lightChanged($lightId: String!) {
        lightChanged(lightId: $lightId) {
            id
            connected
            state
            brightness
            color {
                r
                g
                b
            }
            effect
            speed
            supportedEffects
        }
    }
`;

const updateLightList = (prev, { subscriptionData }) => {
    if (!subscriptionData.data) return prev;

    const {
        id,
        connected,
        state,
        brightness,
        color,
        effect,
        speed
    } = subscriptionData.data.lightChanged;
    const prevLight = prev.lights.find(light => light.id === "Light 1");
    // TODO: Enable this line when you start returning the Light ID from the backend
    //const prevLight = prev.lights.find((light) => light.id === id);

    let nextState = {};
    // If the incoming data is the same as the current state, ignore it
    if (typeof connected === "number" && connected !== prevLight.connected) {
        nextState = { ...nextState, ...{ connected } };
    }
    if (state !== prevLight.state) {
        nextState = { ...nextState, ...{ state } };
    }
    if (brightness !== prevLight.brightness) {
        nextState = { ...nextState, ...{ brightness } };
    }
    if (
        color &&
        (color.r !== prevLight.color.r ||
            color.g !== prevLight.color.g ||
            color.b !== prevLight.color.b)
    ) {
        nextState = { ...nextState, ...{ color } };
    }
    if (effect !== prevLight.effect) {
        nextState = { ...nextState, ...{ effect } };
    }
    if (speed !== prevLight.speed) {
        nextState = { ...nextState, ...{ speed } };
    }

    // If nextState is empty, that means all the data is the same so we should just return the previous state
    if (Object.keys(nextState).length <= 0) {
        return prev;
    }

    // TODO: Clean up logic
    // Find the index of the light that was updated
    const lightIndex = prev.lights.indexOf(prevLight);
    // Create a new object reflecting the state of the updated light
    const newLight = Object.assign({}, prev.lights[lightIndex], nextState);
    // Create a clone of the lights array from prev
    const newLights = prev.lights.slice();
    // Update the correct light in the new array
    newLights[lightIndex] = newLight;
    // Return prev with the updated lights array
    return { ...prev, ...{ lights: newLights } };
};

const LightList = props => (
    <Query query={GET_LIGHTS}>
        {({ loading, error, data, subscribeToMore }) => {
            if (loading) return "Loading...";
            if (error) return `Error! ${error.message}`;
            if (!data.lights[0].state)
                return "Error: No lights are connected to the server";

            return (
                <div className={props.classes.root}>
                    <Grid
                        container
                        spacing={0}
                        justify="center"
                        alignItems="center"
                    >
                        {data.lights.map(light => {
                            subscribeToMore({
                                document: LIGHT_CHANGED,
                                variables: { lightId: light.id },
                                updateQuery: updateLightList
                            });
                            return (
                                <Grid
                                    key={light.id}
                                    item
                                    xs={11}
                                    sm={6}
                                    md={4}
                                    lg={3}
                                >
                                    <Light light={light} />
                                </Grid>
                            );
                        })}
                    </Grid>
                </div>
            );
        }}
    </Query>
);

LightList.propTypes = propTypes;
LightList.defaultProps = defaultProps;

export default withStyles(styles)(LightList);
