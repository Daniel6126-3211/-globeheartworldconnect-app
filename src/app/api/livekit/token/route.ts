import { NextResponse } from "next/server";
import {
  AccessToken,
} from "livekit-server-sdk";

import { createClient } from "@/lib/supabase/server";

export async function POST(
  request: Request
) {
  const supabase =
    await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      {
        error: "Unauthorized",
      },
      {
        status: 401,
      }
    );
  }

  const body =
    await request.json();

  const roomName =
    body.roomName;

  if (
    typeof roomName !== "string" ||
    roomName.length < 1
  ) {
    return NextResponse.json(
      {
        error:
          "Room name required",
      },
      {
        status: 400,
      }
    );
  }

  const accessToken =
    new AccessToken(
      process.env.LIVEKIT_API_KEY!,
      process.env.LIVEKIT_API_SECRET!,
      {
        identity: user.id,
        name:
          user.user_metadata
            ?.full_name ||
          user.email ||
          user.id,
      }
    );

  accessToken.addGrant({
    roomJoin: true,
    room: roomName,
    canPublish: true,
    canSubscribe: true,
  });

  const token =
    await accessToken.toJwt();

  return NextResponse.json({
    token,
    serverUrl:
      process.env
        .NEXT_PUBLIC_LIVEKIT_URL,
  });
        }
