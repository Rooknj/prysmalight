import React from "react";
import { graphql } from "react-apollo";
import gql from "graphql-tag";
import { ChromePicker } from "react-color";

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

const SET_LIGHT_MUTATION = gql`
    mutation setLight($lightId: Int!, $light: LightInput!) {
        setLight(lightId: $lightId, light: $light) {
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

class Light extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            name: this.props.light.name,
            power: this.props.light.power,
            brightness: this.props.light.brightness,
            color: {
                h: this.props.light.color.hue,
                s: this.props.light.color.saturation,
                l: this.props.light.color.lightness
            }
        };
    }

    handleChange = evt => {
        this.setState({
            [evt.target.name]: evt.target.value
        });
    };

    handleColorChange = color => {
        console.log(color.hsl);
        this.setState({ color: color.hsl });
    };

    handleClick = () => {
        // mutations give this component a mutate prop
        // the mutate prop is a promise that sends the mutation and returns
        // the data or an error
        this.props
            .mutate({
                variables: {
                    lightId: this.props.light.id,
                    light: {
                        name: this.state.name,
                        power: this.state.power,
                        brightness: this.state.brightness,
                        color: {
                            hue: this.state.color.h,
                            saturation: this.state.color.s,
                            lightness: this.state.color.l
                        }
                    }
                }, // This is the set of variables you send with the mutation query
                update: (proxy, { data: { setLight } }) => {
                    // How to update your UI automatically
                    // Read the data from our cache for this query.
                    const data = proxy.readQuery({ query: LIGHTS_QUERY });
                    console.log("light data", data);
                    // edit our todo from the mutation to the end.
                    let light = data.lights.find(
                        ({ id }) => id === setLight.id
                    );
                    light = setLight;
                    console.log("light", light);
                    // Write our data back to the cache.
                    proxy.writeQuery({ query: LIGHTS_QUERY, data });
                }
            })
            .then(({ data }) => {
                console.log("got data", data);
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
            <li>
                <label htmlFor="editLight-name-input">Light Name: </label>
                <input
                    name="name"
                    type="text"
                    id="editLight-name-input"
                    value={this.state.name}
                    onChange={this.handleChange}
                />
                <br />
                <label htmlFor="editLight-brightness-input">
                    Brightness: {this.state.brightness}
                </label>
                <input
                    name="brightness"
                    type="range"
                    id="editLight-name-input"
                    min={0}
                    max={100}
                    value={this.state.brightness}
                    onChange={this.handleChange}
                />
                <br />
                <label htmlFor="editLight-color-input">Color:</label>
                <ChromePicker
                    id="editLight-color-input"
                    disableAlpha={true}
                    color={this.state.color}
                    onChangeComplete={this.handleColorChange}
                />
                <br />
                <button onClick={this.handleClick}>Edit Light</button>
            </li>
        );
    }
}

export default graphql(SET_LIGHT_MUTATION)(Light);
