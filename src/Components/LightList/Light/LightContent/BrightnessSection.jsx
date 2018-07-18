import React from "react";
import PropTypes from "prop-types";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import Slider from "@material-ui/lab/Slider";

const propTypes = {
  connected: PropTypes.number,
  brightness: PropTypes.number,
  onBrightnessChange: PropTypes.func
};

const defaultProps = {
  connected: 0,
  brightness: 100,
  onBrightnessChange: () => {}
};

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
          value={props.brightness}
          min={0}
          max={100}
          step={1}
          onChange={props.onBrightnessChange}
          disabled={props.connected !== 2}
        />
      </Grid>
    </Grid>
  );
};

BrightnessSection.propTypes = propTypes;
BrightnessSection.defaultProps = defaultProps;

export default BrightnessSectionw;
