/**
 * Middleware Penanganan Error Global
 */

function notFoundHandler(req, res, next) {
  res.status(404).json({
    success: false,
    message: `Endpoint tidak ditemukan: ${req.method} ${req.originalUrl}`
  });
}

function globalErrorHandler(err, req, res, next) {
  console.error("Unhandle Error:", err);
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || "Terjadi kesalahan internal pada server.",
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined
  });
}

module.exports = {
  notFoundHandler,
  globalErrorHandler
};
