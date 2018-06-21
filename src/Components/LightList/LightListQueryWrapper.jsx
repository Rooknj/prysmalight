import React from "react";
import PropTypes from "prop-types";
import { Query } from "react-apollo";
import { GET_LIGHTS } from "../graphqlConstants";
import { withStyles } from "@material-ui/core/styles";
import LightList from "./LightList";

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

const LightListQueryWrapper = props => (
    <Query query={GET_LIGHTS}>
        {({ loading, error, data }) => {
            if (loading) return "Loading...";
            if (error) return `Error! ${error.message}`;
            if (!data.lights[0].state)
                return "Error: No lights are connected to the server";
            return <LightList lights={data.lights} />;
        }}
    </Query>
);

LightListQueryWrapper.propTypes = propTypes;
LightListQueryWrapper.defaultProps = defaultProps;

export default withStyles(styles)(LightListQueryWrapper);
