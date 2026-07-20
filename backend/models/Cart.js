const mongoose = require("mongoose");

const cartItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: [1, "Quantity must be at least 1"],
      default: 1,
    },
    // price snapshot at time of add, used for subtotal calc + shown to user
    price: {
      type: Number,
      required: true,
    },
  },
  { _id: false }
);

const cartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    items: [cartItemSchema],
  },
  { timestamps: true }
);

// Computed totals - not persisted, calculated on read via toJSON transform / service layer
cartSchema.methods.calculateTotals = function () {
  const subtotal = this.items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const tax = Math.round(subtotal * 0.18 * 100) / 100; // 18% GST example
  const deliveryFee = subtotal > 0 && subtotal < 500 ? 49 : 0;
  const total = Math.round((subtotal + tax + deliveryFee) * 100) / 100;

  return { subtotal, tax, deliveryFee, total };
};

module.exports = mongoose.model("Cart", cartSchema);
