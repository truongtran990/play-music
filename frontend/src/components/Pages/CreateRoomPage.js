import React, { useState } from "react";
import {
  Button,
  Grid,
  Typography,
  TextField,
  FormHelperText,
  FormControl,
  Radio,
  RadioGroup,
  FormControlLabel,
  Collapse,
  Alert,
} from "@mui/material";
import { Link, useNavigate } from "react-router-dom";

const defaultCreateRoomPageProps = {
  votesToSkip: 2,
  guestCanPause: true,
  update: false,
  roomCode: null,
  updateCallBack: () => {},
};

const CreateRoomPage = (props) => {
  const defaultVotes = 2;

  const [guestCanPause, setGuestCanPause] = useState(
    props.guestCanPause || defaultCreateRoomPageProps.guestCanPause
  );
  const [votesToSkip, setVotesToSkip] = useState(
    props.votesToSkip || defaultCreateRoomPageProps.votesToSkip
  );
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const navigate = useNavigate();

  const handleVotesChange = (e) => {
    setVotesToSkip(e.target.value);
  };

  const handleGuestCanPauseChange = (e) => {
    const newValue = e.target.value === "true" ? true : false;
    setGuestCanPause(newValue);
  };

  const handleCreateRoomButtonPress = (e) => {
    console.log(votesToSkip);
    console.log(guestCanPause);
    const requestOptions = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      /* convert javascript object to json that can be sent over network */
      body: JSON.stringify({
        votes_to_skip: votesToSkip,
        guest_can_pause: guestCanPause,
      }),
    };

    // send post request to backend
    fetch(`/api/create-room/`, requestOptions)
      .then((response) => {
        return response.json();
      })
      .then((data) => {
        console.log(data);
        navigate(`/room/${data.code}`);
      });
  };

  const handleUpdateRoomButtonPress = (e) => {
    const requestOptions = {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      /* convert javascript object to json that can be sent over network */
      body: JSON.stringify({
        votes_to_skip: votesToSkip,
        guest_can_pause: guestCanPause,
        code: props.roomCode,
      }),
    };

    // send post request to backend
    fetch(`/api/update-room/`, requestOptions).then((response) => {
      if (response.ok) {
        setSuccessMessage("Room updated successfully!");
      } else {
        setErrorMessage("Error updating room...");
      }

      props.updateCallBack();
    });
  };

  const title = props.update ? "Update Room" : "Creat Room";

  const renderCreateButtons = () => {
    return (
      <Grid container spacing={1}>
        <Grid item xs={12} align="center">
          <Button
            color="primary"
            variant="contained"
            onClick={handleCreateRoomButtonPress}
          >
            Create a Room
          </Button>
        </Grid>
        <Grid item xs={12} align="center">
          {/* Button below will act as a Link when we passing the component={Link} */}
          <Button color="secondary" variant="contained" to="/" component={Link}>
            Back
          </Button>
        </Grid>
      </Grid>
    );
  };

  const renderUpdateButtons = () => {
    return (
      <Grid item xs={12} align="center">
        <Button
          color="primary"
          variant="contained"
          onClick={handleUpdateRoomButtonPress}
        >
          Update Room
        </Button>
      </Grid>
    );
  };

  return (
    <Grid container spacing={1}>
      <Grid item xs={12} align="center">
        <Collapse in={errorMessage != "" || successMessage != ""}>
          {successMessage != "" && (
            <Alert severity="success" onClose={() => setSuccessMessage("")}>
              {successMessage}
            </Alert>
          )}
          {errorMessage != "" && (
            <Alert severity="error" onClose={() => setErrorMessage("")}>
              {errorMessage}
            </Alert>
          )}
        </Collapse>
      </Grid>
      <Grid item xs={12} align="center">
        <Typography component="h4" variant="h4">
          {title}
        </Typography>
      </Grid>
      <Grid item xs={12} align="center" className="xxx">
        <FormControl component="fieldset">
          <FormHelperText>
            <p align="center">Guest Control of Playback State</p>
          </FormHelperText>
          <RadioGroup row defaultValue={props.guestCanPause.toString()}>
            <FormControlLabel
              value="true"
              control={<Radio color="primary"></Radio>}
              label="Play/Pause"
              labelPlacement="bottom"
              onChange={handleGuestCanPauseChange}
            ></FormControlLabel>
            <FormControlLabel
              value="false"
              control={<Radio color="secondary"></Radio>}
              label="No Control"
              labelPlacement="bottom"
              onChange={handleGuestCanPauseChange}
            ></FormControlLabel>
          </RadioGroup>
        </FormControl>
      </Grid>
      <Grid item xs={12} align="center">
        <FormControl>
          <TextField
            required
            type="number"
            defaultValue={votesToSkip}
            inputProps={{ min: 1, style: { textAlign: "center" } }}
            onChange={handleVotesChange}
          ></TextField>
          <FormHelperText>
            <span align="center">Votes required to skip song</span>
          </FormHelperText>
        </FormControl>
      </Grid>

      {props.update ? renderUpdateButtons() : renderCreateButtons()}
    </Grid>
  );
};

export default CreateRoomPage;
