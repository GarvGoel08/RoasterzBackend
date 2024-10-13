const Coupon = require('../Schemas/Coupons');
const express = require('express');
const router = express.Router();
const User = require('../Schemas/User');
const FetchUser = require('../middleware/FetchUser');
// Add, Get, Delete Coupons with their code (Complete code there is no seperate file for this)

router.post('/AddCoupon', FetchUser, async (req, res) => {
    try {
        const { couponCode, couponDiscount } = req.body;
        const user = await User.findById(req.userId);
        if (!user) {
            return res.status(400).json({ error: "User not found" });
        }
        if (!user.seller) {
            return res.status(400).json({ error: "You are not authorized to add coupons" });
        }
        const coupon = new Coupon({
            couponCode,
            couponDiscount
        });
        await coupon.save();
        res.json(coupon);
    } catch {
        return res.status(500).json({ error: "Internal Server Error" });
    }
});

router.get('/GetCoupons', FetchUser, async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        if (!user) {
            return res.status(400).json({ error: "User not found" });
        }
        if (!user.seller) {
            return res.status(400).json({ error: "You are not authorized to view coupons" });
        }
        const coupons = await Coupon.find();
        res.json(coupons);
    } catch {
        return res.status(500).json({ error: "Internal Server Error" });
    }
});


router.get('/GetCoupon/:couponCode', async (req, res) => {
    try {
        const coupon = await Coupon.findOne({ couponCode: req.params.couponCode });
        if (!coupon) {
            return res.status(400).json({ error: "Coupon not found" });
        }
        res.json(coupon);
    } catch {
        return res.status(500).json({ error: "Internal Server Error" });
    }
});

router.delete('/DeleteCoupon/:couponCode', FetchUser, async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        if (!user) {
            return res.status(400).json({ error: "User not found" });
        }
        if (!user.seller) {
            return res.status(400).json({ error: "You are not authorized to delete coupons" });
        }
        const coupon = await Coupon.findOneAndDelete({ couponCode: req.params.couponCode });
        if (!coupon) {
            return res.status(400).json({ error: "Coupon not found" });
        }
        res.json(coupon);
    } catch {
        return res.status(500).json({ error: "Internal Server Error" });
    }
}
);

module.exports = router;