/**
 * Global error handler middleware
 */
export function errorHandler(err, req, res, next) {
  console.error('Error:', err);

  // Determine status code
  const statusCode = err.statusCode || 500;

  // Send user-friendly error message
  res.status(statusCode).json({
    error: err.message || 'An unexpected error occurred',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
}

/**
 * Handle 404 routes
 */
export function notFoundHandler(req, res) {
  res.status(404).json({ error: 'Route not found' });
}
