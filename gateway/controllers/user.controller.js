import { errorResponse } from "../../shared/errorResponse.js";

export const getCurrentUser = async (req, res) => {
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
