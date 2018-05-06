import React from "react";
import HueSlice from "./HueSlice.jsx";
import { Observable } from "rxjs/Observable";
import "rxjs/add/observable/fromEvent";
import "rxjs/add/operator/map";
import "rxjs/add/operator/concatMap";
import "rxjs/add/operator/merge";
import "rxjs/add/operator/takeUntil";

class Hue extends React.Component {
    constructor(props) {
        super(props);

        const padding = 60;
        const innerSize = 300;
        this.radius = innerSize / 2;
        this.outterSize = innerSize + padding;
        this.centerOffset = this.outterSize / 2;

        this.state = {
            dragging: false
        };

        // These are set in the render method
        this.canvas = null;
        this.selector = null;
    }

    componentDidMount() {
        // Event handling using Reactive JS
        let mouseDowns = Observable.fromEvent(this.selector, "mousedown");
        let mouseMoves = Observable.fromEvent(this.canvas, "mousemove");
        let mouseUps = Observable.fromEvent(this.canvas, "mouseup");
        let mouseLeaves = Observable.fromEvent(this.canvas, "mouseleave");

        let touchStarts = Observable.fromEvent(this.selector, "touchstart");
        let touchMoves = Observable.fromEvent(this.selector, "touchmove");
        let touchEnds = Observable.fromEvent(this.canvas, "touchend");

        let mouseDrags = mouseDowns.concatMap(clickEvent => {
            const xMouseShouldBe =
                Math.sin(this.props.hue / 180 * Math.PI) * this.radius;
            const yMouseShouldBe =
                -Math.cos(this.props.hue / 180 * Math.PI) * this.radius;
            const xMouseIs = clickEvent.clientX;
            const yMouseIs = clickEvent.clientY;
            const xMouseDelta = xMouseIs - xMouseShouldBe;
            const yMouseDelta = yMouseIs - yMouseShouldBe;
            return mouseMoves
                .takeUntil(mouseUps.merge(mouseLeaves))
                .map(moveEvent => {
                    const xRelativeToCenter = moveEvent.clientX - xMouseDelta;
                    const yRelativeToCenter = moveEvent.clientY - yMouseDelta;
                    const degree =
                        Math.atan(yRelativeToCenter / xRelativeToCenter) *
                            180 /
                            Math.PI +
                        90 +
                        (xRelativeToCenter >= 0 ? 0 : 180);
                    return parseInt(degree);
                });
        });

        let touchDrags = touchStarts.concatMap(startEvent => {
            startEvent.preventDefault();
            const xTouchShouldBe =
                Math.sin(this.props.hue / 180 * Math.PI) * this.radius;
            const yTouchShouldBe =
                -Math.cos(this.props.hue / 180 * Math.PI) * this.radius;
            const xTouchIs = startEvent.touches[0].clientX;
            const yTouchIs = startEvent.touches[0].clientY;
            const xTouchDelta = xTouchIs - xTouchShouldBe;
            const yTouchDelta = yTouchIs - yTouchShouldBe;
            return touchMoves.takeUntil(touchEnds).map(moveEvent => {
                moveEvent.preventDefault();
                const xRelativeToCenter =
                    moveEvent.touches[0].clientX - xTouchDelta;
                const yRelativeToCenter =
                    moveEvent.touches[0].clientY - yTouchDelta;
                const degree =
                    Math.atan(yRelativeToCenter / xRelativeToCenter) *
                        180 /
                        Math.PI +
                    90 +
                    (xRelativeToCenter >= 0 ? 0 : 180);
                return parseInt(degree);
            });
        });

        let dragStarts = mouseDowns.merge(touchStarts);
        let drags = mouseDrags.merge(touchDrags);
        let dragEnds = mouseUps.merge(mouseLeaves).merge(touchEnds);

        dragStarts.forEach(() => {
            this.setState({ dragging: true });
        });

        drags.forEach(degree => {
            this.props.setHue(degree);
        });

        dragEnds.forEach(() => {
            this.setState({ dragging: false });
        });
    }

    render() {
        return (
            <svg
                ref={canvas => {
                    this.canvas = canvas;
                }}
                width={this.outterSize}
                height={this.outterSize}
                viewBox={`0 0 ${this.outterSize} ${this.outterSize}`}
            >
                <g
                    transform={`translate(${this.centerOffset},${
                        this.centerOffset
                    })`}
                >
                    {Array.from({ length: 360 }, (value, key) => (
                        <HueSlice
                            key={key}
                            degree={key}
                            radius={this.radius}
                            color={`hsl(${key}, ${this.props.saturation}%, ${
                                this.props.lightness
                            }%)`}
                            marker={false}
                        />
                    ))}
                    <g
                        ref={selector => {
                            this.selector = selector;
                        }}
                    >
                        <HueSlice
                            degree={this.props.hue}
                            radius={this.radius}
                            color={
                                this.state.dragging
                                    ? `hsl(${this.props.hue}, ${
                                          this.props.saturation
                                      }%, ${this.props.lightness}%)`
                                    : "black"
                            }
                            marker={true}
                        />
                    </g>
                    <text
                        x="10"
                        y="30"
                        textAnchor="middle"
                        fill={`hsl(${this.props.hue}, ${
                            this.props.saturation
                        }%, ${this.props.lightness}%)`}
                        stroke={`hsl(${this.props.hue}, ${
                            this.props.saturation
                        }%, ${this.props.lightness}%)`}
                    >
                        {this.props.hue}°
                    </text>
                    <text
                        className="label"
                        x="0"
                        y="60"
                        textAnchor="middle"
                        fill={`hsl(${this.props.hue}, ${
                            this.props.saturation
                        }%, ${this.props.lightness}%)`}
                        stroke={`hsl(${this.props.hue}, ${
                            this.props.saturation
                        }%, ${this.props.lightness}%)`}
                    >
                        Hue
                    </text>
                </g>
            </svg>
        );
    }
}

export default Hue;
