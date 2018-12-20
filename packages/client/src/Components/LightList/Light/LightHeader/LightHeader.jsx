import React from "react";
import PropTypes from "prop-types";
import Switch from "@material-ui/core/Switch";
import Grid from "@material-ui/core/Grid";
import LightStatus from "./LightStatus";
import Fade from "@material-ui/core/Fade";
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
        <Grid item xs={7}>
          <LightStatus id={id} color={color} connected={connected} />
        </Grid>
        <Grid item xs={5}>
          <Grid container justify="flex-end">
            <Grid item>
              <Fade
                in={waiting}
                style={{
                  transitionDelay: waiting ? "400ms" : "0ms"
                }}
                unmountOnExit
              >
                <CircularProgress />
              </Fade>
            </Grid>
            <Grid item>
              <Switch
                checked={state === "ON" ? true : false}
                onChange={onChange}
                disabled={connected !== 2}
                color="primary"
              />
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    );
  }
}

LightHeader.propTypes = propTypes;
LightHeader.defaultProps = defaultProps;

export default LightHeader;
