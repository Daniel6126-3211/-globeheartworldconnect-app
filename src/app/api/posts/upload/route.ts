import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const MAX_SIZE = 10 * 1024 * 1024;

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

export async function POST(
  request: Request
) {
  try {
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

    const formData =
      await request.formData();

    const file =
      formData.get("file");

    const caption =
      formData.get("caption");

    if (!(file instanceof File)) {
      return NextResponse.json(
        {
          error: "Photo is required",
        },
        {
          status: 400,
        }
      );
    }

    if (
      !ALLOWED_TYPES.includes(
        file.type
      )
    ) {
      return NextResponse.json(
        {
          error:
            "Only JPG, PNG and WebP images are allowed",
        },
        {
          status: 400,
        }
      );
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        {
          error:
            "Maximum image size is 10MB",
        },
        {
          status: 400,
        }
      );
    }

    const extension =
      file.name
        .split(".")
        .pop()
        ?.toLowerCase() || "jpg";

    const filePath =
      `${user.id}/${crypto.randomUUID()}.${extension}`;

    const buffer =
      await file.arrayBuffer();

    const {
      error: uploadError,
    } = await supabase.storage
      .from("profile-media")
      .upload(
        filePath,
        buffer,
        {
          contentType:
            file.type,
          upsert: false,
        }
      );

    if (uploadError) {
      throw uploadError;
    }

    const {
      data: publicFile,
    } =
      supabase.storage
        .from("profile-media")
        .getPublicUrl(
          filePath
        );

    const {
      error: postError,
    } = await supabase
      .from("posts")
      .insert({
        user_id: user.id,
        image_url:
          publicFile.publicUrl,
        storage_path:
          filePath,
        caption:
          typeof caption === "string"
            ? caption
            : null,
      });

    if (postError) {
      throw postError;
    }

    return NextResponse.json({
      success: true,
      imageUrl:
        publicFile.publicUrl,
    });

  } catch (error) {

    console.error(
      "PHOTO_UPLOAD_ERROR",
      error
    );

    return NextResponse.json(
      {
        error:
          "Photo upload failed",
      },
      {
        status: 500,
      }
    );
  }
}
