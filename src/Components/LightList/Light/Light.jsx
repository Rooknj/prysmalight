import React from "react";
import PropTypes from "prop-types";
import { Subscription } from "react-apollo";
import gql from "graphql-tag";
import throttle from "lodash.throttle";

import Card from "@material-ui/core/Card";
import LightHeader from "./LightHeader/LightHeader";
import { withStyles } from "@material-ui/core/styles";
import LightContent from "./LightContent/LightContent";

const styles = theme => ({
    card: {
        minWidth: 300,
        maxWidth: 400
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
        }),
        effect: PropTypes.string,
        speed: PropTypes.number,
        supportedEffects: PropTypes.array
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
    subscription lightChanged($lightId: String!) {
        lightChanged(lightId: $lightId) {
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

const Light = props => (
    <Subscription
        subscription={LIGHT_CHANGED}
        variables={{ lightId: props.light.id }}
    >
        {({ loading, data }) => {
            console.log(loading, data);
            return (
                <Card className={props.classes.card}>
                    <LightHeader
                        id={props.light.id}
                        color={props.light.color}
                        connected={props.light.connected}
                        state={props.light.state}
                        onChange={() => console.log("triggered")}
                    />
                    <LightContent
                        connected={props.light.connected}
                        brightness={props.light.brightness}
                        color={props.light.color}
                        colors={colors}
                        effect={props.light.effect}
                        supportedEffects={props.light.supportedEffects}
                        speed={props.light.speed}
                        onBrightnessChange={() => console.log("triggered")}
                        onColorChange={() => console.log("triggered")}
                        onInputChange={() => console.log("triggered")}
                    />
                </Card>
            );
        }}
    </Subscription>
);

Light.propTypes = propTypes;
Light.defaultProps = defaultProps;

export default withStyles(styles)(Light);
