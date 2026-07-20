const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },
    gatewayOrderId: { type: String, required: true }, // Razorpay order_id
    paymentId: { type: String }, // Razorpay payment_id, set after success
    signature: { type: String },
    amount: { type: Number, required: true },
    currency: { type: String, default: "INR" },
    method: { type: String }, // card, upi, netbanking, etc.
    status: {
      type: String,
      enum: ["Pending", "Successful", "Failed", "Cancelled"],
      default: "Pending",
    },
  },
  { timestamps: true }
);

paymentSchema.index({ gatewayOrderId: 1 });

module.exports = mongoose.model("Payment", paymentSchema);
