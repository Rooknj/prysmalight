import React from "react";

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
                            error={error}
                        />
                    );
                }}
            </Mutation>
        );
    }
}

export default LightMutationContainer;
