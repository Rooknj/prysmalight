import React from "react";
import PropTypes from "prop-types";
import ColorPicker from "./ColorPicker";

const propTypes = {
  color: PropTypes.shape({
    r: PropTypes.number.isRequired,
    g: PropTypes.number.isRequired,
    b: PropTypes.number.isRequired
  }),
  onColorChange: PropTypes.func.isRequired
};

const defaultProps = {
  color: {
    r: 0,
    g: 0,
    b: 0
  }
};

const ColorControls = props => (
  <div>
    <ColorPicker color={props.color} onChange={props.onColorChange} />
  </div>
);
ColorControls.propTypes = propTypes;
ColorControls.defaultProps = defaultProps;

export default ColorControls;
