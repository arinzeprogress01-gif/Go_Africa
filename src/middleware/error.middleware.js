export const errorHandler = (err, _req, res, _next) => {
  const statusCode = err.statusCode || (err.name === "ValidationError" ? 400 : 500);
  if (statusCode >= 500) console.error(err);
  res.status(statusCode).json({
    success: false,
    message: statusCode >= 500 ? "An unexpected server error occurred." : err.message,
    ...(err.details ? { details: err.details } : {})
  });
};
