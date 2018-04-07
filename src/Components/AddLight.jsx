import React from "react";
import { Mutation } from "react-apollo";
import gql from "graphql-tag";

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

const ADD_LIGHT = gql`
    mutation addLight($newLight: LightInput!) {
        addLight(newLight: $newLight) {
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

class AddLight extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            name: ""
        };
    }

    handleChange = evt => {
        this.setState({
            [evt.target.name]: evt.target.value
        });
    };

    handleMutationCompleted = ({ data }) => {
        console.log("Light Added Successfully!");
    };

    handleMutationError = error => {
        console.error("Error Adding Light:", error);
    };

    update = (cache, { data: { addLight } }) => {
        //How to update your UI automatically
        // Read the data from our cache for this query.
        const data = cache.readQuery({ query: GET_LIGHTS });
        // Add our light from the mutation to the end.
        data.lights.push(addLight);

        // Write our data back to the cache.
        cache.writeQuery({ query: GET_LIGHTS, data });
    };

    render() {
        const variables = {
            newLight: {
                name: this.state.name,
                power: false,
                brightness: 0,
                color: {
                    hue: 0,
                    saturation: 0,
                    lightness: 0
                }
            }
        };

        return (
            <Mutation
                mutation={ADD_LIGHT}
                variables={variables}
                update={this.update}
                onCompleted={this.handleMutationCompleted}
                onError={this.handleMutationError}
            >
                {(addLight, { data }) => (
                    <div>
                        <p>Add Light: </p>
                        <label htmlFor="addLight-name-input">
                            Light Name:{" "}
                        </label>
                        <input
                            name="name"
                            type="text"
                            id="addLight-name-input"
                            value={this.state.name}
                            onChange={this.handleChange}
                        />
                        <br />
                        <button onClick={addLight}>Add Light</button>
                    </div>
                )}
            </Mutation>
        );
    }
}

export default AddLight;
