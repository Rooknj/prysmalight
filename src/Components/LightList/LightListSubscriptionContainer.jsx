import React from "react";
import PropTypes from "prop-types";
import { LIGHTS_CHANGED } from "../graphqlConstants";
import LightList from "./LightList";

const propTypes = {
    subscribeToLightChanges: PropTypes.func.isRequired
};

const defaultProps = {};

class LightListSubscriptionContainer extends React.Component {
    componentDidMount() {
        this.props.subscribeToLightChanges({
            document: LIGHTS_CHANGED,
            updateQuery: (prev, { subscriptionData }) => {
                console.log(subscriptionData);
                return prev;
            }
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
