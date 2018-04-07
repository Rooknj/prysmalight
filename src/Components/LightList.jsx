import React from "react";
import { graphql } from "react-apollo";
import gql from "graphql-tag";
import Light from "./Light.jsx";

const LightList = props => (
    <div>
        <p>Lights:</p>
        <ul>
            {props.data.lights &&
                props.data.lights.map(light => (
                    <Light key={light.id} light={light} />
                ))}
        </ul>
    </div>
);

const LIGHTS_QUERY = gql`
    query Lights {
        lights {
            id
            name
            power
            brightness
            color {
                hue
                saturation
                lightness
            }
        }
    }
`;

export default graphql(LIGHTS_QUERY)(LightList);
