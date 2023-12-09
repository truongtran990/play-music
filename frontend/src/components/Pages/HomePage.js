import React from "react";
import { BrowserRouter, Routes, Route, Link, Redirect } from "react-router-dom";

import JoinRoomPage from "./JoinRoomPage";
import CreateRoomPage from "./CreateRoomPage";
import Room from "./Room";

const HomePage = (props) => {
  return (
    <div>
      <BrowserRouter>
        <Routes>
          <Route exact path="/" element={<p>This is the home page</p>} />
          <Route path="/join" element={<JoinRoomPage />} />
          <Route path="/create" element={<CreateRoomPage />} />
          <Route path="/room/:roomCode" element={<Room />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
};

export default HomePage;
