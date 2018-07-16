import React from "react";
import PropTypes from "prop-types";
import LightMutationContainer from "./Light/LightMutationContainer";
import Grid from "@material-ui/core/Grid";

const propTypes = {
    lights: PropTypes.arrayOf(
        PropTypes.shape({
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
    )
};

const defaultProps = {
    lights: []
};

const LightList = ({ lights }) => (
    <React.Fragment>
        <br />
        <Grid container justify="space-around">
            {lights.map(light => (
                <Grid key={light.id} item xs={12} sm={12} md={6} lg={4} xl={3}>
                    <LightMutationContainer light={light} />
                </Grid>
            ))}
        </Grid>
    </React.Fragment>
);

LightList.propTypes = propTypes;
LightList.defaultProps = defaultProps;

export default LightList;
