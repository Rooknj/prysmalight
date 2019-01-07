import React from "react";
import PropTypes from "prop-types";
import ColorPicker from "./ColorPicker";
import styled from "styled-components";

const StyledDiv = styled.div`
  margin-top: 1em;
  margin-left: auto;
  margin-right: auto;
`;

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
  <StyledDiv>
    <ColorPicker color={props.color} onChange={props.onColorChange} />
  </StyledDiv>
);
ColorControls.propTypes = propTypes;
ColorControls.defaultProps = defaultProps;

export default ColorControls;
