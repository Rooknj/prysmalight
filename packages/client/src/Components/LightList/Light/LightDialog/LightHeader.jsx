import React from "react";
import PropTypes from "prop-types";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import IconButton from "@material-ui/core/IconButton";
import Typography from "@material-ui/core/Typography";
import CloseIcon from "@material-ui/icons/ArrowBack";

import styled from "styled-components";

const StyledToolbar = styled(Toolbar)`
  align-items: center;
`;

const StyledIconButton = styled(IconButton)`
  margin-right: 0.5em;
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
    const { onClose, light } = this.props;
    return (
      <AppBar position="relative" color="secondary">
        <StyledToolbar>
          <StyledIconButton color="inherit" onClick={onClose} aria-label="Close">
            <CloseIcon />
          </StyledIconButton>
          <Typography variant="h6" color="inherit">
            {light.id}
          </Typography>
        </StyledToolbar>
      </AppBar>
    );
  }
}

LightHeader.propTypes = propTypes;
LightHeader.defaultProps = defaultProps;

export default LightHeader;
