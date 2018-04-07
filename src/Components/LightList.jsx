import React from "react";
import { Query } from "react-apollo";
import gql from "graphql-tag";
import Light from "./Light.jsx";

const GET_LIGHTS = gql`
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

const LightList = props => (
    <Query query={GET_LIGHTS}>
        {({ loading, error, data }) => {
            if (loading) return "Loading...";
            if (error) return `Error! ${error.message}`;

            return (
                <div>
                    <p>Lights:</p>
                    <ul>
                        {data.lights.map(light => (
                            <Light key={light.id} light={light} />
                        ))}
                    </ul>
                </div>
            );
        }}
    </Query>
);

export default LightList;
