import React from "react";
//import PropTypes from "prop-types";
import { Query } from "react-apollo";
import { GET_LIGHTS } from "../graphqlConstants";
import LightListSubscriptionContainer from "./LightListSubscriptionContainer";

const propTypes = {};

const defaultProps = {};

export const Loading = () => "Loading...";

export const ErrorPage = ({ message }) => `Error: ${message}`;

const LightListQueryContainer = () => (
  <Query query={GET_LIGHTS}>
    {({ loading, error, data, subscribeToMore }) => {
      if (loading) return <Loading />;
      if (error) return <ErrorPage message={error.message} />;
      return (
        <LightListSubscriptionContainer
          lights={data.lights}
          subscribeToLightChanges={subscribeToMore}
        />
      );
    }}
  </Query>
);

LightListQueryContainer.propTypes = propTypes;
LightListQueryContainer.defaultProps = defaultProps;

export default LightListQueryContainer;
