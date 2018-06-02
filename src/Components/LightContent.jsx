import React from "react";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
import Grid from "@material-ui/core/Grid";
import CardContent from "@material-ui/core/CardContent";
import { MaterialPicker, CirclePicker, HuePicker } from "react-color";
import Typography from "@material-ui/core/Typography";

import Select from "@material-ui/core/Select";
import InputLabel from "@material-ui/core/InputLabel";
import MenuItem from "@material-ui/core/MenuItem";
import FormControl from "@material-ui/core/FormControl";

import BrightnessSection from "./BrightnessSection";
import ColorSection from "./ColorSection";

const styles = theme => ({
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
            <BrightnessSection {...props} />
            <ColorSection {...props} />
            <Grid
                container
                direction="row"
                spacing={16}
                justify="center"
                alignItems="center"
            >
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
