import { errorResponse } from "../../shared/errorResponse.js";
import redis from "../../shared/redis/redis.js";

export const protect = async (req, res, next) => {
  try {
    const { session } = req.cookies;

    if (!session) {
      return errorResponse(res, 400, false, "Unauthorized");
    }

    const sessionData = await redis.get(`session-${session}`);

    if (!sessionData) {
      return errorResponse(res, 400, false, "Session Expired");
    }

    req.user = JSON.parse(sessionData);

    next();
  } catch (error) {
    return errorResponse(
      res,
      500,
      false,
      `Internal Server Error ${error}  - (Auth middleware Error)`,
    );
  }
};
