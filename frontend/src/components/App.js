import React, { Component } from "react";
import { render } from "react-dom";

import HomePage from "./Pages/HomePage";
import JoinRoomPage from "./Pages/JoinRoomPage";
import CreateRoomPage from "./Pages/CreateRoomPage";

export default class App extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div>
        <HomePage />
        <JoinRoomPage />
        <CreateRoomPage />
      </div>
    );
  }
}

const appDiv = document.getElementById("app");
render(<App />, appDiv);