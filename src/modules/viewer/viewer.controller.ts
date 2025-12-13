import { Controller } from "@nestjs/common";
import { ViewerService } from "./viewer.service";

@Controller("viewer")
export class ViewerController {
    constructor(private readonly viewerService: ViewerService) { }

}