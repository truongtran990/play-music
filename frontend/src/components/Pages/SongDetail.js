import React from "react";

const SongDetail = () => {
  const requestOptions = {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  };
  fetch(`/spotify/current-song`, requestOptions)
    .then((res) => {
      if (res.ok) {
        console.log("/spotify/current-song", res);
      } else {
        console.error(res);
      }
    })
    .catch((err) => {
      console.error(err);
    });
  return <div>SongDetail</div>;
};

export default SongDetail;
