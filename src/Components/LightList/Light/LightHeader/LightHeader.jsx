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
    color: PropTypes.object.isRequired,
    connected: PropTypes.number.isRequired,
    state: PropTypes.oneOf(["ON", "OFF"]).isRequired,
    waiting: PropTypes.bool,
    classes: PropTypes.object,
    onChange: PropTypes.func
};

const defaultProps = {
    classes: {}
};

class LightHeader extends React.Component {
    render() {
        const {
            id,
            color,
            connected,
            state,
            waiting,
            classes,
            onChange
        } = this.props;
        return (
            <Grid container justify="space-between">
                <Grid item xs={8}>
                    <LightStatus id={id} color={color} connected={connected} />
                </Grid>
                <Grid item xs={2} className={classes.switchGrid}>
                    {waiting && <CircularProgress />}
                </Grid>
                <Grid item xs={2} className={classes.switchGrid}>
                    <Switch
                        checked={state === "ON" ? true : false}
                        onChange={onChange}
                        disabled={connected !== 2}
                        color="primary"
                    />
                </Grid>
            </Grid>
        );
    }
}

LightHeader.propTypes = propTypes;
LightHeader.defaultProps = defaultProps;

export default withStyles(styles)(LightHeader);
