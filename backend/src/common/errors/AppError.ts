

export class AppError extends Error {
    public readonly statuscode: number;

    constructor(message: string, statuscode: number){
        super(message);

        this.statuscode = statuscode;

        Error.captureStackTrace(this, this.constructor);
    }
}