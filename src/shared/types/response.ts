export type ResponseType<T> = {
    message: string
    statusCode: number,
    data: T
}