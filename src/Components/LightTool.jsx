import React from "react";
import LightListQueryContainer from "./LightList/LightListQueryContainer";
import LightActionsContainer from "./LightActions/LightActionsContainer";

const LightTool = () => (
    <React.Fragment>
        <LightListQueryContainer />
        <LightActionsContainer />
    </React.Fragment>
);

export default LightTool;
