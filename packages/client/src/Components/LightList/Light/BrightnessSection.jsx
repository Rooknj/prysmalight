import React from "react";
import PropTypes from "prop-types";
import Slider from "./SmoothSlider";
import styled from "styled-components";
import BrightnessIcon from "@material-ui/icons/BrightnessLow";

const IconDiv = styled.div`
  margin-top: auto;
  margin-bottom: auto;
  padding-right: 1rem;
  padding-left: 1rem;
`;

const StyledDiv = styled.div`
  margin-bottom: 1rem;
  margin-left: 1rem;
  margin-right: 1rem;
  display: flex;
`;

const StyledSlider = styled(Slider)`
  padding-top: 1rem;
  padding-bottom: 1rem;
`;

const propTypes = {
  connected: PropTypes.number,
  brightness: PropTypes.number,
  onBrightnessChange: PropTypes.func
};

const defaultProps = {};

const BrightnessSection = ({ brightness, onBrightnessChange, connected }) => {
  return (
    <React.Fragment>
      <StyledDiv onClick={e => e.stopPropagation()}>
        <IconDiv>
          <BrightnessIcon color="primary" />
        </IconDiv>
        <StyledSlider
          value={brightness}
          min={0}
          max={100}
          step={1}
          onChange={onBrightnessChange}
          disabled={connected !== 2}
        />
      </StyledDiv>
    </React.Fragment>
  );
};

BrightnessSection.propTypes = propTypes;
BrightnessSection.defaultProps = defaultProps;

export default BrightnessSection;
