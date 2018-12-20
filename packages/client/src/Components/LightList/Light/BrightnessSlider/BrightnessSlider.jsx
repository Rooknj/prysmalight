import React from "react";
import PropTypes from "prop-types";
import Slider from "@material-ui/lab/Slider";
import styled from "styled-components";

const StyledDiv = styled.div`
  height: 3rem;
  padding-left: 1.5rem;
  padding-right: 1.5rem;
  display: flex;
`;

const StyledSlider = styled(Slider)`
  padding-top: 1rem;
  padding-bottom: 1rem;
  height: 0;
`;

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
    <StyledDiv>
      <StyledSlider
        value={brightness}
        min={0}
        max={100}
        step={1}
        onChange={onBrightnessChange}
        disabled={connected !== 2}
      />
    </StyledDiv>
  );
};

BrightnessSlider.propTypes = propTypes;
BrightnessSlider.defaultProps = defaultProps;

export default BrightnessSlider;
