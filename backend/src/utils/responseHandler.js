export class ApiResponse {
    constructor(success, message, data = null, statusCode = 200) {
        this.success = success;
        this.message = message;
        this.data = data;
        this.statusCode = statusCode;
        this.timestamp = new Date().toISOString();
    }

    static success(message, data = null, statusCode = 200) {
        return new ApiResponse(true, message, data, statusCode)
    }
    static error(message, statusCode = 500, data = null, ) {
        return new ApiResponse(false, message, data, statusCode)
    }
}