import { Controller } from "@nestjs/common";
import { ReadChatService } from "./readchat.service";

@Controller("readchat")
export class ReadChatController {
    constructor(private readonly readChatService: ReadChatService) { }


}