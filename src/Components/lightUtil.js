export default class lightUtil {
    updateQueryWithSubscription = (prev, { subscriptionData }) => {
        if (!subscriptionData.data) return prev;

        const {
            id,
            connected,
            state,
            brightness,
            color,
            effect,
            speed
        } = subscriptionData.data.lightChanged;
        const prevLight = prev.lights.find(light => light.id === "Light 1");
        // TODO: Enable this line when you start returning the Light ID from the backend
        //const prevLight = prev.lights.find((light) => light.id === id);

        let nextState = {};
        // If the incoming data is the same as the current state, ignore it
        if (
            typeof connected === "number" &&
            connected !== prevLight.connected
        ) {
            nextState = { ...nextState, ...{ connected } };
        }
        if (state !== prevLight.state) {
            nextState = { ...nextState, ...{ state } };
        }
        if (brightness !== prevLight.brightness) {
            nextState = { ...nextState, ...{ brightness } };
        }
        if (
            color &&
            (color.r !== prevLight.color.r ||
                color.g !== prevLight.color.g ||
                color.b !== prevLight.color.b)
        ) {
            nextState = { ...nextState, ...{ color } };
        }
        if (effect !== prevLight.effect) {
            nextState = { ...nextState, ...{ effect } };
        }
        if (speed !== prevLight.speed) {
            nextState = { ...nextState, ...{ speed } };
        }

        // If nextState is empty, that means all the data is the same so we should just return the previous state
        if (Object.keys(nextState).length <= 0) {
            return prev;
        }

        // TODO: Clean up logic
        // Find the index of the light that was updated
        const lightIndex = prev.lights.indexOf(prevLight);
        // Create a new object reflecting the state of the updated light
        const newLight = Object.assign({}, prev.lights[lightIndex], nextState);
        // Create a clone of the lights array from prev
        const newLights = prev.lights.slice();
        // Update the correct light in the new array
        newLights[lightIndex] = newLight;
        // Return prev with the updated lights array
        return { ...prev, ...{ lights: newLights } };
    };
}
