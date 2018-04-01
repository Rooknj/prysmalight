import React from "react";
import { graphql } from "react-apollo";
import gql from "graphql-tag";

const LightList = props => (
  <div>
    <ol>
      {props.data.lights &&
        props.data.lights.map(light => <li>{light.name}</li>)}
    </ol>
  </div>
);

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

export default graphql(LIGHTS_QUERY)(LightList);
