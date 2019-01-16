import React from "react";
import PropTypes from "prop-types";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import IconButton from "@material-ui/core/IconButton";
import Typography from "@material-ui/core/Typography";
import CloseIcon from "@material-ui/icons/ArrowBack";
import Switch from "@material-ui/core/Switch";
import Slider from "../SmoothSlider";

import styled from "styled-components";

const StyledToolbar = styled(Toolbar)`
  align-items: center;
  justify-content: space-between;
`;

const LeftSide = styled.div`
  display: flex;
  align-items: center;
`;

const StyledIconButton = styled(IconButton)`
  margin-right: 0.5em;
`;

const StyledSlider = styled(Slider)`
  position: fixed;
  top: 44px;
  padding-top: 12px;
  padding-bottom: 12px;
  @media (min-width: 600px) {
    top: 52px;
  }
`;

const propTypes = {
  light: PropTypes.shape({
    id: PropTypes.string.isRequired,
    connected: PropTypes.number,
    state: PropTypes.string,
    brightness: PropTypes.number,
    color: PropTypes.shape({
      r: PropTypes.number.isRequired,
      g: PropTypes.number.isRequired,
      b: PropTypes.number.isRequired
    }),
    effect: PropTypes.string,
    speed: PropTypes.number,
    supportedEffects: PropTypes.array
  }),
  onStateChange: PropTypes.func.isRequired,
  onBrightnessChange: PropTypes.func.isRequired
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

class LightHeader extends React.Component {
  render() {
    const { onClose, light, onStateChange, onBrightnessChange } = this.props;
    return (
      <AppBar position="relative" color="secondary">
        <StyledToolbar variant={"regular"}>
          <LeftSide>
            <StyledIconButton
              color="inherit"
              onClick={onClose}
              aria-label="Close"
            >
              <CloseIcon />
            </StyledIconButton>
            <Typography variant="h6" color="inherit">
              {light.id}
            </Typography>
          </LeftSide>
          <Switch
            checked={light.state === "ON" ? true : false}
            onChange={onStateChange}
            disabled={light.connected !== 2}
            color="primary"
          />
        </StyledToolbar>
        <StyledSlider
          value={light.brightness}
          min={0}
          max={100}
          step={1}
          onChange={onBrightnessChange}
          disabled={light.connected !== 2}
        />
      </AppBar>
    );
  }
}

LightHeader.propTypes = propTypes;
LightHeader.defaultProps = defaultProps;

export default LightHeader;
