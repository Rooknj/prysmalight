import React from "react";
import PropTypes from "prop-types";
import { graphql } from "react-apollo";
import gql from "graphql-tag";
import throttle from "lodash.throttle";

import Card, { CardHeader, CardContent } from "material-ui/Card";
import Avatar from "material-ui/Avatar";
import grey from "material-ui/colors/grey";
import { withStyles } from "material-ui/styles";

import Switch from "material-ui/Switch";

import { MaterialPicker, CirclePicker, HuePicker } from "react-color";
import Slider from "rc-slider";
import "./slider.css";

import Grid from "material-ui/Grid";
import Typography from "material-ui/Typography";

import HightlightIcon from "@material-ui/icons/Highlight";

import Select from "material-ui/Select";
import { InputLabel } from "material-ui/Input";
import { MenuItem } from "material-ui/Menu";
import { FormControl } from "material-ui/Form";

const styles = theme => ({
    card: {
        minWidth: 300,
        maxWidth: 400
    },
    avatar: {
        backgroundColor: grey[400]
    },
    huePicker: {
        // This disables scrolling when using the slider
        touchAction: "none"
    },
    circlePicker: {
        justifyContent: "flex-left"
    },
    materialPicker: {
        boxSizing: "content-box"
    },
    formControl: {
        margin: theme.spacing.unit,
        minWidth: 120
    }
});

const colors = [
    "#FF0000", //red
    "#FFA500", //orange
    "#FFFF00", //yellow
    "#00FF00", //green
    "#00FFFF", //cyan
    "#0000FF", //blue
    "#A500FF", //purple
    "#FF00FF" //pink
];

const propTypes = {
    light: PropTypes.shape({
        id: PropTypes.string,
        connected: PropTypes.number,
        state: PropTypes.string,
        brightness: PropTypes.number,
        color: PropTypes.shape({
            r: PropTypes.number,
            g: PropTypes.number,
            b: PropTypes.number
        })
    }).isRequired
};

const defaultProps = {
    light: {
        id: "",
        connected: 0,
        state: "OFF",
        brightness: 0,
        color: {
            r: 0,
            g: 0,
            b: 0
        }
    }
};

const SET_LIGHT = gql`
    mutation setLight($light: LightInput!) {
        setLight(light: $light)
    }
`;

const LIGHT_CHANGED = gql`
    subscription lightChanged {
        lightChanged(lightId: "Light 1") {
            id
            connected
            state
            brightness
            color {
                r
                g
                b
            }
            effect
            speed
            supportedEffects
        }
    }
`;

