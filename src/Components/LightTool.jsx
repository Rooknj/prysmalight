import React from "react";
import LightList from "./LightList";
import AddLight from "./AddLight";

class LightTool extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div>
                <LightList />
            </div>
        );
    }
}

export default LightTool;
