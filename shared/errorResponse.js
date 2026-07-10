export const errorResponse = (res, statusCode, success, message) => {
  return res.status(statusCode).json({
    success,
    message,
  });
};
