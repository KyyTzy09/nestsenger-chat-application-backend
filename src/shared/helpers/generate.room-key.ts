import * as crypto from "crypto"

export function generatePrivateRoomId(data: { userIdA: string, userIdB: string, }): string {
    // Normalized RoomId
    const sorted = [data.userIdA, data.userIdB].sort().join("-")
    // Hash
    return crypto.createHash("sha256").update(sorted).digest("base64url").slice(0, 11)
}

export function generateGroupRoomId(): string {
    return crypto.randomBytes(16).toString("base64url").slice(0, 11)
}