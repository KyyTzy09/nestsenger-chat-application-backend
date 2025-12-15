import { Friend, User } from "@prisma/client"

export type AliasType = {
    alias: string
    userId: string
    avatar: string
    email?: string
    userName?: string
    bio?: string
    isOnline?: boolean
}