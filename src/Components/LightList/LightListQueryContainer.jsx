import React from "react";
import PropTypes from "prop-types";
import { Query } from "react-apollo";
import { GET_LIGHTS } from "../graphqlConstants";
import { withStyles } from "@material-ui/core/styles";
import LightListSubscriptionContainer from "./LightListSubscriptionContainer";

const styles = theme => ({
    root: {}
});

const propTypes = {};

const defaultProps = {
    data: {
        lights: []
    }
};

const LightListQueryContainer = props => (
    <Query query={GET_LIGHTS}>
        {({ loading, error, data, subscribeToMore }) => {
            if (loading) return "Loading...";
            if (error) return `Error! ${error.message}`;
            if (!data.lights[0].state)
                return "Error: No lights are connected to the server";
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

export default withStyles(styles)(LightListQueryContainer);
