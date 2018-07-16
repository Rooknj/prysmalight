import React from "react";
import PropTypes from "prop-types";
import Grid from "@material-ui/core/Grid";

import Select from "@material-ui/core/Select";
import InputLabel from "@material-ui/core/InputLabel";
import MenuItem from "@material-ui/core/MenuItem";
import FormControl from "@material-ui/core/FormControl";
import Typography from "@material-ui/core/Typography";
import styled from "styled-components";

const StyledSelect = styled(Select)`
    min-width: 120px;
`;

const StyledFormControl = styled(FormControl)`
    margin: ${({ theme }) => theme.spacing.unit}px
    min-width: 120px;
`;

const propTypes = {
    effect: PropTypes.string,
    onInputChange: PropTypes.func,
    supportedEffects: PropTypes.array,
    speed: PropTypes.number
};

const defaultProps = {
    effect: "None",
    onInputChange: () => {},
    supportedEffects: [],
    speed: 4
};

const EffectSection = props => {
    return (
        <Grid
            container
            direction="row"
            spacing={16}
            justify="space-between"
            alignItems="center"
        >
            <Grid item xs={12}>
                <Typography variant="body2">Animations</Typography>
            </Grid>
            <Grid item xs={6}>
                <StyledFormControl>
                    <InputLabel htmlFor="effect">Effect</InputLabel>
                    <StyledSelect
                        value={props.effect}
                        onChange={props.onInputChange}
                        inputProps={{
                            name: "effect",
                            id: "effect"
                        }}
                    >
                        {props.supportedEffects.map(effect => (
                            <MenuItem key={effect} value={effect}>
                                {effect}
                            </MenuItem>
                        ))}
                    </StyledSelect>
                </StyledFormControl>
            </Grid>
            <Grid
                item
                xs={6}
                style={{
                    display: "flex",
                    justifyContent: "flex-end"
                }}
            >
                <StyledFormControl>
                    <InputLabel htmlFor="speed">Speed</InputLabel>
                    <StyledSelect
                        value={props.speed}
                        onChange={props.onInputChange}
                        inputProps={{
                            name: "speed",
                            id: "speed"
                        }}
                    >
                        {[1, 2, 3, 4, 5, 6, 7].map(speed => (
                            <MenuItem key={speed} value={speed}>
                                {speed}
                            </MenuItem>
                        ))}
                    </StyledSelect>
                </StyledFormControl>
            </Grid>
        </Grid>
    );
};

EffectSection.propTypes = propTypes;
EffectSection.defaultProps = defaultProps;

export default EffectSection;
