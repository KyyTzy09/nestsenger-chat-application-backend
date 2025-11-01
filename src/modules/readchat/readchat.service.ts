import { Injectable } from "@nestjs/common";
import { ReadChatRepository } from "./readchat.repository";

@Injectable()
export class ReadChatService {
    constructor(private readonly readChatRepository: ReadChatRepository) { }

    
}