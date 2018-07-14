import React from "react";
import PropTypes from "prop-types";
import { LIGHTS_CHANGED } from "../graphqlConstants";
import LightList from "./LightList";

const propTypes = {
    lights: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.string.isRequired,
            connected: PropTypes.number,
            state: PropTypes.string,
            brightness: PropTypes.number,
            color: PropTypes.shape({
                r: PropTypes.number.isRequired,
                g: PropTypes.number.isRequired,
                b: PropTypes.number.isRequired
            }),
            effect: PropTypes.string,
            speed: PropTypes.number,
            supportedEffects: PropTypes.array
        })
    ),
    subscribeToLightChanges: PropTypes.func
};

const defaultProps = {
    subscribeToLightChanges: () => {}
};

class LightListSubscriptionContainer extends React.Component {
    componentDidMount() {
        this.props.subscribeToLightChanges({
            document: LIGHTS_CHANGED
        });
    }

    render() {
        const { lights } = this.props;
        return <LightList lights={lights} />;
    }
}

LightListSubscriptionContainer.propTypes = propTypes;
LightListSubscriptionContainer.defaultProps = defaultProps;

export default LightListSubscriptionContainer;
