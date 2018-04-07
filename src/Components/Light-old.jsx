import React from "react";
import EditLightForm from "./EditLightForm";
import { graphql } from "react-apollo";
import gql from "graphql-tag";

const LIGHTS_QUERY = gql`
    query Lights {
        lights {
            id
            name
            power
            brightness
            hue
            saturation
        }
    }
`;

const SET_LIGHT_MUTATION = gql`
    mutation setLight($lightId: Int!, $light: LightInput!) {
        setLight(lightId: $lightId, light: $light) {
            id
            name
            power
            brightness
            hue
            saturation
        }
    }
`;

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
