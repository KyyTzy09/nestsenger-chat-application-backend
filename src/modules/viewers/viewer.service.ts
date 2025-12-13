import { Injectable } from "@nestjs/common";
import { ViewerRepository } from "./viewer.repository";
import { StatusRepository } from "../status/status.repository";

@Injectable()
export class ViewerService {
    constructor(private readonly viewerRepository: ViewerRepository, private readonly statusRepository: StatusRepository) { }

    
}