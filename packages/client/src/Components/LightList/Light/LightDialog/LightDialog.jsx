import React from "react";
import PropTypes from "prop-types";
import Dialog from "@material-ui/core/Dialog";
import Slide from "@material-ui/core/Slide";
import LightControls from "./LightControls";
import LightHeader from "./DialogHeader";

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
  onEffectChange: PropTypes.func.isRequired,
  onSpeedChange: PropTypes.func.isRequired
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
    const {
      onClose,
      open,
      light,
      onStateChange,
      onBrightnessChange
    } = this.props;
    return (
      <Dialog
        fullScreen
        open={open}
        onClose={onClose}
        TransitionComponent={Transition}
      >
        <LightHeader
          light={light}
          onClose={onClose}
          onStateChange={onStateChange}
          onBrightnessChange={onBrightnessChange}
        />
        <LightControls {...this.props} />
      </Dialog>
    );
  }
}

LightDialog.propTypes = propTypes;
LightDialog.defaultProps = defaultProps;

export default LightDialog;
