import React from "react";
import PropTypes from "prop-types";
import CardHeader from "@material-ui/core/CardHeader";
import Avatar from "@material-ui/core/Avatar";
import HightlightIcon from "@material-ui/icons/Highlight";
import { withStyles } from "@material-ui/core/styles";
import grey from "@material-ui/core/colors/grey";

const styles = theme => ({
    avatar: {
        backgroundColor: grey[400]
    }
});

const propTypes = {
    id: PropTypes.string.isRequired,
    color: PropTypes.object.isRequired
};

const defaultProps = {};

const LightStatus = props => {
    return (
        <CardHeader
            title={props.id}
            subheader={props.connected === 2 ? "Connected" : "Disonnected"}
            avatar={
                <Avatar aria-label="Light" className={props.classes.avatar}>
                    <HightlightIcon
                        nativeColor={`rgb(${props.color.r},${props.color.g},${
                            props.color.b
                        })`}
                    />
                </Avatar>
            }
        />
    );
};

LightStatus.propTypes = propTypes;
LightStatus.defaultProps = defaultProps;

export default withStyles(styles)(LightStatus);
