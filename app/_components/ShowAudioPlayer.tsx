"use client";

import React from "react";
import AudioPlayer from "./AudioPlayer";

type Props = {
  children: React.ReactNode;
};

function ShowAudioPlayer({ children }: Props) {
  return (
    <>
      {children}
      <AudioPlayer />
    </>
  );
}

export default ShowAudioPlayer;
