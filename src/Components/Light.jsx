import React from "react";
import EditLightForm from "./EditLightForm";

class Light extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <li>
                <p>Name: {this.props.light.name}</p>
                <p>Power: {this.props.light.power ? "On" : "Off"}</p>
                <p>Brightness: {this.props.light.brightness}</p>
                <p>Hue: {this.props.light.hue}</p>
                <p>Saturation: {this.props.light.saturation}</p>
                <EditLightForm light={this.props.light} />
                <button>Delete</button>
                <br />
            </li>
        );
    }
}

export default Light;
