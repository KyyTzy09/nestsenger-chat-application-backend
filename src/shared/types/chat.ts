import { Chat, Friend, User } from "@prisma/client";

export type ChatWithAliasType = {
    chat: Chat,
    user: Friend | Partial<User> | null
}