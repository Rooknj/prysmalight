import React from "react";
import "./ColorPicker.css";
import Hue from "./Hue.jsx";
import { CustomPicker } from "react-color";

class ColorPicker extends React.Component {
    constructor(props) {
        super(props);
        console.log(props);
    }

    handleHueChange = hue => {
        this.props.onChange({ h: hue, s: 1, l: 0.5 });
    };

    render() {
        return (
            <div id="container">
                <Hue
                    hue={Math.round(this.props.hsl.h)}
                    saturation={100}
                    lightness={50}
                    setHue={this.handleHueChange}
                />
            </div>
        );
    }
}

export default CustomPicker(ColorPicker);
