"use client";

import {
  LiveKitRoom,
  VideoConference,
} from "@livekit/components-react";

import "@livekit/components-styles";

interface LiveVideoRoomProps {
  token: string;
  serverUrl: string;
}

export default function LiveVideoRoom({
  token,
  serverUrl,
}: LiveVideoRoomProps) {

  return (
    <LiveKitRoom
      token={token}
      serverUrl={serverUrl}
      connect={true}
      video={true}
      audio={true}
      className="h-screen w-full"
    >
      <VideoConference />
    </LiveKitRoom>
  );
}
