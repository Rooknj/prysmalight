import React from "react";
import Typography from "@material-ui/core/Typography";
import { withTheme } from "@material-ui/core/styles";
import styled from "styled-components";
//import PropTypes from "prop-types";

const TextArea = styled.div`
  text-align: center;
  padding: 1em;
`;

const propTypes = {};
const defaultProps = {};
const ErrorPage = ({ message, theme }) => {
  return (
    <React.Fragment>
      <div
        style={{
          width: 300,
          height: 300,
          display: "block",
          margin: "auto",
          position: "relative"
        }}
      >
        <svg
          version="1.0"
          xmlns="http://www.w3.org/2000/svg"
          width="300"
          height="300"
          viewBox="0 0 260.000000 245.000000"
          preserveAspectRatio="xMidYMid meet"
        >
          <metadata>
            Created by potrace 1.11, written by Peter Selinger 2001-2013
          </metadata>
          <g
            transform="translate(0.000000,245.000000) scale(0.100000,-0.100000)"
            fill={theme.palette.text.primary}
            stroke="none"
          >
            <path
              d="M1015 2401 c-126 -57 -164 -223 -78 -337 l23 -31 -31 -58 c-17 -31
-39 -92 -51 -134 -17 -66 -19 -95 -13 -212 5 -115 3 -138 -10 -149 -8 -7 -30
-42 -48 -79 -48 -96 -118 -224 -129 -238 -7 -9 -7 -13 0 -13 6 0 13 4 17 9 3
5 30 15 61 22 69 15 177 1 311 -42 216 -69 286 -115 405 -265 48 -62 103 -121
120 -133 23 -14 28 -21 18 -24 -121 -37 -183 -86 -234 -187 -43 -87 -60 -186
-53 -311 l5 -96 -123 -6 c-194 -9 -355 23 -521 103 -116 56 -189 117 -224 186
-20 41 -24 63 -23 134 1 101 21 165 100 323 121 242 122 297 1 69 -50 -95
-113 -261 -128 -340 -18 -89 -9 -195 22 -259 32 -65 112 -158 149 -174 16 -6
29 -15 29 -19 0 -4 -78 -10 -172 -14 -167 -7 -337 -21 -387 -32 -71 -16 62
-37 344 -54 209 -13 1594 -13 1800 0 164 10 328 27 355 36 51 18 -107 38 -392
50 -87 4 -158 10 -158 15 0 4 16 22 36 41 123 114 133 346 20 446 -43 37 -79
57 -123 67 -18 3 -33 8 -33 9 0 1 9 19 20 41 11 22 20 53 20 70 -1 41 -41 135
-79 183 -17 22 -31 42 -31 45 0 3 14 8 30 12 34 7 140 110 140 135 0 8 -5 32
-10 52 -12 42 0 74 76 198 63 102 86 172 91 280 4 82 2 104 -17 155 -16 44
-23 85 -24 150 -2 108 -14 135 -75 175 -40 27 -53 30 -114 29 -56 -2 -71 2
-90 19 -12 11 -47 32 -77 46 -125 57 -241 70 -397 45 l-77 -12 -25 30 c-14 17
-40 38 -58 47 -43 22 -137 21 -188 -3z m664 -116 c218 -52 402 -236 442 -443
21 -112 -3 -346 -32 -302 -8 13 -12 11 -29 -10 -40 -50 -78 -140 -96 -228 -15
-77 -20 -89 -36 -84 -22 5 -24 -20 -3 -38 8 -7 15 -19 15 -26 0 -15 -52 -44
-112 -63 -35 -12 -40 -10 -85 20 -62 42 -131 100 -256 217 -122 113 -219 184
-306 224 -57 27 -74 30 -140 26 l-76 -3 -18 50 c-13 39 -17 73 -14 151 3 88 8
109 35 169 29 61 34 67 55 60 12 -4 48 -10 79 -12 49 -4 65 -1 109 23 73 40
109 104 109 196 l0 67 43 9 c67 15 245 13 316 -3z"
            />
            <path
              d="M1745 1595 c-38 -25 -98 -54 -133 -66 -112 -37 -146 -86 -101 -143
39 -49 167 -96 267 -96 40 0 44 2 59 38 34 81 26 313 -10 312 -7 0 -43 -21
-82 -45z"
            />
          </g>
        </svg>
      </div>
      <TextArea>
        <Typography variant="h4" color="default">
          Oops something went wrong!
        </Typography>
        {/* TODO: Add a refresh button here */}
      </TextArea>
    </React.Fragment>
  );
};
ErrorPage.propTypes = propTypes;
ErrorPage.defaultProps = defaultProps;
export default withTheme()(ErrorPage);
