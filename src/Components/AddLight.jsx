import React from "react";
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

const ADD_LIGHT_MUTATION = gql`
    mutation addLight($newLight: LightInput!) {
        addLight(newLight: $newLight) {
            id
            name
            power
            brightness
            hue
            saturation
        }
    }
`;

class AddLight extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            name: "",
            power: false,
            brightness: 0,
            hue: 0,
            saturation: 0
        };
    }

    handleChange = evt => {
        this.setState({
            [evt.target.name]: evt.target.value
        });
    };

    handleClick = () => {
        // mutations give this component a mutate prop
        // the mutate prop is a promise that sends the mutation and returns
        // the data or an error
        this.props
            .mutate({
                variables: {
                    newLight: {
                        name: this.state.name,
                        power: this.state.power,
                        brightness: this.state.brightness,
                        hue: this.state.hue,
                        saturation: this.state.saturation
                    }
                }, //This is the set of variables you send with the mutation query
                update: (proxy, { data: { addLight } }) => {
                    //How to update your UI automatically
                    // Read the data from our cache for this query.
                    const data = proxy.readQuery({ query: LIGHTS_QUERY });
                    console.log("light data", data);
                    // Add our todo from the mutation to the end.
                    data.lights.push(addLight);

                    // Write our data back to the cache.
                    proxy.writeQuery({ query: LIGHTS_QUERY, data });
                }
            })
            .then(({ data }) => {
                console.log("got data", data);
                this.setState({
                    name: "",
                    power: false,
                    brightness: 0,
                    hue: 0,
                    saturation: 0
                });
            })
            .catch(error => {
                console.log("there was an error sending the query", error);
                this.setState({
                    name: error
                });
            });
    };

    render() {
        return (
            <div>
                <label htmlFor="addLight-name-input">Light Name: </label>
                <input
                    name="name"
                    type="text"
                    id="addLight-name-input"
                    value={this.state.name}
                    onChange={this.handleChange}
                />
                <br />
                <label htmlFor="addLight-brightness-input">
                    Brightness: {this.state.brightness}
                </label>
                <input
                    name="brightness"
                    type="range"
                    id="addLight-name-input"
                    min={0}
                    max={100}
                    value={this.state.brightness}
                    onChange={this.handleChange}
                />
                <br />
                <label htmlFor="addLight-hue-input">
                    Hue: {this.state.hue}
                </label>
                <input
                    name="hue"
                    type="range"
                    id="addLight-hue-input"
                    min={0}
                    max={255}
                    value={this.state.hue}
                    onChange={this.handleChange}
                />
                <br />
                <label htmlFor="addLight-saturation-input">
                    Saturation: {this.state.saturation}
                </label>
                <input
                    name="saturation"
                    type="range"
                    id="addLight-saturation-input"
                    min={0}
                    max={255}
                    value={this.state.saturation}
                    onChange={this.handleChange}
                />
                <br />
                <button onClick={this.handleClick}>Add Light</button>
            </div>
        );
    }
}

export default graphql(ADD_LIGHT_MUTATION)(AddLight);
