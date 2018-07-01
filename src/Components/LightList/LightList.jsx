import React from "react";
import PropTypes from "prop-types";
import Light from "./Light/Light";
import Grid from "@material-ui/core/Grid";
import { withStyles } from "@material-ui/core/styles";

const styles = theme => ({
    root: {}
});

const propTypes = {
    lights: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.string
        })
    )
};

const defaultProps = {
    lights: []
};

const LightList = props => (
    <Grid container spacing={0} justify="center" alignItems="center">
        {props.lights.map(light => (
            <Grid key={light.id} item xs={11} sm={6} md={4} lg={3}>
                <Light light={light} />
            </Grid>
        ))}
    </Grid>
);

LightList.propTypes = propTypes;
LightList.defaultProps = defaultProps;

export default withStyles(styles)(LightList);
