import React from "react";
import debounce from "lodash/debounce";

class Slider extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            value: this.props.value
        };

        this.debounce = debounce((fn, data, evt) => {
            fn(data, evt);
        }, 100);
    }

    handleChange = evt => {
        this.setState({
            value: evt.target.value
        });
        this.props.onChangeComplete &&
            this.debounce(this.props.onChangeComplete, evt.target.value, evt);
        this.props.onChange && this.props.onChange(evt.target.value, evt);
    };

    render() {
        return (
            <div>
                {this.state.value}
                <input
                    type="range"
                    min={this.props.min}
                    max={this.props.max}
                    value={this.state.value}
                    onChange={this.handleChange}
                />
            </div>
        );
    }
}

export default Slider;
