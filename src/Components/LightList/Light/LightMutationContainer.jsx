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
        id: PropTypes.string.isRequired,
        connected: PropTypes.number,
        state: PropTypes.string,
        brightness: PropTypes.number,
        color: PropTypes.shape({
            r: PropTypes.number.isRequired,
            g: PropTypes.number.isRequired,
            b: PropTypes.number.isRequired
        }),
        effect: PropTypes.string,
        speed: PropTypes.number,
        supportedEffects: PropTypes.array
    })
};

export default LightMutationContainer;
