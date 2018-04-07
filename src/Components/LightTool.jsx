import React from "react";
import LightList from "./LightList";
import AddLight from "./AddLight";

const LightTool = props => {
    return (
        <div>
            <LightList />
            <AddLight />
        </div>
    );
};

export default LightTool;
