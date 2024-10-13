const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
// const Razorpay = require("razorpay");
const crypto = require('crypto');
require("dotenv").config();

const Item = require('../Schemas/Item');
const Order = require("../Schemas/Order.js");
const FetchUser = require("../middleware/FetchUser.js");
const Coupons = require("../Schemas/Coupons.js");
const User = require("../Schemas/User.js");
// const razorpay = new Razorpay({
//   key_id: process.env.RP_KEY,
//   key_secret: process.env.RP_SECRET,
// });

router.get('/get-orders', FetchUser, async(req,res) => {
  const userId = req.user.id;
  const orders = await Order.find({
    UserID: new mongoose.Types.ObjectId(userId),
  });
  return res.json(orders);
})

router.post("/create-order", FetchUser, async (req, res) => {
  try {
    const { items, addressId, paymentMethod, couponCode } = req.body;
    const userId = req.user.id;
    let orderDate;
    let orderAmount = 0;

    items.forEach((item) => {
      orderAmount +=
        item.quantity * 100 * (item.price - (item.price * item.discount) / 100);
    });

    let couponDisc = 0;
    if (couponCode) {
      const coupon = await Coupons.findOne({ couponCode });
      if (coupon) {
        couponDisc = coupon.couponDiscount;
      }
    }


    if (paymentMethod === "razorpay") {

      // const razorpayOrder = await createRazorpayOrder(orderAmount);

      res.status(201).json({
        message: "Razorpay Not Configured Yet.. Coming Soon",
        razorpayOrder: razorpayOrder,
      });
    } else if (paymentMethod === "cod") {
      orderDate = new Date();
      const order = new Order({
        UserID: new mongoose.Types.ObjectId(userId),
        OrderDate: orderDate,
        Items: items.map((item) => ({
          item: new mongoose.Types.ObjectId(item._id),
          quantity: item.quantity,
          // Calculate Coupon Discount and subtract from price
          pricePerItem: item.price - (item.price * item.discount) / 100 - ((item.price - (item.price * item.discount) / 100) * couponDisc) / 100,
        })),
        Address: addressId,
        COD: true,
        OrderStatus: "Order Placed",
      });

      await order.save();

      for (const item of items) {
        const updatedItem = await Item.findByIdAndUpdate(
          item._id,
          {
            $inc: { quantity: -item.quantity },
          },
          { new: true }
        );
      }

      res.status(201).json({
        message: "Order created successfully.",
      });
    } else {
      return res.status(400).json({ message: "Invalid payment method." });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error." });
  }
});

async function createRazorpayOrder(orderAmount) {
  return new Promise((resolve, reject) => {
    razorpay.orders.create(
      {
        amount: orderAmount,
        currency: "INR",
        receipt: "order_receipt",
        payment_capture: 1,
      },
      (error, order) => {
        if (error) {
          console.error(error);
          reject("error");
        } else {
          resolve(order);
        }
      }
    );
  });
}

// router.post("/paymentverification", FetchUser,async(req,res)=>{
//   const { items, addressId, paymentMethod } = req.body;
//   const userId = req.user.id;
//   const razorpay_order_id = req.header('razorpay_order_id')
//   const razorpay_signature = req.header('razorpay_signature')
//   const razorpay_payment_id = req.header('razorpay_payment_id')
//   const body = razorpay_order_id + "|" + razorpay_payment_id;
//   const expectedsgnature =crypto.createHmac('sha256',process.env.RP_SECRET).update(body.toString()).digest('hex')
//   const isauth = expectedsgnature === razorpay_signature;
//   if(isauth){
//     orderDate = new Date();
//     const order = new Order({
//       UserID: new mongoose.Types.ObjectId(userId),
//       OrderDate: orderDate,
//       Items: items.map((item) => ({
//         item: new mongoose.Types.ObjectId(item._id),
//         quantity: item.quantity,
//         pricePerItem: item.price,
//       })),
//         Address: addressId,
//         COD: false,
//       OrderStatus: "Order Placed",
//     });
//     await order.save();

//     for (const item of items) {
//       const updatedItem = await Item.findByIdAndUpdate(
//         item._id,
//         {
//           $inc: { quantity: -item.quantity },
//         },
//         { new: true }
//       );
//     }
   
//     res.status(201).json({success:true});
//   }
//   else{
//    res.status(400).json({success:false});
//   }
// })

// Get All Orders for Admin
router.get("/get-all-orders", FetchUser, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(400).json({ error: "User not found" });
    }
    if (!user.seller)
      return res.status(400).json({ error: "You are not authorized to view orders" });
    const orders = await Order.find();
    return res.json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error." });
  }
});

// Update Order Status
router.put("/update-order-status", FetchUser, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(400).json({ error: "User not found" });
    }
    if (!user.seller)
      return res.status(400).json({ error: "You are not authorized to update orders" });
    const { orderId, status } = req.body;
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(400).json({ error: "Order not found" });
    }
    order.OrderStatus = status;
    await order.save();
    return res.json({ message: "Order status updated successfully." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error." });
  }
});

module.exports = router;
