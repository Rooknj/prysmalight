import React from "react";
import PropTypes from "prop-types";

import { Mutation } from "react-apollo";
import { SET_LIGHT } from "../../graphqlConstants";
import LightStateContainer from "./LightStateContainer";

class LightMutationContainer extends React.Component {
    render() {
        return (
            <Mutation mutation={SET_LIGHT}>
                {(mutate, { data, loading, error }) => {
                    console.log(data, error, loading);
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
