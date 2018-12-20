import React from "react";
import PropTypes from "prop-types";
import Slider from "@material-ui/lab/Slider";
import styled from "styled-components";
import BrightnessIcon from "@material-ui/icons/BrightnessLow";

const IconDiv = styled.div`
  margin-top: auto;
  margin-bottom: auto;
  padding-right: 1rem;
  padding-left: 1rem;
`;

const StyledDiv = styled.div`
  height: 2rem;
  margin-bottom: 1rem;
  margin-left: 1rem;
  margin-right: 1rem;
  display: flex;
`;

const StyledSlider = styled(Slider)`
  padding-top: 1rem;
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

BrightnessSlider.propTypes = propTypes;
BrightnessSlider.defaultProps = defaultProps;

export default BrightnessSlider;
