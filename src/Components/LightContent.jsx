import React from "react";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
import Grid from "@material-ui/core/Grid";
import CardContent from "@material-ui/core/CardContent";
import { MaterialPicker, CirclePicker, HuePicker } from "react-color";
import Slider from "rc-slider";
import Typography from "@material-ui/core/Typography";
import "./slider.css";

import Select from "@material-ui/core/Select";
import InputLabel from "@material-ui/core/InputLabel";
import MenuItem from "@material-ui/core/MenuItem";
import FormControl from "@material-ui/core/FormControl";

const styles = theme => ({
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

const propTypes = {
    connected: PropTypes.number.isRequired,
    brightness: PropTypes.number.isRequired,
    color: PropTypes.object.isRequired,
    colors: PropTypes.array.isRequired,
    effect: PropTypes.string.isRequired,
    supportedEffects: PropTypes.array.isRequired,
    speed: PropTypes.number.isRequired
};

const defaultProps = {};

const LightContent = props => {
    return (
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
                        value={props.brightness}
                        onChange={props.onBrightnessChange}
                        disabled={props.connected !== 2}
                    />
                </Grid>
                <Grid item xs={12}>
                    <Typography variant="body2">Color</Typography>
                </Grid>
                <Grid item xs={12}>
                    <HuePicker
                        color={props.color}
                        onChange={props.onColorChange}
                        width={"100%"}
                        className={props.classes.huePicker}
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
                            color={props.color}
                            onChange={props.onColorChange}
                            width={"100%"}
                            colors={props.colors}
                            className={props.classes.circlePicker}
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
                            color={props.color}
                            onChange={props.onColorChange}
                            className={props.classes.materialPicker}
                        />
                    </Grid>
                </Grid>
                <Grid container justify="space-between" alignItems="center">
                    <Grid item xs={6}>
                        <FormControl className={props.classes.formControl}>
                            <InputLabel htmlFor="effect">Effect</InputLabel>
                            <Select
                                value={props.effect}
                                onChange={props.onInputChange}
                                inputProps={{
                                    name: "effect",
                                    id: "effect"
                                }}
                            >
                                {props.supportedEffects.map(effect => (
                                    <MenuItem key={effect} value={effect}>
                                        {effect}
                                    </MenuItem>
                                ))}
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
                        <FormControl className={props.classes.formControl}>
                            <InputLabel htmlFor="speed">Speed</InputLabel>
                            <Select
                                value={props.speed}
                                onChange={props.onInputChange}
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
    );
};

LightContent.propTypes = propTypes;
LightContent.defaultProps = defaultProps;

export default withStyles(styles)(LightContent);
