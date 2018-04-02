import React from "react";

class Light extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <li>
        <p>Name: {this.props.light.name}</p>
        <p>Brightness: {this.props.light.power ? "On" : "Off"}</p>
        <p>Power: {this.props.light.brightness}</p>
        <p>Hue: {this.props.light.hue}</p>
        <p>Saturation: {this.props.light.saturation}</p>
        <button>Edit</button>
        <button>Delete</button>
        <br />
      </li>
    );
  }
}

export default Light;
