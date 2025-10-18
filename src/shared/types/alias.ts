import { Friend, User } from "@prisma/client"

export type AliasType = {
    name: string
    userId: string
    avatar: string
}