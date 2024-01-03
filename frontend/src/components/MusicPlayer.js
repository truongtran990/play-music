import React from "react";
import {
  Grid,
  Typography,
  Card,
  IconButton,
  LinearProgress,
} from "@mui/material";
import { PlayArrow, SkipNext, Pause } from "@mui/icons-material";

const MusicPlayer = ({
  title,
  image_url,
  artist,
  is_playing,
  time,
  duration,
  votes,
  needed_votes_to_skip,
}) => {
  const songProgress = (time / duration) * 100;

  const skipSong = () => {
    const requestOptions = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    };

    try {
      fetch("/spotify/skip-song/", requestOptions);
    } catch (error) {
      console.error(error);
    }
  };

  const pauseSong = () => {
    const requestOptions = {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
    };

    fetch("/spotify/pause-song/", requestOptions);
  };

  const playSong = () => {
    const requestOptions = {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
    };

    fetch("/spotify/play-song/", requestOptions);
  };
  return (
    <Card>
      <Grid container alignItems="center">
        <Grid item align="center" xs={4}>
          <img src={image_url} width="100%" height="100%"></img>
        </Grid>
        <Grid item align="center" xs={8}>
          <Typography component="h5" variant="h5">
            {title}
          </Typography>
          <Typography color="textSecondary" variant="subtitle1">
            {artist}
          </Typography>
          <div>
            <IconButton
              onClick={() => {
                is_playing ? pauseSong() : playSong();
              }}
            >
              {is_playing ? <Pause></Pause> : <PlayArrow></PlayArrow>}
            </IconButton>
            <IconButton onClick={skipSong}>
              <SkipNext />
            </IconButton>
            <Typography>{`${votes} / ${needed_votes_to_skip}`}</Typography>
          </div>
        </Grid>
      </Grid>
      <LinearProgress
        variant="determinate"
        value={songProgress}
      ></LinearProgress>
    </Card>
  );
};

export default MusicPlayer;
