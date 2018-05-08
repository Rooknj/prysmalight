import React from "react";
import "./ColorPicker.css";
//import Hue from "./Hue.jsx";
import { CustomPicker } from "react-color";
import CircularColor from "react-circular-color";

class ColorPicker extends React.Component {
    handleColorChange = color => {
        this.props.onChange(color);
    };

    renderRect = ({ color, x, y }) => {
        return <circle cx={x + 14} cy={y + 14} r="34" fill={color} />;
    };

    render() {
        return (
            <div id="container">
                <CircularColor
                    size={300}
                    onChange={this.handleColorChange}
                    color={this.props.hex}
                    centerRect={true}
                    renderRect={this.renderRect}
                    numberOfSectors={360}
                />
            </div>
        );
    }
}

export default CustomPicker(ColorPicker);
