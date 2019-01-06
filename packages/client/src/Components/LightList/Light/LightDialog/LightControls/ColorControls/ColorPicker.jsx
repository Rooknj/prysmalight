import React from "react";
import PropTypes from "prop-types";
import { CustomPicker } from "react-color";
import iro from "@jaames/iro";

const propTypes = {
  color: PropTypes.shape({
    r: PropTypes.number.isRequired,
    g: PropTypes.number.isRequired,
    b: PropTypes.number.isRequired
  })
};

const defaultProps = {
  color: {
    r: 0,
    g: 0,
    b: 0
  }
};

class ColorControls extends React.Component {
  constructor(props) {
    super(props);
    this.myRef = React.createRef();
  }

  componentDidMount() {
    this.colorWheel = new iro.ColorPicker(this.myRef.current, {
      color: this.props.hex,
      display: "block",
      width: 320,
      height: 320,
      anticlockwise: true,
      CSS: {} // apply colors to any elements
    });
    this.colorWheel.on("color:change", this.onIroChange);
  }

  componentWillUnmount() {
    this.colorWheel.off("color:change", this.onIroChange);
  }

  shouldComponentUpdate(nextProps) {
    return this.props.hex !== nextProps.hex;
  }

  componentDidUpdate(prevProps) {
    if (this.props.hex !== prevProps.hex) {
      this.colorWheel.color.hexString = this.props.hex;
    }
  }

  onIroChange = color => {
    if (this.props.hex !== color.hexString) {
      this.props.onChange(color.hexString);
    }
  };

  render() {
    return <div className="ColorWheel" ref={this.myRef} />;
  }
}
ColorControls.propTypes = propTypes;
ColorControls.defaultProps = defaultProps;

export default CustomPicker(ColorControls);
