import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Grid, Button, Typography } from "@mui/material";

const Room = (props) => {
  const { roomCode } = useParams();

  const [votesToSkip, setVotesToSkip] = useState(2);
  const [guestCanPause, setGuestCanPause] = useState(false);
  const [isHost, setIsHost] = useState(false);
  const navigate = useNavigate();

  const getRoomDetail = () => {
    const url = `/api/get-room/?code=${roomCode}`;
    fetch(url)
      .then((res) => {
        if (!res.ok) {
          props.leaveRoomCallBack();
          navigate("/");
        }
        return res.json();
      })
      .then((data) => {
        console.log("data from get detail room: ", data);
        setVotesToSkip(data.votes_to_skip);
        setGuestCanPause(data.guest_can_pause);
        setIsHost(data.is_host);
      })
      .catch((err) => {
        alert(err);
      });
  };

  const handleLeaveRoom = (e) => {
    const requestOptions = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    };
    fetch(`/api/leave-room/`, requestOptions)
      .then((res) => {
        props.leaveRoomCallBack();
        navigate("/");
      })
      .catch((err) => alert(err));
  };

  useEffect(() => {
    getRoomDetail();
  }, []);

  return (
    <Grid container spacing={1}>
      <Grid item xs={12} align="center">
        <Typography variant="h4" component="h4">
          Code: {roomCode}
        </Typography>
      </Grid>
      <Grid item xs={12} align="center">
        <Typography variant="h6" component="h6">
          Votes: {votesToSkip}
        </Typography>
      </Grid>
      <Grid item xs={12} align="center">
        <Typography variant="h6" component="h6">
          Guest can pause: {guestCanPause.toString()}
        </Typography>
      </Grid>
      <Grid item xs={12} align="center">
        <Typography variant="h6" component="h6">
          Host: {isHost.toString()}
        </Typography>
      </Grid>

      <Grid item xs={12} align="center">
        <Button color="secondary" variant="contained" onClick={handleLeaveRoom}>
          Leave Room
        </Button>
      </Grid>
    </Grid>
  );
};

export default Room;
