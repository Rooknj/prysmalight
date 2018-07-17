import React from "react";
import PropTypes from "prop-types";
import SpeedDial from "@material-ui/lab/SpeedDial";
import SpeedDialIcon from "@material-ui/lab/SpeedDialIcon";
import SpeedDialAction from "@material-ui/lab/SpeedDialAction";

import styled from "styled-components";

const StyledSpeedDial = styled(SpeedDial)`
    position: fixed;
    bottom: ${({ theme }) => theme.spacing.unit * 2}px;
    right: ${({ theme }) => theme.spacing.unit * 3}px;
`;

class LightSpeedDial extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            open: false
        };
    }

    handleClick = () => {
        this.setState({
            open: !this.state.open
        });
    };

    handleOpen = () => {
        this.setState({
            open: true
        });
    };

    handleClose = () => {
        this.setState({
            open: false
        });
    };

    render() {
        const { actions } = this.props;
        const { open } = this.state;
        let isTouch;
        if (typeof document !== "undefined") {
            isTouch = "ontouchstart" in document.documentElement;
        }
        return (
            <StyledSpeedDial
                ariaLabel="Light Actions"
                icon={<SpeedDialIcon />}
                onBlur={this.handleClose}
                onClick={this.handleClick}
                onClose={this.handleClose}
                onFocus={isTouch ? undefined : this.handleOpen}
                ButtonProps={{
                    onMouseEnter: isTouch ? undefined : this.handleOpen
                }}
                onMouseLeave={this.handleClose}
                open={open}
            >
                {actions.map(action => (
                    <SpeedDialAction
                        key={action.name}
                        icon={action.icon}
                        tooltipTitle={action.name}
                        onClick={action.handler}
                    />
                ))}
            </StyledSpeedDial>
        );
    }
}

export default LightSpeedDial;
