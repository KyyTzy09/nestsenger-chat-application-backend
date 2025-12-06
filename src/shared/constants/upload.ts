import { join } from "path";

export const AVATAR_FIELD_NAME = "file"
export const AVATAR_UPLOAD_PATH = join(process.cwd(), "uploads/avatars")

export const MEDIA_FIELD_NAME = "media"
export const MEDIA_UPLOAD_PATH = join(process.cwd(), "uploads/media")

export const ROOM_AVATAR_FIELD_NAME = "avatar"
export const ROOM_AVATAR_PATH = join(process.cwd(), "uploads/rooms")