// Run with: npm run seed
require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("../config/db");
const Product = require("../models/Product");

const sampleProducts = [
  {
    title: "Wireless Bluetooth Headphones",
    description: "Over-ear headphones with active noise cancellation and 30-hour battery life.",
    price: 2999,
    category: "Electronics",
    stock: 50,
    images: ["https://images.unsplash.com/photo-1505740420928-5e560c06d30e"],
    rating: 4.5,
  },
  {
    title: "Smart Fitness Watch",
    description: "Tracks heart rate, sleep, and workouts with a 7-day battery life.",
    price: 4499,
    category: "Electronics",
    stock: 35,
    images: ["https://images.unsplash.com/photo-1523275335684-37898b6baf30"],
    rating: 4.2,
  },
  {
    title: "Cotton Casual T-Shirt",
    description: "Breathable 100% cotton t-shirt, available in multiple colors.",
    price: 599,
    category: "Fashion",
    stock: 200,
    images: ["https://images.unsplash.com/photo-1521572163474-6864f9cf17ab"],
    rating: 4.0,
  },
  {
    title: "Stainless Steel Water Bottle",
    description: "Insulated bottle that keeps drinks cold for 24 hours or hot for 12 hours.",
    price: 799,
    category: "Home & Kitchen",
    stock: 150,
    images: ["https://images.unsplash.com/photo-1602143407151-7111542de6e8"],
    rating: 4.7,
  },
  {
    title: "Ergonomic Office Chair",
    description: "Adjustable lumbar support and breathable mesh back for long work hours.",
    price: 8999,
    category: "Furniture",
    stock: 20,
    images: ["https://images.unsplash.com/photo-1580480055273-228ff5388ef8"],
    rating: 4.3,
  },
  {
    title: "Mechanical Gaming Keyboard",
    description: "RGB backlit keyboard with hot-swappable switches.",
    price: 3499,
    category: "Electronics",
    stock: 40,
    images: ["https://images.unsplash.com/photo-1587829741301-dc798b83add3"],
    rating: 4.6,
  },
  {
    title: "Yoga Mat",
    description: "Non-slip 6mm thick mat, ideal for yoga and home workouts.",
    price: 899,
    category: "Sports",
    stock: 100,
    images: ["https://images.unsplash.com/photo-1592432678016-e910b452f9a2"],
    rating: 4.4,
  },
  {
    title: "Ceramic Coffee Mug Set (4-piece)",
    description: "Microwave and dishwasher safe, 300ml capacity each.",
    price: 999,
    category: "Home & Kitchen",
    stock: 80,
    images: ["https://images.unsplash.com/photo-1514228742587-6b1558fcca3d"],
    rating: 4.1,
  },
];

const seed = async () => {
  await connectDB();
  await Product.deleteMany({});
  await Product.insertMany(sampleProducts);
  console.log(`Seeded ${sampleProducts.length} products`);
  await mongoose.disconnect();
  process.exit(0);
};
module.exports = { sampleProducts };

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
