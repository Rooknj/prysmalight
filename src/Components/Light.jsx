import React from "react";
import { Mutation } from "react-apollo";
import gql from "graphql-tag";
import { ChromePicker } from "react-color";

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

const SET_LIGHT = gql`
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

    handleMutationCompleted = ({ data }) => {
        console.log("Light Updated Successfully!");
    };

    handleMutationError = error => {
        console.error("Error Setting Light:", error);
    };

    render() {
        const variables = {
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
        };

        return (
            <Mutation
                mutation={SET_LIGHT}
                variables={variables}
                onCompleted={this.handleMutationCompleted}
                onError={this.handleMutationError}
            >
                {(setLight, { data }) => (
                    <li>
                        <label htmlFor="editLight-name-input">
                            Light Name:{" "}
                        </label>
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
                        <button onClick={setLight}>Edit Light</button>
                    </li>
                )}
            </Mutation>
        );
    }
}

export default Light;
