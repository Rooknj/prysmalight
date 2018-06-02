import React from "react";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import Slider from "rc-slider";
import "./slider.css";

const styles = theme => ({});

const propTypes = {};

const defaultProps = {};

const BrightnessSection = props => {
    return (
        <Grid
            container
            direction="row"
            spacing={16}
            justify="center"
            alignItems="center"
        >
            <Grid item xs={12}>
                <Typography variant="body2">Brightness</Typography>
            </Grid>
            <Grid item xs={12}>
                <Slider
                    min={0}
                    max={100}
                    step={1}
                    value={props.brightness}
                    onChange={props.onBrightnessChange}
                    disabled={props.connected !== 2}
                />
            </Grid>
        </Grid>
    );
};

BrightnessSection.propTypes = propTypes;
BrightnessSection.defaultProps = defaultProps;

export default withStyles(styles)(BrightnessSection);
