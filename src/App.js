import React, { Component } from "react";
import logo from "./logo.svg";
import "./App.css";
import LightList from "./Components/LightList";

class App extends Component {
  render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">Welcome to React</h1>
        </header>
        <p className="App-intro">Test</p>
        <LightList />
      </div>
    );
  }
}

export default App;
