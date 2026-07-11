export const getCurrentUser = async () => {
  try {
    return res.status(200).json({
      success: true,
      user: req.user,
    });
  } catch (error) {
    return errorResponse(
      res,
      500,
      false,
      `Internal Server Error ${error}  - (Gateway getCurrentUser Error)`,
    );
  }
};
