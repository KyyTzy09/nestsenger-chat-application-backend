import { HttpStatus } from "@nestjs/common";
import { Response } from "express";

export class ResponseHelper {
    successResponse<T>(res: Response, message: string, data: T) {
        return res.status(HttpStatus.OK).json({
            message,
            statusCode: HttpStatus.OK,
            data
        })
    }

    createdResponse<T>(res: Response, message: string, data: T) {
        return res.status(HttpStatus.CREATED).json({
            message,
            statusCode: HttpStatus.CREATED,
            data
        })
    }
}