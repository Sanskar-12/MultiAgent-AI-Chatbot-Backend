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
        plan: "free",
        credits: 100,
        totalCredits: 100,
        planExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
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
        plan: user.plan,
        credits: user.credits,
        totalCredits: user.totalCredits,
        planExpiresAt: user.planExpiresAt,
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

export const updateUserPayment = async (req, res) => {
  try {
    const { plan, credits, userId } = req.body;

    const user = await User.findById(userId);

    if (!userId) {
      return errorResponse(res, 404, false, `User not found`);
    }

    user.plan = plan;
    user.credits = user.credits + credits;
    user.totalCredits = user.totalCredits + credits;
    user.planExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    await user.save();

    const { session } = req.cookies;

    // updating the user session in redis
    await redis.set(
      `session-${session}`,
      JSON.stringify({
        userId: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        plan: user.plan,
        credits: user.credits,
        totalCredits: user.totalCredits,
        planExpiresAt: user.planExpiresAt,
      }),
      "EX",
      7 * 24 * 60 * 60 * 1000,
    );

    return res.status(200).json({
      success: true,
      message: "User payment details updated",
    });
  } catch (error) {
    return errorResponse(
      res,
      500,
      false,
      `Internal Server Error ${error}  - (Auth Service updateUserPayment)`,
    );
  }
};

export const deductCredits = async (req, res) => {
  try {
    const { userId, agent } = req.body;

    const COST = {
      chat: 1,
      search: 5,
      coding: 10,
      pdf: 10,
      ppt: 10,
      imageGen: 10,
    };

    const user = await User.findById(userId);

    if (!user) {
      return errorResponse(res, 404, false, "User not found");
    }

    const requiredCredits = COST[agent] || 1;

    if (user.credits < requiredCredits) {
      return errorResponse(res, 400, false, "Not enough Credits");
    }

    user.credits = user.credits - requiredCredits;

    await user.save();

    const { session } = req.cookies;

    // updating the user session in redis
    await redis.set(
      `session-${session}`,
      JSON.stringify({
        userId: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        plan: user.plan,
        credits: user.credits,
        totalCredits: user.totalCredits,
        planExpiresAt: user.planExpiresAt,
      }),
      "EX",
      7 * 24 * 60 * 60 * 1000,
    );

    return res.status(200).json({
      success: true,
      credits: user.credits,
      message: "Credits Deducted",
    });
  } catch (error) {
    return errorResponse(
      res,
      500,
      false,
      `Internal Server Error ${error}  - (Auth Service deductCredits)`,
    );
  }
};
