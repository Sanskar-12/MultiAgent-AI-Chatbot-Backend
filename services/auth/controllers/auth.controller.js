import { getAuth } from "firebase-admin/auth";
import { app } from "../config/firebase.js";
import { User } from "../model/user.model.js";
import { errorResponse } from "../../../shared/errorResponse.js";
import redis from "../../../shared/redis/redis.js";

export const login = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return errorResponse(res, 404, false, "Token not found");
    }

    const decoded = await getAuth(app).verifyIdToken(token);

    let user = await User.findOne({
      firebaseUid: decoded.uid,
    });

    if (!user) {
      user = await User.create({
        firebaseUid: decoded.uid,
        name: decoded.name,
        email: decoded.email,
        avatar: decoded.picture,
      });
    }

    const sessionId = crypto.randomUUID();

    await redis.set(
      `session-${sessionId}`,
      JSON.stringify({
        userId: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
      }),
      "EX",
      7 * 24 * 60 * 60 * 1000,
    );

    res.cookie("session", sessionId, {
      httpOnly: true,
      secure: false,
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    return errorResponse(
      res,
      500,
      false,
      `Internal Server Error ${error}  - (Auth Service Login)`,
    );
  }
};

export const logout = async (req, res) => {
  try {
    const { session } = req.cookies;

    await redis.del(`session-${session}`);

    res.clearCookie("session");

    return res.status(200).json({
      success: true,
      message: "Logout Successfully",
    });
  } catch (error) {
    return errorResponse(
      res,
      500,
      false,
      `Internal Server Error ${error}  - (Auth Service Logout)`,
    );
  }
};
