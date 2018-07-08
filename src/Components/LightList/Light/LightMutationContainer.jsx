import React from "react";
import PropTypes from "prop-types";

import { Mutation } from "react-apollo";
import { SET_LIGHT } from "../../graphqlConstants";
import LightStateContainer from "./LightStateContainer";

// TODO: could use this for subscriptions
// const findLight = (lightId, lights) => {
//     return lights.find(light => light.id === lightId);
// };
// const updateCache = (cache, { data: { setLight } }) => {
//     // Read the lights data from the cache
//     const { lights } = cache.readQuery({ query: GET_LIGHTS });
//     console.log("before:", lights, setLight);
//     // Find the light we are going to change
//     const oldLight = findLight(setLight.id, lights);
//     // Assign the new values to the light
//     Object.assign(oldLight, setLight);
//     console.log("after:", lights)
//     // Write the query back to the cache
//     cache.writeQuery({
//         query: GET_LIGHTS,
//         data: { lights }
//     });
// };

class LightMutationContainer extends React.Component {
    render() {
        // The mutation will automatically update the cache
        return (
            <Mutation mutation={SET_LIGHT}>
                {(mutate, { data, loading, error }) => {
                    if (error) {
                        console.error(error);
                    }
                    return (
                        <LightStateContainer
                            {...this.props}
                            setLight={mutate}
                            lightData={data}
                            loading={loading}
                        />
                    );
                }}
            </Mutation>
        );
    }
}

LightMutationContainer.propTypes = {
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

export default LightMutationContainer;
