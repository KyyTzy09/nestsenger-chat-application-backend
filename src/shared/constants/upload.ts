import { Request } from "express";
import { join } from "path";

export const API_BASE_URL = (req: Request) => { return `${req.protocol}://${req.get('host')}` };

export const AVATAR_FIELD_NAME = "file"
export const AVATAR_UPLOAD_PATH = join(process.cwd(), "uploads/avatars")

export const MEDIA_FIELD_NAME = "media"
export const MEDIA_UPLOAD_PATH = join(process.cwd(), "uploads/media")

export const ROOM_AVATAR_FIELD_NAME = "avatar"
export const ROOM_AVATAR_PATH = join(process.cwd(), "uploads/rooms")

export const STATUS_FIELD_NAME = "media"
export const STATuS_UPLOAD_PATH = join(process.cwd(), "uploads/status")
