import React from "react";
import Slider from "@material-ui/lab/Slider";

export default class SmoothSlider extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      value: props.value
    };
  }

  handleChange = (_, value) => {
    this.setState({ value });
    this.props.onChange(_, value);
  };

  componentDidUpdate(prevProps) {
    if (this.props.value !== prevProps.value) {
      this.setState({ value: this.props.value });
    }
  }

  render() {
    const { value, onChange, ...props } = this.props;
    return (
      <Slider
        value={this.state.value}
        onChange={this.handleChange}
        {...props}
      />
    );
  }
}
