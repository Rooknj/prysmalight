import React from "react";
import PropTypes from "prop-types";
import Slider from "@material-ui/lab/Slider";

const propTypes = {
  connected: PropTypes.number,
  brightness: PropTypes.number,
  color: PropTypes.shape({
    r: PropTypes.number.isRequired,
    g: PropTypes.number.isRequired,
    b: PropTypes.number.isRequired
  }),
  onBrightnessChange: PropTypes.func
};

const defaultProps = {};

const BrightnessSlider = ({ brightness, onBrightnessChange, connected }) => {
  return (
    <Slider
      value={brightness}
      min={0}
      max={100}
      step={1}
      onChange={onBrightnessChange}
      disabled={connected !== 2}
    />
  );
};

BrightnessSlider.propTypes = propTypes;
BrightnessSlider.defaultProps = defaultProps;

export default BrightnessSlider;
