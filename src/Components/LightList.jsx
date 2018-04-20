import React from "react";
import PropTypes from "prop-types";
import { graphql } from "react-apollo";
import gql from "graphql-tag";
import Light from "./Light.jsx";

const propTypes = {
    data: PropTypes.shape({
        loading: PropTypes.bool,
        error: PropTypes.object,
        lights: PropTypes.arrayOf(
            PropTypes.shape({
                id: PropTypes.number,
                name: PropTypes.string
            })
        )
    }).isRequired
};

const defaultProps = {
    data: {
        lights: []
    }
};

const GET_LIGHTS = gql`
    query getLights {
        lights {
            id
            name
            power
            brightness
            color {
                r
                g
                b
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

LightList.propTypes = propTypes;
LightList.defaultProps = defaultProps;

export default graphql(GET_LIGHTS)(LightList);
