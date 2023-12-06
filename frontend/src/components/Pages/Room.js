import React, { useState } from "react";

const Room = (props) => {
  const roomCode = props.match.params;

  const [votesToSkip, setVotesToSkip] = useState(2);
  const [guestCanPause, setGuestCanPause] = useState(false);
  const [isHost, setIsHost] = useState(false);
  return (
    <div>
      <h3>{this.roomCode}</h3>
      <p>Votes: {this.state.votesToSkip}</p>
      <p>Guest can pause: {this.state.guestCanPause}</p>
      <p>Host: {this.state.isHost}</p>
    </div>
  );
};

export default Room;
