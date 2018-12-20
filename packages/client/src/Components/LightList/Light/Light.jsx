import React from "react";
import PropTypes from "prop-types";

import Card from "@material-ui/core/Card";
import LightHeader from "./LightHeader/LightHeader";
import BrightnessSlider from "./BrightnessSlider/BrightnessSlider";
import Collapse from "@material-ui/core/Collapse";

import LightDialog from "./LightDialog/LightDialog";

import styled from "styled-components";

const StyledCardWrapper = styled.div`
  min-width: 18rem;
  margin: 0 auto;
  padding: 0.5rem;
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

class Light extends React.Component {
  state = {
    open: false
  };

  handleOpen = () => {
    this.setState({ open: true });
  };

  handleClose = () => {
    this.setState({ open: false });
  };

  render() {
    const { light, loading, onStateChange, onBrightnessChange } = this.props;
    return (
      <React.Fragment>
        <LightDialog
          open={this.state.open}
          onClose={this.handleClose}
          {...this.props}
        />
        <StyledCardWrapper>
          <Card onClick={this.handleOpen}>
            <LightHeader
              id={light.id}
              color={light.color}
              connected={light.connected}
              state={light.state}
              onChange={onStateChange}
              waiting={loading}
            />
            <Collapse
              in={light.state === "ON" ? true : false}
              timeout="auto"
              unmountOnExit
            >
              <BrightnessSlider
                connected={light.connected}
                brightness={light.brightness}
                onBrightnessChange={onBrightnessChange}
              />
            </Collapse>
          </Card>
        </StyledCardWrapper>
      </React.Fragment>
    );
  }
}

Light.propTypes = propTypes;
Light.defaultProps = defaultProps;

export default Light;
