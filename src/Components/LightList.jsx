import React from "react";
import PropTypes from "prop-types";
import { graphql } from "react-apollo";
import gql from "graphql-tag";
import Light from "./Light.jsx";
import Grid from "@material-ui/core/Grid";
import { withStyles } from "@material-ui/core/styles";

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

const GET_LIGHTS = gql`
    query getLights {
        lights {
            id
            connected
            state
            brightness
            color {
                r
                g
                b
            }
            effect
            speed
            supportedEffects
        }
    }
`;

const LightList = ({ data: { loading, error, lights }, classes }) => {
    if (loading) return "Loading...";
    if (error) return `Error! ${error.message}`;
    //TODO find more elegant way to do this
    if (!lights[0].state) return "Error: No lights are connected to the server";
    return (
        <div className={classes.root}>
            <Grid container spacing={0} justify="center" alignItems="center">
                {lights.map(light => (
                    <Grid key={light.id} item xs={11} sm={6} md={4} lg={3}>
                        <Light light={light} />
                    </Grid>
                ))}
            </Grid>
        </div>
    );
};

LightList.propTypes = propTypes;
LightList.defaultProps = defaultProps;

export default withStyles(styles)(graphql(GET_LIGHTS)(LightList));
