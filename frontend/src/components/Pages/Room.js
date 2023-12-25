import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Grid, Button, Typography } from "@mui/material";

import CreateRoomPage from "./CreateRoomPage";
import MusicPlayer from "../MusicPlayer";

const Room = (props) => {
  const { roomCode } = useParams();

  const [votesToSkip, setVotesToSkip] = useState(2);
  const [guestCanPause, setGuestCanPause] = useState(false);
  const [isHost, setIsHost] = useState(false);
  const [isShowSetting, setIsShowSetting] = useState(false);
  const [isSpotifyAuthenticated, setIsSpotifyAuthenticated] = useState(false);
  const [song, setSong] = useState({});
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

        if (data.is_host) {
          authenticaSpotify();
        }
      })
      .catch((err) => {
        alert(err);
      });
  };

  const authenticaSpotify = () => {
    fetch(`/spotify/is-authenticated`)
      .then((res) => res.json())
      .then((data) => {
        setIsSpotifyAuthenticated(data.status);

        if (!data.status) {
          fetch("/spotify/get-auth-url")
            .then((res) => res.json())
            .then((data) => {
              window.location.replace(data.url);
            });
        }
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

  const updateIsShowSeting = (value) => {
    setIsShowSetting(value);
  };

  const renderSettingButton = () => {
    return (
      <Grid item xs={12} align="center">
        <Button
          variant="contained"
          color="primary"
          onClick={() => updateIsShowSeting(true)}
        >
          Setting
        </Button>
      </Grid>
    );
  };

  const renderSettingPageContent = () => {
    return (
      <Grid container spacing={1}>
        <Grid item xs={12} align="center">
          <CreateRoomPage
            update={true}
            votesToSkip={votesToSkip}
            guestCanPause={guestCanPause}
            roomCode={roomCode}
            updateCallBack={getRoomDetail}
          />
        </Grid>
        <Grid item xs={12} align="center">
          <Button
            color="secondary"
            variant="contained"
            onClick={() => updateIsShowSeting(false)}
          >
            Close
          </Button>
        </Grid>
      </Grid>
    );
  };

  const getCurrentSong = () => {
    fetch(`/spotify/current-song`)
      .then((res) => {
        if (res.status != 200) {
          return {};
        } else {
          return res.json();
        }
      })
      .then((data) => {
        console.log("getCurrentSong: ", data);
        setSong(data);
      });
  };

  useEffect(() => {
    getRoomDetail();
  }, []);

  useEffect(() => {
    getCurrentSong();
  }, []);

  useEffect(() => {
    const intervalId = setInterval(getCurrentSong, 100000);

    return () => {
      clearInterval(intervalId);
    };
  }, []);

  return isShowSetting ? (
    renderSettingPageContent()
  ) : (
    <Grid container spacing={1}>
      <Grid item xs={12} align="center">
        <Typography variant="h4" component="h4">
          Code: {roomCode}
        </Typography>
      </Grid>

      <MusicPlayer {...song} />

      {/* conditionally for showing setting button */}
      {isHost ? renderSettingButton() : null}

      <Grid item xs={12} align="center">
        <Button color="secondary" variant="contained" onClick={handleLeaveRoom}>
          Leave Room
        </Button>
      </Grid>
    </Grid>
  );
};

export default Room;
