import React from "react";
import PropTypes from "prop-types";
import BottomNavigation from "@material-ui/core/BottomNavigation";
import BottomNavigationAction from "@material-ui/core/BottomNavigationAction";
import ColorIcon from "mdi-material-ui/FormatColorFill";
import ThemeIcon from "mdi-material-ui/Palette";
import FlashIcon from "mdi-material-ui/Flash";
import styled from "styled-components";

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

const StyledBottomNavigation = styled(BottomNavigation)`
  width: 100%;
  position: fixed;
  bottom: 0;
`;

class Light extends React.Component {
  state = {
    value: 0
  };

  handleChange = (_, value) => {
    console.log(value);
    this.setState({ value });
  };

  render() {
    const {
      light,
      loading,
      onStateChange,
      onEffectChange,
      onBrightnessChange,
      onColorChange
    } = this.props;
    const { value } = this.state;
    return (
      <StyledBottomNavigation
        value={value}
        onChange={this.handleChange}
        showLabels
      >
        <BottomNavigationAction label="Colors" icon={<ColorIcon />} />
        <BottomNavigationAction label="Themes" icon={<ThemeIcon />} />
        <BottomNavigationAction label="Effects" icon={<FlashIcon />} />
      </StyledBottomNavigation>
    );
  }
}

Light.propTypes = propTypes;
Light.defaultProps = defaultProps;

export default Light;
