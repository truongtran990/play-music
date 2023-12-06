import React, { Component } from "react";
import { BrowserRouter, Routes, Route, Link, Redirect } from "react-router-dom";

import JoinRoomPage from "./JoinRoomPage";
import CreateRoomPage from "./CreateRoomPage";

const HomePage = (props) => {
  return (
    <div>
      <BrowserRouter>
        <Routes>
          <Route exact path="/" element={<p>This is the home page</p>} />
          <Route path="/join" element={<JoinRoomPage />} />
          <Route path="/create" element={<CreateRoomPage />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
};

export default HomePage;
