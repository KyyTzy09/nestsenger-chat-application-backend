import { Chat, Friend, User } from "@prisma/client";

export type ChatWithAliasType = {
    chat: Chat,
    alias: Friend | Partial<User> | null
}