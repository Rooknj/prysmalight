import React from "react";
import { graphql } from "react-apollo";
import gql from "graphql-tag";
import Light from "./Light.jsx";

const GET_LIGHTS = gql`
    query getLights {
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

const LightList = ({ data: { loading, error, lights } }) => {
    if (loading) return "Loading...";
    if (error) return `Error! ${error.message}`;

    return (
        <div>
            <p>Lights:</p>
            <ul>
                {lights.map(light => <Light key={light.id} light={light} />)}
            </ul>
        </div>
    );
};

export default graphql(GET_LIGHTS)(LightList);
