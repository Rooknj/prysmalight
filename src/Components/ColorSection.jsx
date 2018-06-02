import React from "react";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
import Grid from "@material-ui/core/Grid";
import { MaterialPicker, CirclePicker, HuePicker } from "react-color";
import Typography from "@material-ui/core/Typography";

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
    }
});

const propTypes = {};

const defaultProps = {};

const ColorSection = props => {
    return (
        <Grid
            container
            direction="row"
            spacing={16}
            justify="center"
            alignItems="center"
        >
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
        </Grid>
    );
};

ColorSection.propTypes = propTypes;
ColorSection.defaultProps = defaultProps;

export default withStyles(styles)(ColorSection);