class Light extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            id: this.props.light.id,
            connected: this.props.light.connected,
            state: this.props.light.state,
            brightness: this.props.light.brightness,
            color: this.props.light.color,
            effect: this.props.light.effect,
            speed: this.props.light.speed,
            supportedEffects: this.props.light.supportedEffects,
            ignoreUpdates: false,
            colors: colors
        };
    }

    static propTypes = propTypes;
    static defaultProps = defaultProps;

    static getDerivedStateFromProps(
        {
            data: { loading, lightChanged }
        },
        prevState
    ) {
        // Dont rerender if data is loading or if we are currently interacting with the UI
        // TODO check if this is why we are not getting subscription updates
        if (loading || prevState.ignoreUpdates) {
            return prevState;
        }

        // decompose the incoming data from the subscription
        const {
            connected,
            state,
            brightness,
            color,
            effect,
            speed
        } = lightChanged;
        let nextState = {};

        // If the incoming data is the same as the current state, ignore it
        if (state && state !== prevState.state) {
            nextState = { ...nextState, ...{ state } };
        }
        if (brightness && brightness !== prevState.brightness) {
            nextState = { ...nextState, ...{ brightness } };
        }
        if (
            typeof connected === "number" &&
            connected !== prevState.connected
        ) {
            nextState = { ...nextState, ...{ connected } };
        }
        if (
            color &&
            (color.r !== prevState.color.r ||
                color.g !== prevState.color.g ||
                color.b !== prevState.color.b)
        ) {
            nextState = { ...nextState, ...{ color } };
        }
        if (effect && effect !== prevState.effect) {
            nextState = { ...nextState, ...{ effect } };
        }
        if (speed && speed !== prevState.speed) {
            nextState = { ...nextState, ...{ speed } };
        }

        // If nextState is empty, that means all the data is the same so we should just return the previous state
        return Object.keys(nextState).length > 0 ? nextState : prevState;
    }

    handleMutationCompleted = ({ data }) => {
        //console.log("Data Received: ", data);
    };

    handleMutationError = error => {
        console.error("Error Setting Light:", error);
    };

    setLight = throttle(variables => {
        this.props
            .mutate({ variables })
            .then(this.handleMutationCompleted)
            .catch(this.handleMutationError);
        this.setState({ ignoreUpdates: false });
    }, 500);

    handleStateChange = evt => {
        this.setState({
            state: evt.target.checked ? "ON" : "OFF",
            ignoreUpdates: true
        });
        const variables = {
            light: {
                id: this.props.light.id,
                state: evt.target.checked ? "ON" : "OFF"
            }
        };
        this.setLight(variables);
    };

    handleBrightnessChange = brightness => {
        this.setState({
            brightness,
            ignoreUpdates: true
        });
        const variables = {
            light: {
                id: this.props.light.id,
                brightness
            }
        };
        this.setLight(variables);
    };

    handleColorChange = ({ rgb: { r, g, b } }) => {
        if (
            r === this.state.color.r &&
            g === this.state.color.g &&
            b === this.state.color.b
        ) {
            return;
        }
        this.setState({
            color: { r, g, b },
            state: "ON",
            ignoreUpdates: true
        });
        const variables = {
            light: {
                id: this.props.light.id,
                color: {
                    r,
                    g,
                    b
                }
            }
        };
        this.setLight(variables);
    };

    handleInputChange = evt => {
        this.setState({
            [evt.target.name]: evt.target.value,
            ignoreUpdates: true
        });
        const variables = {
            light: {
                id: this.props.light.id,
                [evt.target.name]: evt.target.value
            }
        };
        this.setLight(variables);
    };

    displayConnection = () => {
        return this.state.connected === 2 ? "Connected" : "Disonnected";
    };

    render() {
        const { classes } = this.props;
        return (
            <Card className={classes.card}>
                <Grid container justify="space-between">
                    <Grid item xs={9}>
                        <CardHeader
                            title={this.state.id}
                            subheader={this.displayConnection()}
                            avatar={
                                <Avatar
                                    aria-label="Light"
                                    className={classes.avatar}
                                >
                                    <HightlightIcon
                                        nativeColor={`rgb(${
                                            this.state.color.r
                                        },${this.state.color.g},${
                                            this.state.color.b
                                        })`}
                                    />
                                </Avatar>
                            }
                        />
                    </Grid>
                    <Grid
                        item
                        xs={3}
                        style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "flex-end"
                        }}
                    >
                        <Switch
                            checked={this.state.state === "ON" ? true : false}
                            onChange={this.handleStateChange}
                            disabled={this.state.connected !== 2}
                            color="primary"
                        />
                    </Grid>
                </Grid>
                <CardContent>
                    <Grid
                        container
                        direction="row"
                        spacing={16}
                        justify="center"
                        alignItems="center"
                    >
                        <Grid item xs={12}>
                            <Typography variant="body2">Brightness</Typography>
                        </Grid>
                        <Grid item xs={12}>
                            <Slider
                                min={0}
                                max={100}
                                step={1}
                                value={this.state.brightness}
                                onChange={this.handleBrightnessChange}
                                disabled={this.state.connected !== 2}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <Typography variant="body2">Color</Typography>
                        </Grid>
                        <Grid item xs={12}>
                            <HuePicker
                                color={this.state.color}
                                onChange={this.handleColorChange}
                                width={"100%"}
                                className={classes.huePicker}
                            />
                        </Grid>
                        <Grid
                            container
                            justify="flex-end"
                            alignItems="center"
                            alignContent="space-between"
                        >
                            <Grid
                                item
                                xs={6}
                                style={{
                                    display: "flex",
                                    justifyContent: "space-around"
                                }}
                            >
                                <CirclePicker
                                    color={this.state.color}
                                    onChange={this.handleColorChange}
                                    width={"100%"}
                                    colors={this.state.colors}
                                    className={classes.circlePicker}
                                />
                            </Grid>
                            <Grid
                                item
                                xs={6}
                                style={{
                                    display: "flex",
                                    justifyContent: "flex-end"
                                }}
                            >
                                <MaterialPicker
                                    color={this.state.color}
                                    onChange={this.handleColorChange}
                                    className={classes.materialPicker}
                                />
                            </Grid>
                        </Grid>
                        <Grid
                            container
                            justify="space-between"
                            alignItems="center"
                        >
                            <Grid item xs={6}>
                                <FormControl className={classes.formControl}>
                                    <InputLabel htmlFor="effect">
                                        Effect
                                    </InputLabel>
                                    <Select
                                        value={this.state.effect}
                                        onChange={this.handleInputChange}
                                        inputProps={{
                                            name: "effect",
                                            id: "effect"
                                        }}
                                    >
                                        {this.state.supportedEffects.map(
                                            effect => (
                                                <MenuItem
                                                    key={effect}
                                                    value={effect}
                                                >
                                                    {effect}
                                                </MenuItem>
                                            )
                                        )}
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid
                                item
                                xs={6}
                                style={{
                                    display: "flex",
                                    justifyContent: "flex-end"
                                }}
                            >
                                <FormControl className={classes.formControl}>
                                    <InputLabel htmlFor="speed">
                                        Speed
                                    </InputLabel>
                                    <Select
                                        value={this.state.speed}
                                        onChange={this.handleInputChange}
                                        inputProps={{
                                            name: "speed",
                                            id: "speed"
                                        }}
                                    >
                                        {[1, 2, 3, 4, 5, 6, 7].map(speed => (
                                            <MenuItem key={speed} value={speed}>
                                                {speed}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>
        );
    }
}

export default withStyles(styles)(
    graphql(LIGHT_CHANGED)(graphql(SET_LIGHT)(Light))
);
