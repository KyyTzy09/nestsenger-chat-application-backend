import { Friend, User } from "@prisma/client"

export type AliasType = {
    alias: Friend | Partial<User> | null
}