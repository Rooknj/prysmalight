import React from "react";
import PropTypes from "prop-types";
import Switch from "@material-ui/core/Switch";
import Grid from "@material-ui/core/Grid";
import LightStatus from "./LightStatus";
import CircularProgress from "@material-ui/core/CircularProgress";

const propTypes = {
    id: PropTypes.string.isRequired,
    color: PropTypes.shape({
        r: PropTypes.number.isRequired,
        g: PropTypes.number.isRequired,
        b: PropTypes.number.isRequired
    }),
    connected: PropTypes.number,
    state: PropTypes.oneOf(["ON", "OFF"]),
    waiting: PropTypes.bool,
    onChange: PropTypes.func
};

const defaultProps = {
    color: {
        r: 0,
        g: 0,
        b: 0
    },
    connected: 0,
    state: "OFF",
    waiting: false,
    onChange: () => {}
};

class LightHeader extends React.Component {
    render() {
        const { id, color, connected, state, waiting, onChange } = this.props;
        return (
            <Grid container alignItems="center">
                <Grid item xs={8}>
                    <LightStatus id={id} color={color} connected={connected} />
                </Grid>
                <Grid item xs={2}>
                    {waiting && <CircularProgress />}
                </Grid>
                <Grid item xs={2}>
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

export default LightHeader;
