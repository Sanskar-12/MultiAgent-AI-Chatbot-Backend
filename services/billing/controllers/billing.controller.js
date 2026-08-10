import axios from "axios";
import { errorResponse } from "../../../shared/errorResponse.js";
import { PLANS } from "../config/plans.js";
import razorpay from "../config/razorpay.js";
import { Payment } from "../model/payment.model.js";

export const createOrder = async (req, res) => {
  try {
    const userId = req.headers["x-user-id"];
    const { plan } = req.body;

    const selectedPlan = PLANS[plan];

    if (!selectedPlan) {
      return errorResponse(res, 404, false, `Plan not found`);
    }

    const order = await razorpay.orders.create({
      amount: selectedPlan.amount * 100,
      currency: "INR",
      receipt: `receipt-${Date.now()}`,
    });

    await Payment.create({
      userId,
      orderId: order?.id,
      amount: selectedPlan.amount,
      credits: selectedPlan.credits,
      plan: selectedPlan.id,
      currency: order.currency,
      status: "created",
    });

    return res.status(200).json({
      order,
      plan: selectedPlan,
    });
  } catch (error) {
    return errorResponse(
      res,
      500,
      false,
      `Internal Server Error ${error}  - (Billing createOrder Error)`,
    );
  }
};

export const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      req.body;

    const generateSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (generateSignature !== razorpay_signature) {
      return errorResponse(res, 400, false, `Payment Verification failed`);
    }

    const payment = await Payment.findOne({ orderId: razorpay_order_id });

    if (!payment) {
      return errorResponse(res, 404, false, `Payment not found`);
    }

    payment.status = "paid";
    payment.paymentId = razorpay_payment_id;

    await payment.save();

    await axios.put(`${process.env.AUTH_SERVICE}/update-plan`, {
      plan: payment.plan,
      credits: payment.credits,
      userId: payment.userId,
    });

    return res.status(200).json({
      success: true,
      message: "Payment verified",
    });
  } catch (error) {
    return errorResponse(
      res,
      500,
      false,
      `Internal Server Error ${error} - (Billing verifyPayment Error)`,
    );
  }
};
