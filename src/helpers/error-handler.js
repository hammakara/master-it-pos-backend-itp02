export const errorHandler = (err, req, res, next) => {
    let statusCode = 500
    let messgae = err.message || "Internal Server Error!"
    // development
    if (process.env.NODE_ENV !== "production") {
        res.status(statusCode).json({
            success: false,
            name: err.name,
            message: messgae,
            stack: err.stack
        })
    } else {
        res.status(statusCode).json({
            success: false,
            error: "Internal Server Error"
        })
    }
}

