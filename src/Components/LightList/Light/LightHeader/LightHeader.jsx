import React from "react";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
import Switch from "@material-ui/core/Switch";
import Grid from "@material-ui/core/Grid";
import LightStatus from "./LightStatus";
import CircularProgress from "@material-ui/core/CircularProgress";

const styles = theme => ({
    switchGrid: {
        display: "flex",
        alignItems: "center",
        justifyContent: "flex-end"
    }
});

const propTypes = {
    id: PropTypes.string.isRequired,
    color: PropTypes.object.isRequired
};

const defaultProps = {};

const LightHeader = props => {
    return (
        <Grid container justify="space-between">
            <Grid item xs={8}>
                <LightStatus
                    id={props.id}
                    color={props.color}
                    connected={props.connected}
                />
            </Grid>
            <Grid item xs={2} className={props.classes.switchGrid}>
                {props.waiting && <CircularProgress />}
            </Grid>
            <Grid item xs={2} className={props.classes.switchGrid}>
                <Switch
                    checked={props.state === "ON" ? true : false}
                    onChange={props.onChange}
                    disabled={props.connected !== 2}
                    color="primary"
                />
            </Grid>
        </Grid>
    );
};

LightHeader.propTypes = propTypes;
LightHeader.defaultProps = defaultProps;

export default withStyles(styles)(LightHeader);
