import React, { Component } from "react";
import logo from "./logo.svg";
import "./App.css";
import LightTool from "./Components/LightTool";

class App extends Component {
    render() {
        return (
            <div className="App">
                <header className="App-header">
                    <img src={logo} className="App-logo" alt="logo" />
                    <h1 className="App-title">Welcome to Light App 2.0!</h1>
                </header>
                <div>
                    <LightTool />
                </div>
            </div>
        );
    }
}

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
