import { Chat } from "@prisma/client";
import { format } from "date-fns";
import { AliasType } from "../types/alias";

export function ChatGrouper(data: { chat: Chat, user: AliasType }[]) {
    return data.reduce((acc, data) => {
        const dateKey = format(new Date(data?.chat?.createdAt!), "MM/dd/yyyy");

        if (!acc[dateKey]) {
            acc[dateKey] = [];
        }

        acc[dateKey].push({
            chat: data.chat!,
            user: data.user
        });

        return acc;
    }, {} as Record<string, { chat: Chat; user: AliasType }[]>)
}