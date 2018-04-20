import React from "react";
//import PropTypes from "prop-types";
import LightList from "./LightList";

const propTypes = {};

const defaultProps = {};

const LightTool = props => {
    return (
        <div>
            <LightList />
        </div>
    );
};

LightTool.propTypes = propTypes;
LightTool.defaultProps = defaultProps;

export default LightTool;
