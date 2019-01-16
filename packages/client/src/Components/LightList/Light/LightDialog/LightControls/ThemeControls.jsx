import React from "react";
import PropTypes from "prop-types";
import styled from "styled-components";
import { CirclePicker } from "react-color";

const propTypes = {
  connected: PropTypes.number,
  color: PropTypes.shape({
    r: PropTypes.number.isRequired,
    g: PropTypes.number.isRequired,
    b: PropTypes.number.isRequired
  }),
  onColorChange: PropTypes.func.isRequired
};

const defaultProps = {
  light: {
    id: "",
    connected: 0,
    state: "OFF",
    brightness: 0,
    color: {
      r: 0,
      g: 0,
      b: 0
    }
  }
};

const StyledCirclePicker = styled(CirclePicker)`
  width: 100% !important;
  overflow-y: auto;
  padding: 1em;
  margin-right: 0;
  margin-left: 28px;
  justify-content: center;
`;

const CirclePickerWrapper = styled.div`
  overflow-x: hidden;
`;

const colors = [
  "#FF0000", //red
  "#FF8800", //orange
  "#FFFF00", //yellow
  "#00FF00", //green
  "#00FFFF", //cyan
  "#0000FF", //blue
  "#8800FF", //purple
  "#FF00FF" //pink
];

const ThemeControls = props => (
  <CirclePickerWrapper>
    <StyledCirclePicker
      color={props.color}
      onChange={props.onColorChange}
      colors={colors}
      circleSize={56}
      circleSpacing={42}
    />
  </CirclePickerWrapper>
);

ThemeControls.propTypes = propTypes;
ThemeControls.defaultProps = defaultProps;

export default ThemeControls;
