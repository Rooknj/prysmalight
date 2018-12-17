import React from "react";

import { Mutation } from "react-apollo";
import { SET_LIGHT } from "../../graphqlConstants";
import LightStateContainer from "./LightStateContainer";
import ErrorSnackbar from "./ErrorSnackbar";

class LightMutationContainer extends React.Component {
  render() {
    // The mutation will automatically update the cache
    return (
      <Mutation mutation={SET_LIGHT}>
        {(mutate, { data, loading, error }) => {
          return (
            <React.Fragment>
              <LightStateContainer
                {...this.props}
                setLight={mutate}
                lightData={data}
                loading={loading}
                error={error}
              />
              {error && (
                <ErrorSnackbar
                  message={`Error changing ${this.props.light.id}`}
                />
              )}
            </React.Fragment>
          );
        }}
      </Mutation>
    );
  }
}

export default LightMutationContainer;
