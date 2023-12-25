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
}) => {
  const songProgress = (time / duration) * 100;
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
            <IconButton>
              {is_playing ? <Pause></Pause> : <PlayArrow></PlayArrow>}
            </IconButton>
            <IconButton>
              <SkipNext></SkipNext>
            </IconButton>
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
