import React from "react";
import PropTypes from "prop-types";
import LightMutationContainer from "./Light/LightMutationContainer";
import Grid from "@material-ui/core/Grid";
import styled from "styled-components";

const GridWrapper = styled.div`
  padding: 0.5rem;
`;

const propTypes = {
  lights: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      connected: PropTypes.number,
      state: PropTypes.string,
      brightness: PropTypes.number,
      color: PropTypes.shape({
        r: PropTypes.number.isRequired,
        g: PropTypes.number.isRequired,
        b: PropTypes.number.isRequired
      }),
      effect: PropTypes.string,
      speed: PropTypes.number,
      supportedEffects: PropTypes.array
    })
  )
};

const defaultProps = {
  lights: []
};

const LightList = ({ lights }) => (
  <GridWrapper>
    <Grid container justify={"center"}>
      {lights.map(light => (
        <Grid key={light.id} item xs={12}>
          <LightMutationContainer light={light} />
        </Grid>
      ))}
    </Grid>
  </GridWrapper>
);

LightList.propTypes = propTypes;
LightList.defaultProps = defaultProps;

export default LightList;
