import React from "react";
//import PropTypes from "prop-types";
import { Query } from "react-apollo";
import { GET_LIGHTS } from "../graphqlConstants";
import LightListSubscriptionContainer from "./LightListSubscriptionContainer";
import ErrorPage from "./ErrorPage";
import LinearProgress from "@material-ui/core/LinearProgress";
import Typography from "@material-ui/core/Typography";

const propTypes = {};

const defaultProps = {};

export const Loading = () => (
  <React.Fragment>
    <LinearProgress color="secondary" variant="query" />
    <br />
    <center>
      <Typography variant="h3" color="default">
        Loading...
      </Typography>
      {/* TODO: Add a refresh button here */}
    </center>
  </React.Fragment>
);

const LightListQueryContainer = () => (
  <Query query={GET_LIGHTS} fetchPolicy="cache-and-network" notifyOnNetworkStatusChange>
    {({ loading, error, data, subscribeToMore, refetch, networkStatus }) => {
      if (loading || networkStatus === 4) return <Loading />;
      if (error) return <ErrorPage message={error.message} refetch={refetch} />;
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
