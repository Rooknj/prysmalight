import React from "react";
import LightTool from "./Components/LightTool";
import CssBaseline from "@material-ui/core/CssBaseline";
import "./App.css";

const App = props => (
    <div className="App">
        <React.Fragment>
            <CssBaseline />
            {<LightTool />}
        </React.Fragment>
    </div>
);

export default App;

/*
    React Notes!
    https://camjackson.net/post/9-things-every-reactjs-beginner-should-know#its-just-a-view-library

    1. Keep your components small
     - make your components significantly smaller than you think they need to be

    2. Write functional components
     - const MyComponent = props => ( ...code );
     vs
     - class MyComponent extends React.Component { ...code }

    3. Write stateless components
     - Components should be pure data-in data-out functions of props

    4. Always use propTypes
 */
