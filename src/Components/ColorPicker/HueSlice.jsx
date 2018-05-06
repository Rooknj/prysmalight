import React from "react";

const HueSlice = ({ degree, color, radius, marker }) => {
    const thickness = marker ? 5 : 1;
    const startX = Math.sin((degree - thickness) / 180 * Math.PI) * radius;
    const startY = -Math.cos((degree - thickness) / 180 * Math.PI) * radius;
    const endX = Math.sin((degree + thickness) / 180 * Math.PI) * radius;
    const endY = -Math.cos((degree + thickness) / 180 * Math.PI) * radius;
    return (
        <path
            className={marker ? "marker" : ""}
            d={`M ${startX} ${startY} A ${radius} ${radius} 0 0 1 ${endX} ${endY}`}
            stroke={color}
        />
    );
};

export default HueSlice;
