import React from "react";
import PropTypes from "prop-types";

import Card from "@material-ui/core/Card";
import LightHeader from "./LightHeader/LightHeader";
import LightContent from "./LightContent/LightContent";
import Collapse from "@material-ui/core/Collapse";

import styled from "styled-components";

const StyledCardWrapper = styled.div`
  min-width: 20rem;
  max-width: 27rem;
  margin: 0 auto;
  padding: 1em;
`;

const colors = [
  "#FF0000", //red
  "#FFA500", //orange
  "#FFFF00", //yellow
  "#00FF00", //green
  "#00FFFF", //cyan
  "#0000FF", //blue
  "#A500FF", //purple
  "#FF00FF" //pink
];

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
  render() {
    const {
      light,
      loading,
      onStateChange,
      onEffectChange,
      onBrightnessChange,
      onColorChange
    } = this.props;
    return (
      <StyledCardWrapper>
        <Card>
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
            <LightContent
              connected={light.connected}
              brightness={light.brightness}
              color={light.color}
              colors={colors}
              effect={light.effect}
              supportedEffects={light.supportedEffects}
              speed={light.speed}
              onInputChange={onEffectChange}
              onBrightnessChange={onBrightnessChange}
              onColorChange={onColorChange}
            />
          </Collapse>
        </Card>
      </StyledCardWrapper>
    );
  }
}

Light.propTypes = propTypes;
Light.defaultProps = defaultProps;

export default Light;
