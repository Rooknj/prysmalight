import React from "react";
import PropTypes from "prop-types";
import Grid from "@material-ui/core/Grid";
import Button from "@material-ui/core/Button";
import styled from "styled-components";
import Slider from "../../SmoothSlider";
import TurtleIcon from "mdi-material-ui/Turtle";
import RabbitIcon from "mdi-material-ui/Rabbit";

const StyledSlider = styled(Slider)`
  padding-top: 1em;
  padding-bottom: 1em;
`;

const SpeedSection = styled.div`
  display: flex;
  padding-top: 1em;
  padding-bottom: 1em;
  overflow-x: hidden;
  margin-top: auto;
`; // The overflow-x is to fix this bug https://github.com/mui-org/material-ui/issues/13455

const MarginContainer = styled.div`
  margin: 2em 1em 0em 1em
`; // The overflow-x is to fix this bug https://github.com/mui-org/material-ui/issues/13455

const FastIcon = styled(RabbitIcon)`
  margin-left: 1em;
`;

const SlowIcon = styled(TurtleIcon)`
  margin-right: 1em;
`;

const EffectButton = styled(Button)`
  margin: auto;
  display: flex;
  min-width: 8em;
  margin-bottom: 1em;
`;

const propTypes = {
  connected: PropTypes.number,
  effect: PropTypes.string,
  onEffectChange: PropTypes.func,
  onSpeedChange: PropTypes.func,
  supportedEffects: PropTypes.array,
  speed: PropTypes.number
};

const defaultProps = {
  effect: "None",
  onInputChange: () => {},
  supportedEffects: [],
  speed: 4
};

class EffectControls extends React.Component {
  handleClick = effect => () => {
    this.props.onEffectChange(effect);
  };

  render() {
    const {
      supportedEffects,
      effect,
      speed,
      connected,
      onSpeedChange
    } = this.props;
    return (
      <MarginContainer>
        <Grid container>
          {supportedEffects.map(supportedEffect => (
            <Grid key={supportedEffect} item xs={6} sm={4} md={3}>
              <EffectButton
                variant="contained"
                color={supportedEffect === effect ? "secondary" : "primary"}
                onClick={this.handleClick(supportedEffect)}
              >
                {supportedEffect}
              </EffectButton>
            </Grid>
          ))}
        </Grid>
        <SpeedSection>
          <SlowIcon color="primary" />
          <StyledSlider
            value={speed}
            min={1}
            max={7}
            step={1}
            onChange={onSpeedChange}
            disabled={connected !== 2}
          />
          <FastIcon color="primary" />
        </SpeedSection>
      </MarginContainer>
    );
  }
}
EffectControls.propTypes = propTypes;
EffectControls.defaultProps = defaultProps;

export default EffectControls;
