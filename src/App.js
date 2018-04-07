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
