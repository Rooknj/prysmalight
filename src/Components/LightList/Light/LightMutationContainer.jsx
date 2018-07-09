import React from "react";
import PropTypes from "prop-types";

import { Mutation } from "react-apollo";
import { SET_LIGHT } from "../../graphqlConstants";
import LightStateContainer from "./LightStateContainer";

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
