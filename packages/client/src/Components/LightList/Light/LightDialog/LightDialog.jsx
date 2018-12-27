import React from "react";
import PropTypes from "prop-types";
import Dialog from "@material-ui/core/Dialog";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import IconButton from "@material-ui/core/IconButton";
import Typography from "@material-ui/core/Typography";
import CloseIcon from "@material-ui/icons/Close";
import Slide from "@material-ui/core/Slide";
import ComplexLight from "./ComplexLight";

import styled from "styled-components";

const StyledToolbar = styled(Toolbar)`
  align-items: center;
  justify-content: space-between;
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
  loading: PropTypes.bool,
  onStateChange: PropTypes.func.isRequired,
  onBrightnessChange: PropTypes.func.isRequired,
  onColorChange: PropTypes.func.isRequired,
  onEffectChange: PropTypes.func.isRequired
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

function Transition(props) {
  return <Slide direction="up" {...props} />;
}

class LightDialog extends React.Component {
  render() {
    const { onClose, open, light } = this.props;
    return (
      <Dialog
        fullScreen
        open={open}
        onClose={onClose}
        TransitionComponent={Transition}
      >
        <AppBar position="relative" color="secondary">
          <StyledToolbar>
            <Typography variant="h6" color="inherit">
              {light.id}
            </Typography>
            <IconButton color="inherit" onClick={onClose} aria-label="Close">
              <CloseIcon />
            </IconButton>
          </StyledToolbar>
        </AppBar>
        <ComplexLight {...this.props} />
      </Dialog>
    );
  }
}

LightDialog.propTypes = propTypes;
LightDialog.defaultProps = defaultProps;

export default LightDialog;
