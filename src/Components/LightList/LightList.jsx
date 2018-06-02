import React from "react";
import PropTypes from "prop-types";
import { Query } from "react-apollo";
import gql from "graphql-tag";
import Light from "./Light/Light";
import Light2 from "./Light/Light2";
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

const LightList = props => (
    <Query query={GET_LIGHTS}>
        {({ loading, error, data }) => {
            if (loading) return "Loading...";
            if (error) return `Error! ${error.message}`;
            if (!data.lights[0].state)
                return "Error: No lights are connected to the server";
            return (
                <div className={props.classes.root}>
                    <Grid
                        container
                        spacing={0}
                        justify="center"
                        alignItems="center"
                    >
                        {data.lights.map(light => (
                            <Grid
                                key={light.id}
                                item
                                xs={11}
                                sm={6}
                                md={4}
                                lg={3}
                            >
                                <Light light={light} />
                                <Light2 light={light} />
                            </Grid>
                        ))}
                    </Grid>
                </div>
            );
        }}
    </Query>
);

LightList.propTypes = propTypes;
LightList.defaultProps = defaultProps;

export default withStyles(styles)(LightList);
