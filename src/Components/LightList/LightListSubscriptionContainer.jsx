import React from "react";
import PropTypes from "prop-types";
import { LIGHTS_CHANGED } from "../graphqlConstants";
import LightList from "./LightList";

const propTypes = {
    subscribeToLightChanges: PropTypes.func.isRequired
};

const defaultProps = {};

// TODO: could use this for subscriptions
// const findLight = (lightId, lights) => {
//     return lights.find(light => light.id === lightId);
// };
// const updateCache = (cache, { data: { setLight } }) => {
//     // Read the lights data from the cache
//     const { lights } = cache.readQuery({ query: GET_LIGHTS });
//     console.log("before:", lights, setLight);
//     // Find the light we are going to change
//     const oldLight = findLight(setLight.id, lights);
//     // Assign the new values to the light
//     Object.assign(oldLight, setLight);
//     console.log("after:", lights)
//     // Write the query back to the cache
//     cache.writeQuery({
//         query: GET_LIGHTS,
//         data: { lights }
//     });
// };

class LightListSubscriptionContainer extends React.Component {
    componentDidMount() {
        // TODO: actually implement
        console.log("Subscribing to light changes");
        //this.props.subscribeToLightChanges();
    }

    render() {
        const { lights } = this.props;
        return <LightList lights={lights} />;
    }
}

LightListSubscriptionContainer.propTypes = propTypes;
LightListSubscriptionContainer.defaultProps = defaultProps;

export default LightListSubscriptionContainer;
