import React, { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Link, Navigate } from "react-router-dom";
import { Grid, Button, ButtonGroup, Typography } from "@mui/material";

import JoinRoomPage from "./JoinRoomPage";
import CreateRoomPage from "./CreateRoomPage";
import Room from "./Room";

const HomePage = (props) => {
  const [roomCode, setRoomCode] = useState(null);

  useEffect(() => {
    fetch(`/api/user-in-room`)
      .then((res) => res.json())
      .then((data) => setRoomCode(data.code))
      .catch((err) => console.error(err));
  }, []);

  const renderHomePageContent = () => {
    return (
      <Grid container spacing={3}>
        <Grid item xs={12} align="center">
          <Typography variant="h3" compact="h3">
            House Party
          </Typography>
        </Grid>
        <Grid item xs={12} align="center">
          <ButtonGroup disableElevation variant="contained" color="primary">
            <Button color="primary" to="/join" component={Link}>
              Join a Room
            </Button>
            <Button color="secondary" to="/create" component={Link}>
              Create a Room
            </Button>
          </ButtonGroup>
        </Grid>
      </Grid>
    );
  };

  const renderedContent = () => {
    return roomCode ? (
      <Navigate replace to={`/room/${roomCode}`} />
    ) : (
      renderHomePageContent()
    );
  };

  const clearRoomCode = () => {
    setRoomCode(null);
  };

  return (
    <div>
      <BrowserRouter>
        <Routes>
          <Route exact path="/" element={renderedContent()} />
          <Route path="/join" element={<JoinRoomPage />} />
          <Route path="/create" element={<CreateRoomPage />} />
          <Route
            path="/room/:roomCode"
            element={<Room {...props} leaveRoomCallBack={clearRoomCode} />}
          />
        </Routes>
      </BrowserRouter>
    </div>
  );
};

export default HomePage;
