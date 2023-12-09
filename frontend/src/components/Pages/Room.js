import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";

const Room = (props) => {
  const { roomCode } = useParams();

  const [votesToSkip, setVotesToSkip] = useState(2);
  const [guestCanPause, setGuestCanPause] = useState(false);
  const [isHost, setIsHost] = useState(false);

  const getRoomDetail = () => {
    const url = `/api/get-room/?code=${roomCode}`;
    fetch(url)
      .then((res) => {
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

  useEffect(() => {
    getRoomDetail();
  }, []);

  return (
    <div>
      <h3>{roomCode}</h3>
      <p>Votes: {votesToSkip}</p>
      <p>Guest can pause: {guestCanPause.toString()}</p>
      <p>Host: {isHost.toString()}</p>
    </div>
  );
};

export default Room;
